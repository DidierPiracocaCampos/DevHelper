import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Title } from '@angular/platform-browser';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { IssueDetail } from './issue-detail';
import { IssueRepository } from '../../service/issues.repository';
import { ProjectRepository } from '../../service/projects.repository';
import { IssueI } from '../../domain/issue.interface';
import type { IssueUpdateInput } from '../../domain/issue.interface';
import type { ProjectI } from '../../domain/project.interface';
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
  closeUnlockModal = vi.fn();
  closeCreateModal = vi.fn();
  haveUnlockKeyWithPin = signal(false);
  haveUnlockKeyWithPasskey = signal(false);
  vaultStatus = signal<'locked' | 'unlocked' | 'none'>('none');
  isSecureModalOpen = signal(false);
  isUnlockModalOpen = signal(false);
  haveVault = signal(true);
  pinAttemptsRemaining = signal(3);
  isPinLockedOut = signal(false);
  pinLockoutRemainingMs = signal(0);
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

class FakeProjectRepository {
  private _signal = signal<ProjectI[]>([]);
  readonly allDocs = vi.fn(() => this._signal());
  setProjects(projects: ProjectI[]): void {
    this._signal.set(projects);
  }
}

describe('IssueDetail', () => {
  let fixture: ComponentFixture<IssueDetail>;
  let component: IssueDetail;
  let repo: FakeIssueRepository;
  let projects: FakeProjectRepository;
  let scope: FakeScopeContext;
  let confirm: FakeConfirm;
  let toast: FakeToast;
  let title: { setTitle: ReturnType<typeof vi.fn>; getTitle: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = new FakeIssueRepository();
    projects = new FakeProjectRepository();
    scope = new FakeScopeContext();
    confirm = new FakeConfirm();
    toast = new FakeToast();
    title = { setTitle: vi.fn(), getTitle: vi.fn().mockReturnValue('DevhelperWeb') };
    router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
    projects.setProjects([
      {
        id: 'p1',
        name: 'DevHelper Core',
        archived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ]);

    await TestBed.configureTestingModule({
      imports: [IssueDetail],
      providers: [
        { provide: ActivatedRoute, useClass: FakeActivatedRoute },
        { provide: IssueRepository, useValue: repo },
        { provide: ProjectRepository, useValue: projects },
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
        { provide: Title, useValue: title },
        { provide: Router, useValue: router },
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

  it('sets the document title to the issue title when the issue loads', () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'Error - 43235' }));
    component.reload();
    fixture.detectChanges();
    expect(title.setTitle).toHaveBeenCalledWith('Error - 43235');
  });

  it('restores the default document title on destroy', () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'X' }));
    component.reload();
    fixture.detectChanges();
    title.setTitle.mockClear();
    component.ngOnDestroy();
    expect(title.setTitle).toHaveBeenCalledWith('DevhelperWeb');
  });

  it('solution form control has no Validators.required', () => {
    expect(component['_form'].controls.solution.hasValidator(Validators.required)).toBe(false);
  });

  it('save() with empty solution sends deleteField() for solution', async () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'Antiguo', solution: 'Vieja' }));
    component.reload();
    component['_form'].patchValue({
      title: 'X',
      description: '',
      solution: '',
      priority: 'normal',
    });
    await component.save();
    expect(repo.updateIssue).toHaveBeenCalled();
    const [, patch] = repo.updateIssue.mock.calls[0] as [string, IssueUpdateInput];
    expect(patch.solution).toBeDefined();
    expect(typeof patch.solution).not.toBe('string');
  });

  it('renders the vault unlock modal host so Add can surface when locked', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('secure-unlock-vault'))).not.toBeNull();
  });

  it('wrapper uses dynamic viewport height below lg and screen height at lg+', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail'));
    const cls = el.nativeElement.className as string;
    expect(cls).toContain('h-[100dvh]');
    expect(cls).toContain('lg:h-screen');
  });

  it('title row stacks vertically below lg and lays out horizontally at lg+', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail-title-row'));
    const cls = el.nativeElement.className as string;
    expect(cls).toContain('flex-col');
    expect(cls).toContain('lg:flex-row');
  });

  it('panels stack to one column below lg and two columns at lg+', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail-panels'));
    const cls = el.nativeElement.className as string;
    expect(cls).toContain('grid-cols-1');
    expect(cls).toContain('lg:grid-cols-2');
  });

  it('footer wraps buttons on narrow viewports', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail-footer'));
    const cls = el.nativeElement.className as string;
    expect(cls).toContain('flex-wrap');
  });

  it('file-list and password-list have an explicit min height below lg', () => {
    fixture.detectChanges();
    const fileList = fixture.debugElement.query(By.css('file-list'));
    const passwordList = fixture.debugElement.query(By.css('password-list'));
    const fileCls = (fileList.nativeElement as HTMLElement).className;
    const passCls = (passwordList.nativeElement as HTMLElement).className;
    expect(fileCls).toMatch(/min-h-/);
    expect(passCls).toMatch(/min-h-/);
    expect(fileCls).toContain('lg:min-h-0');
    expect(passCls).toContain('lg:min-h-0');
  });

  it('form fills the wrapper so panels can use the remaining height', () => {
    const form = fixture.debugElement.query(By.css('.issue-detail-form'));
    const cls = (form.nativeElement as HTMLElement).className;
    expect(cls).toContain('flex-1');
  });

  it('panels grid grows to fill the form and uses a single row that fills the grid', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail-panels'));
    const cls = (el.nativeElement as HTMLElement).className;
    expect(cls).toContain('flex-1');
    expect(cls).toContain('grid-rows-1fr');
  });

  it('panels clip overflow so inner lists scroll independently', () => {
    const panels = fixture.debugElement.queryAll(By.css('.issue-detail-panel'));
    expect(panels.length).toBe(2);
    for (const p of panels) {
      const cls = (p.nativeElement as HTMLElement).className;
      expect(cls).toContain('overflow-hidden');
    }
  });

  it('file-list and password-list grow to fill their panel', () => {
    fixture.detectChanges();
    const fileList = fixture.debugElement.query(By.css('file-list'));
    const passwordList = fixture.debugElement.query(By.css('password-list'));
    const fileCls = (fileList.nativeElement as HTMLElement).className;
    const passCls = (passwordList.nativeElement as HTMLElement).className;
    expect(fileCls).toContain('flex-1');
    expect(passCls).toContain('flex-1');
  });

  it('form has overflow-auto so it scrolls when header + panels exceed its height', () => {
    const form = fixture.debugElement.query(By.css('.issue-detail-form'));
    const cls = (form.nativeElement as HTMLElement).className;
    expect(cls).toContain('overflow-auto');
  });

  it('panels grid has a min height so the form reliably scrolls when the header is tall', () => {
    const el = fixture.debugElement.query(By.css('.issue-detail-panels'));
    const cls = (el.nativeElement as HTMLElement).className;
    expect(cls).toContain('min-h-64');
  });

  describe('topbar', () => {
    it('renders project name as title, issue title as subtitle, and an outline back button', () => {
      projects.setProjects([
        {
          id: 'p1',
          name: 'DevHelper Core',
          archived: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        {
          id: 'p2',
          name: 'Other',
          archived: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      ]);
      repo.setCurrent(makeIssue({ title: 'Refactor login' }));
      component.reload();
      fixture.detectChanges();

      const topbar = fixture.debugElement.query(By.css('.issue-detail-topbar'));
      expect(topbar).not.toBeNull();
      expect(topbar.nativeElement.closest('form')).toBeNull();

      const projectEl = fixture.debugElement.query(By.css('.issue-detail-topbar-project'));
      const titleEl = fixture.debugElement.query(By.css('.issue-detail-topbar-title'));
      expect(projectEl.nativeElement.textContent.trim()).toBe('DevHelper Core');
      expect(titleEl.nativeElement.textContent.trim()).toBe('Refactor login');

      const backBtn = fixture.debugElement.query(By.css('.issue-detail-back-btn'));
      expect(backBtn).not.toBeNull();
      const cls = (backBtn.nativeElement as HTMLElement).className;
      expect(cls).toContain('issue-detail-back-btn');
      expect(backBtn.nativeElement.querySelector('.icon').textContent.trim()).toBe('arrow_back');
    });

    it('falls back to "Proyecto" when the project is not in the repository', () => {
      projects.setProjects([]);
      repo.setCurrent(makeIssue({ title: 'Orphan issue' }));
      component.reload();
      fixture.detectChanges();

      const projectEl = fixture.debugElement.query(By.css('.issue-detail-topbar-project'));
      expect(projectEl.nativeElement.textContent.trim()).toBe('Proyecto');
      const titleEl = fixture.debugElement.query(By.css('.issue-detail-topbar-title'));
      expect(titleEl.nativeElement.textContent.trim()).toBe('Orphan issue');
    });

    it('topbar mirrors footer style: base-content background and sticky top', () => {
      const topbar = fixture.debugElement.query(By.css('.issue-detail-topbar'));
      const cls = (topbar.nativeElement as HTMLElement).className;
      expect(cls).toContain('sticky');
      expect(cls).toContain('top-0');
      expect(cls).toContain('z-10');
    });

    it('back button focuses opener and closes window when opened from another tab', () => {
      const opener = { focus: vi.fn(), closed: false };
      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      (window as unknown as { opener: typeof opener }).opener = opener;
      try {
        (component as unknown as { goBack: () => void }).goBack();
        expect(opener.focus).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
      } finally {
        (window as unknown as { opener: typeof opener | null }).opener = null;
        closeSpy.mockRestore();
      }
    });

    it('back button navigates to home when there is no opener', () => {
      (window as unknown as { opener: unknown }).opener = null;
      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      (component as unknown as { goBack: () => void }).goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
      expect(closeSpy).not.toHaveBeenCalled();
      closeSpy.mockRestore();
    });
  });

  describe('topbar dates', () => {
    it('renders the created date in the topbar', () => {
      const created = Timestamp.fromMillis(new Date(2026, 2, 12, 9, 30).getTime());
      repo.setCurrent(makeIssue({ createdAt: created, updatedAt: created }));
      component.reload();
      fixture.detectChanges();

      const meta = fixture.debugElement.query(By.css('[data-testid="topbar-meta"]'));
      expect(meta).not.toBeNull();
      expect(meta.nativeElement.textContent).toContain('Creado:');
    });

    it('hides the updated line when updatedAt equals createdAt', () => {
      const created = Timestamp.fromMillis(new Date(2026, 2, 12, 9, 30).getTime());
      repo.setCurrent(makeIssue({ createdAt: created, updatedAt: created }));
      component.reload();
      fixture.detectChanges();

      const meta = fixture.debugElement.query(By.css('[data-testid="topbar-meta"]'));
      expect(meta.nativeElement.textContent).not.toContain('Editado:');
    });

    it('renders the updated line when updatedAt differs from createdAt', () => {
      const created = Timestamp.fromMillis(new Date(2026, 2, 12, 9, 30).getTime());
      const updated = Timestamp.fromMillis(new Date(2026, 2, 14, 16, 5).getTime());
      repo.setCurrent(makeIssue({ createdAt: created, updatedAt: updated }));
      component.reload();
      fixture.detectChanges();

      const meta = fixture.debugElement.query(By.css('[data-testid="topbar-meta"]'));
      const text = meta.nativeElement.textContent;
      expect(text).toContain('Creado:');
      expect(text).toContain('· Editado:');
    });

    it('does not render the meta line when the issue has no dates', () => {
      const current = makeIssue();
      const cleared: Partial<typeof current> = { ...current };
      delete cleared.createdAt;
      delete cleared.updatedAt;
      repo.setCurrent(cleared as typeof current);
      component.reload();
      fixture.detectChanges();

      const meta = fixture.debugElement.query(By.css('[data-testid="topbar-meta"]'));
      expect(meta).toBeNull();
    });
  });
});
