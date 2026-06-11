import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { UiViewFile } from './ui-view-file';
import { FileBlobService } from '../../files/services/file-blob.service';
import { VaultSecurity } from '../../security';
import { ToastService } from '../../service/toast';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

if (typeof URL.createObjectURL !== 'function') {
  (URL as { createObjectURL: typeof URL.createObjectURL }).createObjectURL = vi.fn(
    () => 'blob:fake',
  ) as typeof URL.createObjectURL;
}
if (typeof URL.revokeObjectURL !== 'function') {
  (URL as { revokeObjectURL: typeof URL.revokeObjectURL }).revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
}

class FakeBlob {
  getBytes = vi.fn().mockResolvedValue(new TextEncoder().encode('hello world'));
}

class FakeVault {
  isUnlocked = vi.fn().mockReturnValue(true);
  getVaultKey = vi.fn();
  showModal = vi.fn();
}

class FakeToast {
  error = vi.fn();
}

describe('UiViewFile', () => {
  let fixture: ComponentFixture<UiViewFile>;
  let component: UiViewFile;

  const file = () => ({
    id: 'a',
    name: 'doc.txt',
    mimeType: 'text/plain',
    size: 11,
    chunkCount: 1,
    updatedAt: 1,
    tags: [],
    createdAt: 1,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiViewFile],
      providers: [
        { provide: FileBlobService, useClass: FakeBlob },
        { provide: VaultSecurity, useClass: FakeVault },
        { provide: ToastService, useClass: FakeToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UiViewFile);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('file', null);
    fixture.componentRef.setInput('namespace', 'files' as const);
    fixture.detectChanges();
  });

  it('detects preview kind by mime type', () => {
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('image/png')).toBe('image');
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('video/mp4')).toBe('video');
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('audio/mp3')).toBe('audio');
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('application/pdf')).toBe('pdf');
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('text/plain')).toBe('text');
    expect((component as unknown as { _detectKind: (m: string) => string })._detectKind('application/zip')).toBe('unsupported');
  });

  it('loads text preview when file is opened', async () => {
    const blob = TestBed.inject(FileBlobService) as unknown as FakeBlob;
    component.isOpen.set(true);
    fixture.componentRef.setInput('file', file());
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(blob.getBytes).toHaveBeenCalled();
    const text = (component as unknown as { textPreview: () => string | null }).textPreview();
    expect(text).toContain('hello world');
  });

  it('does not load if file is null', async () => {
    const blob = TestBed.inject(FileBlobService) as unknown as FakeBlob;
    blob.getBytes.mockClear();
    component.isOpen.set(true);
    fixture.componentRef.setInput('file', null);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    expect(blob.getBytes).not.toHaveBeenCalled();
  });

  it('downloads the file via blob URL', async () => {
    const blob = TestBed.inject(FileBlobService) as unknown as FakeBlob;
    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag) as HTMLElement;
      if (tag === 'a') {
        (el as HTMLAnchorElement).click = clickSpy;
      }
      return el;
    });

    component.isOpen.set(true);
    fixture.componentRef.setInput('file', file());
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    await (component as unknown as { onDownload: () => Promise<void> }).onDownload();
    expect(blob.getBytes).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });
});


