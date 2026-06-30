import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal, Signal } from '@angular/core';
import { FileList } from './file-list';
import { FileRepository, FileBlobService } from '../../../shared/files';
import { FileRow } from '../../../shared/components/file-components';
import { VaultSecurity } from '../../../shared/security/vault-security';
import { ToastService } from '../../../shared/service/toast';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { FilterService } from '../../../shared/filter';
import { QueryOptions } from '../../../shared/api/api.interfaces';

function makeRow(id = 'f1', overrides: Partial<FileRow> = {}): FileRow {
  return {
    id,
    name: 'contrato.pdf',
    mimeType: 'application/pdf',
    size: 12345,
    chunkCount: 1,
    updatedAt: 0,
    encrypted: true,
    tags: [],
    createdAt: Date.UTC(2026, 0, 15),
    ...overrides,
  };
}

class FakeFileRepository {
  private _all: FileRow[] = [];
  private _filtered: FileRow[] = [];
  getCollection = vi.fn(() => this._resource(this._all));
  getFilteredCollection = vi.fn((options: Signal<QueryOptions>) =>
    this._resource(options().filters ? this._filtered : this._all),
  );
  deleteDoc = vi.fn((_id: string) => ({
    subscribe: (o: { next: () => void }) => o.next(),
  }));
  readonly namespace = signal('files');
  setAll(items: FileRow[]): void {
    this._all = items;
  }
  setFiltered(items: FileRow[]): void {
    this._filtered = items;
  }
  private _resource(items: FileRow[]) {
    return {
      isLoading: () => false,
      hasValue: () => true,
      value: () => items,
      reload: vi.fn(),
      error: vi.fn(),
    };
  }
}

class FakeBlob {
  getBytes = vi.fn(async () => new Uint8Array([1, 2, 3]));
}

class FakeVault {
  unlocked = signal(true);
  isUnlocked = vi.fn(() => this.unlocked());
  getVaultKey = vi.fn(() => ({}) as CryptoKey);
  showModal = vi.fn();
}

class FakeConfirm {
  delete = vi.fn(async (_msg: string) => true);
}

class FakeToast {
  success = vi.fn();
  error = vi.fn();
  warning = vi.fn();
  info = vi.fn();
  show = vi.fn();
  dismiss = vi.fn();
  closeWithAnimation = vi.fn();
}

describe('FileList', () => {
  let fixture: ComponentFixture<FileList>;
  let component: FileList;
  let repo: FakeFileRepository;
  let vault: FakeVault;
  let confirm: FakeConfirm;
  let toast: FakeToast;
  let blob: FakeBlob;
  let filter: FilterService;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let click: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    repo = new FakeFileRepository();
    vault = new FakeVault();
    confirm = new FakeConfirm();
    toast = new FakeToast();
    blob = new FakeBlob();

    createObjectURL = vi.fn(() => 'blob:fake');
    revokeObjectURL = vi.fn();
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
      writable: true,
    });
    click = vi.fn();
    const anchorMock = { href: '', download: '', click } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return anchorMock;
      return document.createElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    await TestBed.configureTestingModule({
      imports: [FileList],
      providers: [
        { provide: FileRepository, useValue: repo },
        { provide: FileBlobService, useValue: blob },
        { provide: VaultSecurity, useValue: vault },
        { provide: ConfirmService, useValue: confirm },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileList);
    component = fixture.componentInstance;
    filter = TestBed.inject(FilterService);
    filter.reset();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza un <ui-list-item> por cada archivo con label y sub', () => {
    repo.setAll([
      makeRow('a', { name: 'a.pdf' }),
      makeRow('b', { name: 'b.png', mimeType: 'image/png' }),
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ui-list-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('a.pdf');
    expect(items[0].textContent).toContain('12.1 KB');
  });

  it('muestra el icono leading segun mimeType', () => {
    repo.setAll([
      makeRow('a', { name: 'a.pdf', mimeType: 'application/pdf' }),
      makeRow('b', { name: 'b.png', mimeType: 'image/png' }),
      makeRow('c', { name: 'c.mp4', mimeType: 'video/mp4' }),
    ]);
    fixture.detectChanges();
    const leadings = fixture.nativeElement.querySelectorAll('.item-list-leading');
    expect(leadings[0].textContent.trim()).toBe('picture_as_pdf');
    expect(leadings[1].textContent.trim()).toBe('image');
    expect(leadings[2].textContent.trim()).toBe('movie');
  });

  it('click Ver abre el modal de view (isViewOpen=true, viewFile seteado)', () => {
    const row = makeRow('a');
    repo.setAll([row]);
    fixture.detectChanges();
    component.onView(row);
    expect(component.isViewOpen()).toBe(true);
    expect(component.viewFile()?.id).toBe('a');
  });

  it('click Ver con vault bloqueado encola la accion en vault.showModal', () => {
    vault.unlocked.set(false);
    const row = makeRow('a');
    repo.setAll([row]);
    fixture.detectChanges();
    component.onView(row);
    expect(vault.showModal).toHaveBeenCalled();
    expect(component.isViewOpen()).toBe(false);
  });

  it('click Descargar invoca getBytes y crea un anchor con download', async () => {
    const row = makeRow('a');
    repo.setAll([row]);
    fixture.detectChanges();
    await component.onDownload(row);
    expect(blob.getBytes).toHaveBeenCalledWith('files', 'a', expect.anything());
    expect(createObjectURL).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('click Descargar con vault bloqueado encola y no llama a getBytes', async () => {
    vault.unlocked.set(false);
    const row = makeRow('a');
    repo.setAll([row]);
    fixture.detectChanges();
    await component.onDownload(row);
    expect(blob.getBytes).not.toHaveBeenCalled();
    expect(vault.showModal).toHaveBeenCalled();
  });

  it('click Eliminar muestra confirm con el nombre del archivo', async () => {
    const row = makeRow('a', { name: 'foto.png' });
    repo.setAll([row]);
    fixture.detectChanges();
    await component.onRemove(row);
    expect(confirm.delete).toHaveBeenCalledWith(expect.stringContaining('foto.png'));
  });

  it('filter.apply provoca que getFilteredCollection se invoque con nuevos options', () => {
    filter.apply(component.filterSchema as Parameters<FilterService['apply']>[0], [
      { key: 'name', op: '==', value: 'demo' },
    ]);
    expect(repo.getFilteredCollection).toHaveBeenCalled();
  });
});
