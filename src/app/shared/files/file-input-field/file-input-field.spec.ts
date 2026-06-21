import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { FileInputField } from './file-input-field';
import { FileBlobService, FileMetadataI } from '../services/file-blob.service';

const uploadSpy = vi.fn();
const deleteFileSpy = vi.fn();
const getObjectUrlSpy = vi.fn();

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
}

class FakeFileBlobService {
  upload = uploadSpy;
  deleteFile = deleteFileSpy;
  getObjectUrl = getObjectUrlSpy;
  progress = signal(new Map<string, { loaded: number; total: number; pct: number }>());
}

const baseMetadata = (id: string, name = 'x.png'): FileMetadataI & { id: string } => ({
  id,
  name,
  size: 10,
  mimeType: 'image/png',
  chunkCount: 1,
  updatedAt: 1,
  tags: [],
  createdAt: 1,
});

describe('FileInputField', () => {
  let fixture: ComponentFixture<FileInputField>;
  let component: FileInputField;

  beforeEach(async () => {
    uploadSpy.mockReset();
    deleteFileSpy.mockReset();
    getObjectUrlSpy.mockReset();

    await TestBed.configureTestingModule({
      imports: [FileInputField],
      providers: [{ provide: FileBlobService, useClass: FakeFileBlobService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inputId', 'file-input');
    fixture.detectChanges();
  });

  function makeFile(name: string, type: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], name, { type });
  }

  function addFiles(files: File[]): void {
    (component as unknown as { _addFiles: (f: File[]) => void })._addFiles(files);
  }

  it('rejects files larger than maxSize', () => {
    fixture.componentRef.setInput('maxSize', 5);
    fixture.detectChanges();

    const errors: string[] = [];
    component.invalid.subscribe((m) => errors.push(m));

    addFiles([makeFile('big.png', 'image/png', 100)]);

    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('excede el tamaño');
    expect(component['items']().length).toBe(0);
  });

  it('rejects files that do not match the accept pattern', () => {
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();

    const errors: string[] = [];
    component.invalid.subscribe((m) => errors.push(m));

    addFiles([makeFile('doc.pdf', 'application/pdf', 10)]);

    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('no coincide con los tipos');
  });

  it('uploads a single file and emits value when done', async () => {
    uploadSpy.mockImplementation((file: File) => Promise.resolve(baseMetadata('doc-1')));
    fixture.detectChanges();

    const emitted: (readonly FileMetadataI[] | null)[] = [];
    component.value.subscribe((v) => emitted.push(v));

    addFiles([makeFile('a.png', 'image/png', 10)]);

    expect(component['items']().length).toBe(1);
    expect(component['items']()[0].status).toBe('uploading');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['items']()[0].status).toBe('done');
    expect(component['items']()[0].metadata?.id).toBe('doc-1');
    expect(emitted.at(-1)?.[0]?.id).toBe('doc-1');
  });

  it('marks the item as error when upload fails', async () => {
    uploadSpy.mockRejectedValue(new Error('boom'));
    fixture.detectChanges();

    addFiles([makeFile('a.png', 'image/png', 10)]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['items']()[0].status).toBe('error');
    expect(component['items']()[0].error).toBe('boom');
  });

  it('removeItem calls deleteFile for remote items and removes from list', async () => {
    deleteFileSpy.mockResolvedValue(undefined);
    uploadSpy.mockResolvedValue(baseMetadata('doc-1', 'r.png'));
    fixture.detectChanges();

    addFiles([makeFile('r.png', 'image/png', 10)]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component['items']().length).toBe(1);

    const item = component['items']()[0];
    await (component as unknown as { removeItem: (i: typeof item) => Promise<void> }).removeItem(
      item,
    );

    expect(deleteFileSpy).toHaveBeenCalledWith('files', 'doc-1');
    expect(component['items']().length).toBe(0);
  });

  it('does not delete from storage when removing a local item', async () => {
    uploadSpy.mockImplementation(
      () =>
        new Promise(() => {
          // never resolves
        }),
    );
    fixture.detectChanges();

    addFiles([makeFile('a.png', 'image/png', 10)]);
    expect(component['items']()[0].kind).toBe('local');

    await (component as unknown as { removeItem: (i: unknown) => Promise<void> }).removeItem(
      component['items']()[0],
    );

    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(component['items']().length).toBe(0);
  });

  it('respects maxFiles when multiple is true', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('maxFiles', 2);
    fixture.detectChanges();

    uploadSpy.mockResolvedValue(baseMetadata('doc-x'));
    addFiles([
      makeFile('a.png', 'image/png', 1),
      makeFile('b.png', 'image/png', 1),
      makeFile('c.png', 'image/png', 1),
    ]);

    expect(component['items']().length).toBe(2);
  });

  it('in single mode, adding a new file replaces the previous one', async () => {
    let counter = 0;
    uploadSpy.mockImplementation(() => {
      counter += 1;
      return Promise.resolve(baseMetadata(`doc-${counter}`, `${counter === 1 ? 'a' : 'b'}.png`));
    });
    fixture.detectChanges();

    addFiles([makeFile('a.png', 'image/png', 1)]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component['items']().length).toBe(1);

    addFiles([makeFile('b.png', 'image/png', 1)]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component['items']().length).toBe(1);
    expect(component['items']()[0].metadata?.name).toBe('b.png');
  });

  it('onDrop accepts files from a DataTransfer', () => {
    uploadSpy.mockResolvedValue(baseMetadata('doc-1'));
    fixture.detectChanges();

    const file = makeFile('drop.png', 'image/png', 5);
    const dataTransfer = {
      files: [file],
      items: [],
      types: ['Files'],
    } as unknown as DataTransfer;

    const event = {
      preventDefault: vi.fn(),
      dataTransfer,
    } as unknown as DragEvent;
    (component as unknown as { onDrop: (e: DragEvent) => void }).onDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component['items']().length).toBe(1);
  });

  it('onKeydown opens picker on Enter and Space', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    const focusSpy = vi.fn();
    const original = input.click;
    input.click = focusSpy;

    (component as unknown as { onKeydown: (e: KeyboardEvent) => void }).onKeydown({
      key: 'Enter',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    (component as unknown as { onKeydown: (e: KeyboardEvent) => void }).onKeydown({
      key: ' ',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(focusSpy).toHaveBeenCalledTimes(2);
    input.click = original;
  });
});
