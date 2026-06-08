import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { UiAddFile } from './ui-add-file';
import { FileBlobService } from '../../files/services/file-blob.service';
import { VaultSecurity } from '../../security';
import { ToastService } from '../../service/toast';
import { ConfirmService } from '../../service/confirm.service';

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
  upload = vi.fn().mockResolvedValue({
    id: 'new',
    name: 'x.png',
    size: 10,
    mimeType: 'image/png',
    chunkCount: 1,
    updatedAt: 1,
    tags: [],
    createdAt: 1,
  });
}

class FakeVault {
  isUnlocked = vi.fn().mockReturnValue(true);
  getVaultKey = vi.fn();
  showModal = vi.fn();
}

class FakeToast {
  success = vi.fn();
  error = vi.fn();
  info = vi.fn();
}
class FakeConfirm {
  warning = vi.fn().mockResolvedValue(true);
}

describe('UiAddFile', () => {
  let fixture: ComponentFixture<UiAddFile>;
  let component: UiAddFile;
  let blob: FakeBlob;

  beforeEach(async () => {
    blob = new FakeBlob();
    await TestBed.configureTestingModule({
      imports: [UiAddFile],
      providers: [
        { provide: FileBlobService, useValue: blob },
        { provide: VaultSecurity, useClass: FakeVault },
        { provide: ToastService, useValue: new FakeToast() },
        { provide: ConfirmService, useClass: FakeConfirm },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UiAddFile);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('namespace', 'files' as const);
    fixture.componentRef.setInput('encrypt', false);
    fixture.detectChanges();
  });

  it('opens the modal and adds files to the queue', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
    (component as unknown as { _accept: (f: File[]) => void })._accept([file]);
    fixture.detectChanges();
    const items = (component as unknown as { _items: () => unknown[] })._items();
    expect(items.length).toBe(1);
  });

  it('rejects files larger than maxSize', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const file = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });
    (component as unknown as { _accept: (f: File[]) => void })._accept([file]);
    fixture.detectChanges();
    const items = (component as unknown as { _items: () => unknown[] })._items();
    expect(items.length).toBe(0);
    const err = (component as unknown as { _errorMsg: () => string | null })._errorMsg();
    expect(err).toContain('excede');
  });

  it('uploads pending files and emits added', async () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const f = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
    (component as unknown as { _accept: (f: File[]) => void })._accept([f]);
    fixture.detectChanges();

    const added: unknown[] = [];
    component.added.subscribe((list) => added.push(...list));
    await (component as unknown as { uploadAll: () => Promise<void> }).uploadAll();
    expect(blob.upload).toHaveBeenCalled();
    expect(added.length).toBe(1);
  });

  it('when encrypt is true and vault is locked, defers to showModal', async () => {
    component.isOpen.set(true);
    fixture.componentRef.setInput('encrypt', true);
    fixture.detectChanges();
    const vault = TestBed.inject(VaultSecurity) as unknown as FakeVault;
    vault.isUnlocked.mockReturnValue(false);
    const f = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });
    (component as unknown as { _accept: (f: File[]) => void })._accept([f]);
    fixture.detectChanges();

    await (component as unknown as { uploadAll: () => Promise<void> }).uploadAll();
    expect(vault.showModal).toHaveBeenCalled();
    expect(blob.upload).not.toHaveBeenCalled();
  });
});
