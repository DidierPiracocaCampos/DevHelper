import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import Home from './home';
import { VaultSecurity } from '../../../shared/security';
import { Authenticator } from '../../../shared/service/authenticator';
import { FileBlobService, FileRepository } from '../../../shared/files';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { EventRepository } from '../../service/events.repository';
import { PasswordRepository } from '../../service/passwords.repository';
import { ProjectRepository } from '../../service/projects.repository';
import { IssueRepository } from '../../service/issues.repository';
import { ToastService } from '../../../shared/service/toast';

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
  haveUnlockKeyWithPin = signal(false);
  haveUnlockKeyWithPasskey = signal(false);
  vaultStatus = signal<'locked' | 'unlocked' | 'none'>('none');
  isSecureModalOpen = signal(false);
  isUnlockModalOpen = signal(false);
  pinAttemptsRemaining = signal(3);
  isPinLockedOut = signal(false);
  pinLockoutRemainingMs = signal(0);
  repositoryStatus = signal<unknown>(undefined);
  isWebAuthnSupported = signal(false);
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
  readonly getFilteredCollection = vi.fn().mockReturnValue({
    value: signal(undefined),
    isLoading: signal(false),
    hasValue: signal(false),
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
  setProject = vi.fn();
  selectedProjectId = signal<string | null>(null);
  scope = signal<'global' | { kind: 'project'; projectId: string }>('global');
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
  aiAssistantEnabled = signal(false);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
  setAiAssistantEnabled = vi.fn().mockResolvedValue(undefined);
}

class FakeConfirm {
  delete = vi.fn().mockResolvedValue(true);
  warning = vi.fn().mockResolvedValue(true);
}

class FakeEventRepository {
  eventsOfDay$ = vi.fn().mockReturnValue({
    value: (): unknown[] => [],
    isLoading: (): boolean => false,
    hasValue: (): boolean => false,
    error: (): unknown => undefined,
    reload: vi.fn(),
  });
  addEvent = vi.fn().mockResolvedValue(undefined);
  updateEvent = vi.fn().mockResolvedValue(undefined);
  deleteEvent = vi.fn().mockResolvedValue(undefined);
}

class FakePasswordRepository {
  getCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  getFilteredCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  decryptPassword = vi.fn();
  deleteDoc = vi.fn();
  addDoc = vi.fn();
  updateDoc = vi.fn();
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

class FakeProjectRepository {
  getCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  getFilteredCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  addProject = vi.fn();
  updateProject = vi.fn();
  archiveProject = vi.fn();
  deleteProject = vi.fn();
}

class FakeIssueRepository {
  getCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  getFilteredCollection = vi.fn().mockReturnValue({
    value: () => undefined,
    isLoading: () => false,
    hasValue: () => false,
    error: () => undefined,
    reload: vi.fn(),
  });
  addIssue = vi.fn();
  updateIssue = vi.fn();
  deleteIssue = vi.fn();
  toggleStatus = vi.fn();
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let vault: FakeVault;
  let auth: FakeAuth;
  let scope: FakeScopeContext;
  let fileRepo: FakeFileRepo;
  let passwordRepo: FakePasswordRepository;
  let toast: FakeToast;

  beforeEach(async () => {
    vault = new FakeVault();
    auth = new FakeAuth();
    scope = new FakeScopeContext();
    fileRepo = new FakeFileRepo();
    passwordRepo = new FakePasswordRepository();
    toast = new FakeToast();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: VaultSecurity, useValue: vault },
        { provide: Authenticator, useValue: auth },
        { provide: FileBlobService, useValue: new FakeUpload() },
        { provide: FileRepository, useValue: fileRepo },
        { provide: ScopeContext, useValue: scope },
        { provide: PreferencesService, useValue: new FakePrefsService() },
        { provide: ConfirmService, useValue: new FakeConfirm() },
        { provide: EventRepository, useValue: new FakeEventRepository() },
        { provide: PasswordRepository, useValue: passwordRepo },
        { provide: ProjectRepository, useValue: new FakeProjectRepository() },
        { provide: IssueRepository, useValue: new FakeIssueRepository() },
        { provide: ToastService, useValue: toast },
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
