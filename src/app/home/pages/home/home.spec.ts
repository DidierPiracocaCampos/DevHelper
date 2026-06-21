import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import Home from './home';
import { VaultSecurity } from '../../../shared/security';
import { Authenticator } from '../../../shared/service/authenticator';
import { FileBlobService, FileRepository } from '../../../shared/files';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';

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
  (URL as { revokeObjectURL: typeof URL.revokeObjectURL }).revokeObjectURL =
    vi.fn() as typeof URL.revokeObjectURL;
}

class FakeVault {
  openUnlockVaultModal = vi.fn();
  isUnlocked = vi.fn().mockReturnValue(true);
  getVaultKey = vi.fn();
  showModal = vi.fn();
}

class FakeAuth {
  readonly user = signal<{ uid: string } | null>({ uid: 'u1' });
  logout = vi.fn().mockResolvedValue(undefined);
}

class FakeUpload {
  upload = vi.fn();
  deleteFile = vi.fn();
  getDownloadUrl = vi.fn();
  getBytes = vi.fn();
  getObjectUrl = vi.fn();
}

class FakeFileRepo {
  readonly namespace = signal<'files'>('files');
  readonly getCollection = vi.fn().mockReturnValue({
    value: signal(undefined),
    isLoading: signal(false),
    error: signal(null),
    reload: vi.fn(),
  });
  readonly deleteDoc = vi.fn().mockReturnValue({
    subscribe: vi.fn(({ next }: { next: () => void }) => next()),
  });
}

class FakeScopeContext {
  setGlobal = vi.fn();
  setIssue = vi.fn();
  scope = signal<'global'>('global');
}

class FakePrefsService {
  preferences = {
    value: () => ({ id: 'singleton' as const }),
    hasValue: () => true,
    reload: vi.fn(),
  };
  resolvedUrl = { value: () => null as string | null, hasValue: () => false };
  hasCustomImage = signal(false);
  customNasaImageUrl = signal(null as string | null);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
}

class FakeConfirm {
  delete = vi.fn().mockResolvedValue(true);
  warning = vi.fn().mockResolvedValue(true);
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let vault: FakeVault;
  let auth: FakeAuth;
  let scope: FakeScopeContext;
  let fileRepo: FakeFileRepo;

  beforeEach(async () => {
    vault = new FakeVault();
    auth = new FakeAuth();
    scope = new FakeScopeContext();
    fileRepo = new FakeFileRepo();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VaultSecurity, useValue: vault },
        { provide: Authenticator, useValue: auth },
        { provide: FileBlobService, useValue: new FakeUpload() },
        { provide: FileRepository, useValue: fileRepo },
        { provide: ScopeContext, useValue: scope },
        { provide: PreferencesService, useValue: new FakePrefsService() },
        { provide: ConfirmService, useValue: new FakeConfirm() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openVault delegates to vault.openUnlockVaultModal', () => {
    component.openVault();
    expect(vault.openUnlockVaultModal).toHaveBeenCalled();
  });

  it('openConfig sets isConfigOpen to true', () => {
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(false);
    component.openConfig();
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(true);
  });
});
