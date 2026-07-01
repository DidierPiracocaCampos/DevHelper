import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { computed, signal, Signal } from '@angular/core';
import { Timestamp, FieldValue } from '@angular/fire/firestore';
import { of, throwError } from 'rxjs';
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
  private _allItemsSignal = signal<(IssueI & { id: string })[]>([]);
  private _filteredItemsSignal = signal<(IssueI & { id: string })[]>([]);
  private _loadingSignal = signal(false);

  readonly addIssueSpy = vi.fn();
  readonly updateIssueSpy = vi.fn();
  readonly deleteIssueSpy = vi.fn();
  readonly toggleStatusSpy = vi.fn();

  getCollection = vi.fn(() => ({
    isLoading: this._loadingSignal,
    hasValue: (): boolean => true,
    value: this._allItemsSignal,
    reload: vi.fn(),
    error: (): unknown => undefined,
  }));

  getFilteredCollection = vi.fn((options: Signal<QueryOptions>) => ({
    isLoading: this._loadingSignal,
    hasValue: (): boolean => true,
    value: computed(() => {
      const opts = options();
      return opts.filters && opts.filters.length > 0
        ? this._filteredItemsSignal()
        : this._allItemsSignal();
    }),
    reload: vi.fn(),
    error: (): unknown => undefined,
  }));

  addIssue(input: {
    title: string;
    description?: string;
    status?: 'pending' | 'done' | null;
    isNote: boolean;
    priority: 'normal' | 'high';
    dueAt?: Timestamp;
  }) {
    const now = Timestamp.now();
    const payload: IssueI = {
      title: input.title,
      status: input.isNote ? null : (input.status ?? 'pending'),
      isNote: input.isNote,
      priority: input.priority ?? 'normal',
      createdAt: now,
      updatedAt: now,
    };
    if (input.description !== undefined) payload.description = input.description;
    if (input.dueAt !== undefined) payload.dueAt = input.dueAt;
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
    this._allItemsSignal.set(items);
  }
  setFiltered(items: (IssueI & { id: string })[]): void {
    this._filteredItemsSignal.set(items);
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

  it('edit with empty description sets patch.description to a deleteField sentinel', async () => {
    const issue = makeIssue({ id: 'a', description: 'original desc' });
    component.openEdit(issue);
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({
      title: 'Edited',
      description: '',
      isNote: false,
      priority: 'normal',
      dueDate: '',
    });
    await component.save();
    expect(repo.updateIssueSpy).toHaveBeenCalled();
    const patch = repo.updateIssueSpy.mock.calls[0][1] as Partial<IssueI>;
    expect(patch.description).toBeInstanceOf(FieldValue);
  });

  it('toggling task→note (with a dueDate set) sets patch.dueAt to a deleteField sentinel', async () => {
    const issue = makeIssue({ id: 'a', isNote: false, dueAt: Timestamp.now() });
    component.openEdit(issue);
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({
      title: 'Convert to note',
      description: '',
      isNote: true,
      priority: 'normal',
      dueDate: '',
    });
    await component.save();
    expect(repo.updateIssueSpy).toHaveBeenCalled();
    const patch = repo.updateIssueSpy.mock.calls[0][1] as Partial<IssueI>;
    expect(patch.dueAt).toBeInstanceOf(FieldValue);
  });

  it('toggleStatus shows a toast when the repository errors', async () => {
    const issue = makeIssue({ id: 'a', isNote: false, status: 'pending' });
    (repo as unknown as { toggleStatus: () => ReturnType<typeof throwError> }).toggleStatus = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('boom')));
    await component.toggleStatus(issue);
    expect(toast.error).toHaveBeenCalled();
    const message = toast.error.mock.calls[0][0] as string;
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });

  it('openInNewTab opens the detail route in a new browser tab', () => {
    const issue = makeIssue({ id: 'i1' });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.openInNewTab(issue);
    expect(openSpy).toHaveBeenCalledWith('/proyect/p1/issues/i1', '_blank', 'noopener,noreferrer');
  });

  it('clicking the row body opens the detail in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    repo.setAll([makeIssue({ id: 'a', title: 'A' })]);
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.issue-list-row-body') as HTMLElement;
    body.click();
    expect(openSpy).toHaveBeenCalledWith('/proyect/p1/issues/a', '_blank', 'noopener,noreferrer');
  });

  it('clicking the status circle does NOT open the detail in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    repo.setAll([makeIssue({ id: 'a', status: 'pending' })]);
    fixture.detectChanges();
    const circle = fixture.nativeElement.querySelector(
      '[data-testid="status-circle"]',
    ) as HTMLButtonElement;
    circle.click();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('clicking an actions button does NOT open the detail in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    repo.setAll([makeIssue({ id: 'a' })]);
    fixture.detectChanges();
    const deleteBtn = fixture.nativeElement.querySelector(
      '[data-testid="issue-row"] ui-list-button[icon="delete"] button',
    ) as HTMLButtonElement;
    deleteBtn.click();
    expect(openSpy).not.toHaveBeenCalled();
  });
});
