import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { IssueDetail } from './issue-detail';
import { IssueRepository } from '../../service/issues.repository';
import { IssueI } from '../../domain/issue.interface';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { FileRepository } from '../../../shared/files';
import { PasswordRepository } from '../../service/passwords.repository';
import { VaultSecurity } from '../../../shared/security';
import { FileBlobService } from '../../../shared/files';
import { Authenticator } from '../../../shared/service/authenticator';
import { FilterService } from '../../../shared/filter';

function makeIssue(overrides: Partial<IssueI> = {}): IssueI & { id: string } {
  const now = Timestamp.now();
  return {
    id: 'i1',
    title: 'Error - 43235',
    description: 'Error producido al crear nuevo objeto en lista',
    status: 'pending',
    isNote: false,
    priority: 'high',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

class FakeActivatedRoute {
  readonly paramMap = of(convertToParamMap({ projectId: 'p1', issueId: 'i1' }));
  snapshot = { paramMap: convertToParamMap({ projectId: 'p1', issueId: 'i1' }) };
}

class FakeIssueRepository {
  private _current: (IssueI & { id: string }) | null = null;
  readonly getById = vi.fn((id: string) => {
    return of(this._current && this._current.id === id ? this._current : null);
  });
  readonly updateIssue = vi.fn((_id: string, _patch: Partial<IssueI>) => of(undefined));
  readonly deleteIssue = vi.fn((_id: string) => of(undefined));
  readonly toggleStatus = vi.fn((_id: string, _current: IssueI['status']) => of(undefined));
  setCurrent(issue: (IssueI & { id: string }) | null): void {
    this._current = issue;
  }
}

class FakeScopeContext {
  readonly setIssue = vi.fn();
  readonly setGlobal = vi.fn();
}

class FakeConfirm {
  delete = vi.fn(async (_msg: string) => true);
}

class FakeToast {
  success = vi.fn();
  error = vi.fn();
  warning = vi.fn();
  info = vi.fn();
}

class FakeFileRepository {
  getFilteredCollection = vi.fn(() => ({
    isLoading: () => false,
    hasValue: () => false,
    value: () => [],
    reload: vi.fn(),
    error: () => undefined,
  }));
  namespace = vi.fn(() => 'global');
  getDocResource = vi.fn();
}

class FakePasswordRepository {
  getFilteredCollection = vi.fn(() => ({
    isLoading: () => false,
    hasValue: () => false,
    value: () => [],
    reload: vi.fn(),
    error: () => undefined,
  }));
  decryptPassword = vi.fn();
  deleteDoc = vi.fn();
  addDoc = vi.fn();
  updateDoc = vi.fn();
}

class FakeVault {
  isUnlocked = vi.fn().mockReturnValue(true);
  getVaultKey = vi.fn();
  showModal = vi.fn();
  openUnlockVaultModal = vi.fn();
  haveUnlockKeyWithPin = signal(false);
  haveUnlockKeyWithPasskey = signal(false);
  vaultStatus = signal<'locked' | 'unlocked' | 'none'>('none');
  isSecureModalOpen = signal(false);
  isUnlockModalOpen = signal(false);
  haveVault = signal(true);
}

class FakeAuthenticator {
  user = signal(null);
  logout = vi.fn();
  loginWithGithub = vi.fn();
  loginWithGoogle = vi.fn();
  loginWithEmail = vi.fn();
  registerWithEmail = vi.fn();
  sendPasswordReset = vi.fn();
  getIdToken = vi.fn();
}

class FakeFileBlobService {
  uploadBytes = vi.fn();
  getBytes = vi.fn();
  delete = vi.fn();
}

describe('IssueDetail', () => {
  let fixture: ComponentFixture<IssueDetail>;
  let component: IssueDetail;
  let repo: FakeIssueRepository;
  let scope: FakeScopeContext;
  let confirm: FakeConfirm;
  let toast: FakeToast;

  beforeEach(async () => {
    repo = new FakeIssueRepository();
    scope = new FakeScopeContext();
    confirm = new FakeConfirm();
    toast = new FakeToast();

    await TestBed.configureTestingModule({
      imports: [IssueDetail],
      providers: [
        { provide: ActivatedRoute, useClass: FakeActivatedRoute },
        { provide: IssueRepository, useValue: repo },
        { provide: ScopeContext, useValue: scope },
        { provide: ConfirmService, useValue: confirm },
        { provide: ToastService, useValue: toast },
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: {} },
        { provide: FileRepository, useValue: new FakeFileRepository() },
        { provide: PasswordRepository, useValue: new FakePasswordRepository() },
        { provide: VaultSecurity, useValue: new FakeVault() },
        { provide: Authenticator, useValue: new FakeAuthenticator() },
        { provide: FileBlobService, useValue: new FakeFileBlobService() },
        FilterService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('reads projectId and issueId from the route', () => {
    expect(component.projectId()).toBe('p1');
    expect(component.issueId()).toBe('i1');
  });

  it('sets the scope to the issue on init', () => {
    expect(scope.setIssue).toHaveBeenCalledWith('p1', 'i1');
  });

  it('loads the issue by id into the form', () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'Cargado' }));
    component.reload();
    expect(component.issue()?.title).toBe('Cargado');
  });

  it('save() forwards trimmed values to updateIssue including solution and priority', async () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'Antiguo', priority: 'normal' }));
    component.reload();
    component['_form'].patchValue({
      title: '  Nuevo  ',
      description: '  desc  ',
      solution: '  Reiniciar  ',
      priority: 'high',
    });
    await component.save();
    expect(repo.updateIssue).toHaveBeenCalled();
    const [_id, patch] = repo.updateIssue.mock.calls[0];
    expect((patch as Partial<IssueI>).title).toBe('Nuevo');
    expect((patch as Partial<IssueI>).description).toBe('desc');
    expect((patch as Partial<IssueI>).solution).toBe('Reiniciar');
    expect((patch as Partial<IssueI>).priority).toBe('high');
  });

  it('loads the issue priority into the form', () => {
    repo.setCurrent(makeIssue({ id: 'i1', priority: 'high' }));
    component.reload();
    fixture.detectChanges();
    expect(component['_form'].controls.priority.value).toBe('high');
  });

  it('save() emits success toast and does not reload the page', async () => {
    repo.setCurrent(makeIssue());
    component.reload();
    component['_form'].patchValue({ title: 'X', description: '', solution: '' });
    await component.save();
    expect(toast.success).toHaveBeenCalled();
  });

  it('remove() asks for confirmation, then calls deleteIssue and emits success toast', async () => {
    confirm.delete.mockResolvedValue(true);
    repo.setCurrent(makeIssue());
    component.reload();
    await component.remove();
    expect(confirm.delete).toHaveBeenCalled();
    expect(repo.deleteIssue).toHaveBeenCalledWith('i1');
    expect(toast.success).toHaveBeenCalled();
  });

  it('remove() does NOT call deleteIssue when confirmation is cancelled', async () => {
    confirm.delete.mockResolvedValue(false);
    await component.remove();
    expect(repo.deleteIssue).not.toHaveBeenCalled();
  });

  it('toggleStatus() is a passthrough to the repository', async () => {
    repo.setCurrent(makeIssue({ status: 'pending' }));
    component.reload();
    await component.toggleStatus();
    expect(repo.toggleStatus).toHaveBeenCalledWith('i1', 'pending');
  });

  it('export() emits an info toast saying "Próximamente"', () => {
    component.export();
    expect(toast.info).toHaveBeenCalled();
    const msg = (toast.info.mock.calls[0][0] as string).toLowerCase();
    expect(msg).toContain('próximamente');
  });

  it('markups the status circle color from priority (high = red)', () => {
    repo.setCurrent(makeIssue({ priority: 'high', status: 'pending' }));
    component.reload();
    expect(component.statusCircleClass()).toBe('status-circle--high');
  });
});
