import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal, Signal } from '@angular/core';
import { PasswordList } from './password-list';
import { PasswordRepository } from '../../service/passwords.repository';
import { VaultSecurity } from '../../../shared/security/vault-security';
import { ToastService } from '../../../shared/service/toast';
import { PasswordI } from '../../domain/password.interface';
import { FilterService } from '../../../shared/filter';
import { QueryOptions } from '../../../shared/api/api.interfaces';

function makeItem(id = 'p1'): PasswordI {
  return {
    id,
    name: 'demo',
    password: { cipher: [1, 2, 3], iv: [4, 5, 6] },
    secure: false,
  };
}

function makeResource<T>(items: T[] | undefined) {
  return {
    isLoading: () => false,
    hasValue: () => items !== undefined,
    value: () => items,
    reload: vi.fn(),
    error: vi.fn(),
  };
}

class FakePasswordRepository {
  private _decrypt: (item: PasswordI['password'], key: CryptoKey) => Promise<string> = async () =>
    'decrypted-secret';

  decryptPassword = vi.fn((data: PasswordI['password'], key: CryptoKey) =>
    this._decrypt(data, key),
  );

  private _allItems: (PasswordI & { id: string })[] = [];
  private _filteredItems: (PasswordI & { id: string })[] = [];

  getCollection = vi.fn(() => makeResource<(PasswordI & { id: string })[]>(this._allItems));

  getFilteredCollection = vi.fn((_options: Signal<QueryOptions>) =>
    makeResource<(PasswordI & { id: string })[]>(this._filteredItems),
  );

  setAllItems(items: (PasswordI & { id: string })[]): void {
    this._allItems = items;
  }

  setFilteredItems(items: (PasswordI & { id: string })[]): void {
    this._filteredItems = items;
  }

  setDecryptResult(value: string) {
    this._decrypt = async () => value;
  }

  setDecryptError(err: unknown) {
    this._decrypt = async () => {
      throw err;
    };
  }
}

class FakeVault {
  unlocked = signal(true);
  isUnlocked = vi.fn(() => this.unlocked());
  getVaultKey = vi.fn(() => ({}) as CryptoKey);
  showModal = vi.fn();
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

describe('PasswordList', () => {
  let fixture: ComponentFixture<PasswordList>;
  let component: PasswordList;
  let repo: FakePasswordRepository;
  let vault: FakeVault;
  let toast: FakeToast;
  let filter: FilterService;
  let writeTextSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    repo = new FakePasswordRepository();
    vault = new FakeVault();
    toast = new FakeToast();

    writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [PasswordList],
      providers: [
        { provide: PasswordRepository, useValue: repo },
        { provide: VaultSecurity, useValue: vault },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordList);
    component = fixture.componentInstance;
    filter = TestBed.inject(FilterService);
    filter.reset();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the success toast on a successful copy and only one toast', async () => {
    const item = makeItem('p1');
    await component.copyPassword(item);

    expect(writeTextSpy).toHaveBeenCalledWith('decrypted-secret');
    expect(toast.success).toHaveBeenCalledWith('Contraseña copiada');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows the error toast when the clipboard write fails and not the success toast', async () => {
    writeTextSpy.mockRejectedValueOnce(new Error('NotAllowedError'));
    const item = makeItem('p1');

    await component.copyPassword(item);

    expect(toast.error).toHaveBeenCalledWith('Error al copiar contraseña');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows the error toast when decryption fails and not the success toast', async () => {
    repo.setDecryptError(new Error('decrypt failed'));
    const item = makeItem('p1');

    await component.copyPassword(item);

    expect(toast.error).toHaveBeenCalledWith('Error al copiar contraseña');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('ignores a second copy click while a copy is in flight (no double toast)', async () => {
    let resolveWrite!: () => void;
    writeTextSpy.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        }),
    );
    const item = makeItem('p1');

    const first = component.copyPassword(item);
    await component.copyPassword(item);
    await component.copyPassword(item);
    resolveWrite();
    await first;

    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('resets the copyingId guard after success', async () => {
    const item = makeItem('p1');
    await component.copyPassword(item);
    expect(component.copyingId()).toBeNull();

    await component.copyPassword(item);
    expect(writeTextSpy).toHaveBeenCalledTimes(2);
  });

  it('resets the copyingId guard after error', async () => {
    writeTextSpy.mockRejectedValueOnce(new Error('boom'));
    const item = makeItem('p1');
    await component.copyPassword(item);
    expect(component.copyingId()).toBeNull();

    writeTextSpy.mockResolvedValueOnce(undefined);
    await component.copyPassword(item);
    expect(writeTextSpy).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('uses getFilteredCollection with the filter service query options after applying filters', () => {
    const schema = (component as unknown as { filterSchema: unknown }).filterSchema;
    filter.apply(schema as Parameters<FilterService['apply']>[0], [
      { key: 'name', op: '==', value: 'demo' },
    ]);

    expect(repo.getFilteredCollection).toHaveBeenCalled();
    const lastCall = repo.getFilteredCollection.mock.calls.at(-1);
    const optsSignal = lastCall?.[0] as Signal<QueryOptions>;
    expect(optsSignal()).toEqual({
      filters: [['name', '==', 'demo']],
    });
  });

  it('renders the filtered list returned by the repository', () => {
    const a = { id: 'a', name: 'a', password: { cipher: [], iv: [] }, secure: false };
    const b = { id: 'b', name: 'b', password: { cipher: [], iv: [] }, secure: false };
    const c = { id: 'c', name: 'c', password: { cipher: [], iv: [] }, secure: false };
    repo.setAllItems([a, b, c]);
    repo.setFilteredItems([b]);
    const schema = (component as unknown as { filterSchema: unknown }).filterSchema;
    filter.apply(schema as Parameters<FilterService['apply']>[0], [
      { key: 'name', op: '==', value: 'b' },
    ]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('ui-list-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('b');
  });
});
