import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal, Signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { IssueList } from './issue-list';
import { IssueRepository } from '../../service/issues.repository';
import { IssueI } from '../../domain/issue.interface';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { FilterService } from '../../../shared/filter';
import { QueryOptions } from '../../../shared/api/api.interfaces';

function makeIssue(overrides: Partial<IssueI> = {}): IssueI & { id: string } {
  const now = Timestamp.now();
  return {
    id: 'i1',
    title: 'Tarea de prueba',
    status: 'pending',
    isNote: false,
    priority: 'normal',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

class FakeIssueRepository {
  private _all: (IssueI & { id: string })[] = [];
  private _filtered: (IssueI & { id: string })[] = [];
  readonly addIssueSpy = vi.fn();
  readonly updateIssueSpy = vi.fn();
  readonly deleteIssueSpy = vi.fn();
  readonly toggleStatusSpy = vi.fn();

  getCollection = vi.fn(() => this._resource(this._all));
  getFilteredCollection = vi.fn(
    (options: Signal<QueryOptions>) =>
      this._resource(options().filters && options().filters!.length > 0 ? this._filtered : this._all),
  );

  addIssue(input: { title: string; status?: 'pending' | 'done' | null; isNote: boolean; priority: 'normal' | 'high' }) {
    const now = Timestamp.now();
    const payload: IssueI = {
      title: input.title,
      status: input.isNote ? null : (input.status ?? 'pending'),
      isNote: input.isNote,
      priority: input.priority ?? 'normal',
      createdAt: now,
      updatedAt: now,
    };
    this.addIssueSpy(payload);
    return of({ id: 'new-id', ...payload });
  }

  updateIssue(id: string, patch: Partial<IssueI>) {
    this.updateIssueSpy(id, patch);
    return of(undefined);
  }

  deleteIssue(id: string) {
    this.deleteIssueSpy(id);
    return of(undefined);
  }

  toggleStatus(id: string, current: 'pending' | 'done' | null) {
    this.toggleStatusSpy(id, current);
    return of(undefined);
  }

  setAll(items: (IssueI & { id: string })[]): void {
    this._all = items;
  }
  setFiltered(items: (IssueI & { id: string })[]): void {
    this._filtered = items;
  }
  private _resource(items: (IssueI & { id: string })[]) {
    return {
      isLoading: (): boolean => false,
      hasValue: (): boolean => true,
      value: (): (IssueI & { id: string })[] => items,
      reload: vi.fn(),
      error: (): unknown => undefined,
    };
  }
}

class FakeScopeContext {
  readonly selectedProjectId = signal<string | null>('p1');
  readonly scope = signal<'global' | { kind: 'project'; projectId: string }>({
    kind: 'project',
    projectId: 'p1',
  });
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

describe('IssueList', () => {
  let fixture: ComponentFixture<IssueList>;
  let component: IssueList;
  let repo: FakeIssueRepository;
  let scope: FakeScopeContext;
  let confirm: FakeConfirm;
  let toast: FakeToast;
  let filter: FilterService;

  beforeEach(async () => {
    repo = new FakeIssueRepository();
    scope = new FakeScopeContext();
    confirm = new FakeConfirm();
    toast = new FakeToast();

    await TestBed.configureTestingModule({
      imports: [IssueList],
      providers: [
        { provide: IssueRepository, useValue: repo },
        { provide: ScopeContext, useValue: scope },
        { provide: ConfirmService, useValue: confirm },
        { provide: ToastService, useValue: toast },
        FilterService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueList);
    component = fixture.componentInstance;
    filter = TestBed.inject(FilterService);
    filter.reset();
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders one row per issue (tasks and notes)', () => {
    repo.setAll([
      makeIssue({ id: 'a', title: 'A' }),
      makeIssue({ id: 'b', title: 'B', isNote: true, status: null }),
    ]);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="issue-row"]');
    expect(rows.length).toBe(2);
  });

  it('shows the description icon for notes instead of a status circle', () => {
    repo.setAll([makeIssue({ id: 'a', isNote: true, status: null, title: 'Mi nota' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector('[data-testid="status-circle"]');
    const noteIcon = fixture.nativeElement.querySelector('[data-testid="note-icon"]');
    expect(circle).toBeNull();
    expect(noteIcon).toBeTruthy();
  });

  it('shows the status circle for tasks', () => {
    repo.setAll([makeIssue({ id: 'a', isNote: false, status: 'pending', title: 'Tarea' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector('[data-testid="status-circle"]');
    expect(circle).toBeTruthy();
  });

  it('marks the status circle as done when status=done', () => {
    repo.setAll([makeIssue({ id: 'a', isNote: false, status: 'done' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector('[data-testid="status-circle"]');
    expect(circle.className).toContain('status-circle--done');
  });

  it('marks the status circle as high when priority=high and status=pending', () => {
    repo.setAll([makeIssue({ id: 'a', priority: 'high', status: 'pending' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector('[data-testid="status-circle"]');
    expect(circle.className).toContain('status-circle--high');
  });

  it('marks the status circle as normal when priority=normal and status=pending', () => {
    repo.setAll([makeIssue({ id: 'a', priority: 'normal', status: 'pending' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector('[data-testid="status-circle"]');
    expect(circle.className).toContain('status-circle--normal');
  });

  it('click on the status circle calls toggleStatus', () => {
    repo.setAll([makeIssue({ id: 'a', status: 'pending' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector(
      '[data-testid="status-circle"]',
    ) as HTMLButtonElement;
    circle.click();
    expect(repo.toggleStatusSpy).toHaveBeenCalledWith('a', 'pending');
  });

  it('shows "Selecciona un proyecto" when no project is selected', () => {
    scope.selectedProjectId.set(null);
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('[data-testid="empty-no-project"]');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Selecciona un proyecto');
  });

  it('opens the create modal and resets the form', () => {
    component.openCreate();
    expect(component.isFormModalOpen()).toBe(true);
    expect(component.formStatus().editing).toBeUndefined();
  });

  it('opens the edit modal prefilled with the issue values', () => {
    const issue = makeIssue({ id: 'a', title: 'Viejo', priority: 'high' });
    component.openEdit(issue);
    expect(component.isFormModalOpen()).toBe(true);
    expect(component.formStatus().editing?.id).toBe('a');
  });

  it('addIssue is called with trimmed form values', async () => {
    component.openCreate();
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({
      title: '  Limpiar trim  ',
      description: '  desc  ',
      isNote: false,
      priority: 'high',
      dueDate: '2026-12-31',
    });
    await component.save();
    expect(repo.addIssueSpy).toHaveBeenCalledOnce();
    const written = repo.addIssueSpy.mock.calls[0][0] as Partial<IssueI>;
    expect(written.title).toBe('Limpiar trim');
    expect(written.description).toBe('desc');
    expect(written.priority).toBe('high');
    expect(written.isNote).toBe(false);
    expect(written.dueAt).toBeInstanceOf(Timestamp);
  });

  it('addIssue strips dueAt and forces status=null when isNote=true', async () => {
    component.openCreate();
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({
      title: 'Mi nota',
      description: 'desc',
      isNote: true,
      priority: 'normal',
      dueDate: '',
    });
    await component.save();
    const written = repo.addIssueSpy.mock.calls[0][0] as Partial<IssueI>;
    expect(written.isNote).toBe(true);
    expect(written.status).toBeNull();
    expect(written.dueAt).toBeUndefined();
  });

  it('addIssue is rejected when title is empty', async () => {
    component.openCreate();
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ title: '', description: '', isNote: false, priority: 'normal' });
    await component.save();
    expect(repo.addIssueSpy).not.toHaveBeenCalled();
  });

  it('updateIssue is called when editing an existing issue', async () => {
    const issue = makeIssue({ id: 'a', title: 'Old' });
    component.openEdit(issue);
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ title: 'New', description: '', isNote: false, priority: 'normal' });
    await component.save();
    expect(repo.updateIssueSpy).toHaveBeenCalled();
    const [id, patch] = repo.updateIssueSpy.mock.calls[0];
    expect(id).toBe('a');
    expect((patch as Partial<IssueI>).title).toBe('New');
  });

  it('deleteIssue asks for confirmation and is called on confirm', async () => {
    const issue = makeIssue({ id: 'a', title: 'Mi tarea' });
    confirm.delete.mockResolvedValue(true);
    await component.remove(issue);
    expect(confirm.delete).toHaveBeenCalledWith(expect.stringContaining('Mi tarea'));
    expect(repo.deleteIssueSpy).toHaveBeenCalledWith('a');
  });

  it('deleteIssue is NOT called when the user cancels the confirmation', async () => {
    const issue = makeIssue({ id: 'a', title: 'X' });
    confirm.delete.mockResolvedValue(false);
    await component.remove(issue);
    expect(repo.deleteIssueSpy).not.toHaveBeenCalled();
  });

  it('filter.apply causes getFilteredCollection to be invoked with new options', () => {
    filter.apply(component.filterSchema, [{ key: 'priority', op: '==', value: 'high' }]);
    expect(repo.getFilteredCollection).toHaveBeenCalled();
  });
});
