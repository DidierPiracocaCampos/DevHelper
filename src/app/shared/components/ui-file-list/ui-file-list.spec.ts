import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { UiFileList } from './ui-file-list';
import { FileBlobService } from '../../files/services/file-blob.service';
import { VaultSecurity } from '../../security';
import { FileMetadataI } from '../../files';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

class FakeBlob {
  getBytes = vi.fn().mockResolvedValue(new Uint8Array(0));
}

class FakeVault {
  isUnlocked = vi.fn().mockReturnValue(true);
  getVaultKey = vi.fn();
}

describe('UiFileList', () => {
  let fixture: ComponentFixture<UiFileList>;
  let component: UiFileList;

  const file = (id: string, name: string, mimeType: string): FileMetadataI & { id: string } => ({
    id,
    name,
    mimeType,
    size: 1024,
    chunkCount: 1,
    updatedAt: 1,
    tags: [],
    createdAt: 1,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiFileList],
      providers: [
        { provide: FileBlobService, useClass: FakeBlob },
        { provide: VaultSecurity, useClass: FakeVault },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UiFileList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', []);
    fixture.componentRef.setInput('namespace', 'files' as const);
    fixture.detectChanges();
  });

  it('renders the empty state when there are no files', () => {
    const html = fixture.nativeElement.textContent ?? '';
    expect(html).toContain('No hay archivos');
  });

  it('renders a row per file', () => {
    fixture.componentRef.setInput('files', [
      file('a', 'a.png', 'image/png'),
      file('b', 'b.pdf', 'application/pdf'),
    ]);
    fixture.detectChanges();
    const html = fixture.nativeElement.textContent ?? '';
    expect(html).toContain('a.png');
    expect(html).toContain('b.pdf');
  });

  it('emits view / download / remove on button clicks', () => {
    const a = file('a', 'a.png', 'image/png');
    fixture.componentRef.setInput('files', [a]);
    fixture.detectChanges();

    const viewed: string[] = [];
    const downloaded: string[] = [];
    const removed: string[] = [];
    component.view.subscribe((f) => viewed.push(f.id));
    component.download.subscribe((f) => downloaded.push(f.id));
    component.remove.subscribe((f) => removed.push(f.id));

    const buttons = fixture.nativeElement.querySelectorAll('ui-list-button');
    expect(buttons.length).toBe(3);
    (buttons[0] as HTMLElement).click();
    (buttons[1] as HTMLElement).click();
    (buttons[2] as HTMLElement).click();
    expect(viewed).toEqual(['a']);
    expect(downloaded).toEqual(['a']);
    expect(removed).toEqual(['a']);
  });

  it('shows the encrypted badge when encrypted is true', () => {
    const a = file('a', 'a.png', 'image/png');
    (a as { encrypted?: boolean }).encrypted = true;
    fixture.componentRef.setInput('files', [a]);
    fixture.detectChanges();
    const html = fixture.nativeElement.textContent ?? '';
    expect(html).toContain('cifrado');
  });

  it('detects image mime types', () => {
    const isImage = (component as unknown as { isImage: (m: string) => boolean }).isImage;
    expect(isImage('image/png')).toBe(true);
    expect(isImage('application/pdf')).toBe(false);
  });

  it('formats sizes in human readable units', () => {
    const formatSize = (component as unknown as { formatSize: (n: number) => string }).formatSize;
    expect(formatSize(500)).toBe('500 B');
    expect(formatSize(2048)).toBe('2.0 KB');
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('shows the loading skeleton when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const html = fixture.nativeElement.innerHTML ?? '';
    expect(html).toContain('skeleton');
  });
});
