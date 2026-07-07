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
import { AiService } from '../../ai/ai.service';

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
  private _prefsSnapshot = signal<{ id: 'singleton'; aiAssistantEnabled?: boolean }>({
    id: 'singleton',
  });
  preferences = {
    value: () => this._prefsSnapshot(),
    hasValue: () => true,
    reload: vi.fn(),
  };
  resolvedUrl = { value: () => null as string | null, hasValue: () => false };
  hasCustomImage = signal(false);
  customNasaImageUrl = signal(null as string | null);
  aiAssistantEnabled = signal(false);
  aiSearcherEnabled = signal(true);
  setCustomNasaImage = vi.fn();
  clearCustomNasaImage = vi.fn();
  setAiAssistantEnabled = vi.fn().mockResolvedValue(undefined);
  setAiSearcherEnabled = vi.fn().mockResolvedValue(undefined);

  setSnapshot(v: { id: 'singleton'; aiAssistantEnabled?: boolean }): void {
    this._prefsSnapshot.set(v);
  }
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

class FakeAiService {
  status = signal<'disabled' | 'downloading' | 'ready' | 'error'>('disabled');
  downloadProgress = signal<{ loaded: number; total: number } | null>(null);
  isProcessing = signal(false);
  lastResult = signal<unknown>(null);
  enable = vi.fn().mockResolvedValue(undefined);
  disable = vi.fn();
  query = vi.fn().mockResolvedValue({ intent: 'unknown', answer: '', matched: [] });
  reindexAll = vi.fn().mockResolvedValue(undefined);
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
  let ai: FakeAiService;
  let prefs: FakePrefsService;

  beforeEach(async () => {
    vault = new FakeVault();
    auth = new FakeAuth();
    scope = new FakeScopeContext();
    fileRepo = new FakeFileRepo();
    passwordRepo = new FakePasswordRepository();
    toast = new FakeToast();
    ai = new FakeAiService();
    prefs = new FakePrefsService();

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
        { provide: PreferencesService, useValue: prefs },
        { provide: ConfirmService, useValue: new FakeConfirm() },
        { provide: EventRepository, useValue: new FakeEventRepository() },
        { provide: PasswordRepository, useValue: passwordRepo },
        { provide: ProjectRepository, useValue: new FakeProjectRepository() },
        { provide: IssueRepository, useValue: new FakeIssueRepository() },
        { provide: ToastService, useValue: toast },
        { provide: AiService, useValue: ai },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('openVault delegates to vault.openUnlockVaultModal', () => {
    fixture.detectChanges();
    component.openVault();
    expect(vault.openUnlockVaultModal).toHaveBeenCalled();
  });

  it('openConfig sets isConfigOpen to true', () => {
    fixture.detectChanges();
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(false);
    component.openConfig();
    expect((component as unknown as { isConfigOpen: () => boolean }).isConfigOpen()).toBe(true);
  });

  it('opens welcome modal when aiAssistantEnabled is undefined (legacy user)', () => {
    prefs.setSnapshot({ id: 'singleton' });
    fixture.detectChanges();
    expect((component as unknown as { isWelcomeAiOpen: () => boolean }).isWelcomeAiOpen()).toBe(
      true,
    );
  });

  it('auto-enables AI when aiAssistantEnabled=true and status=disabled', async () => {
    prefs.setSnapshot({ id: 'singleton', aiAssistantEnabled: true });
    fixture.detectChanges();
    await vi.waitFor(() => expect(ai.enable).toHaveBeenCalled());
  });

  it('does not auto-enable when aiAssistantEnabled=false', () => {
    prefs.setSnapshot({ id: 'singleton', aiAssistantEnabled: false });
    fixture.detectChanges();
    expect(ai.enable).not.toHaveBeenCalled();
    expect((component as unknown as { isWelcomeAiOpen: () => boolean }).isWelcomeAiOpen()).toBe(
      false,
    );
  });

  it('acceptWelcomeAi persists aiAssistantEnabled=true and triggers enable', async () => {
    prefs.setSnapshot({ id: 'singleton' });
    fixture.detectChanges();
    await (component as unknown as { acceptWelcomeAi: () => Promise<void> }).acceptWelcomeAi();
    expect(prefs.setAiAssistantEnabled).toHaveBeenCalledWith(true);
    expect(ai.enable).toHaveBeenCalled();
    expect((component as unknown as { isWelcomeAiOpen: () => boolean }).isWelcomeAiOpen()).toBe(
      false,
    );
  });

  it('closeWelcomeAi closes the modal without persisting', () => {
    fixture.detectChanges();
    (component as unknown as { closeWelcomeAi: () => void }).closeWelcomeAi();
    expect((component as unknown as { isWelcomeAiOpen: () => boolean }).isWelcomeAiOpen()).toBe(
      false,
    );
    expect(prefs.setAiAssistantEnabled).not.toHaveBeenCalled();
  });
});
