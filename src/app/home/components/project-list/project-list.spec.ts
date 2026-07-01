import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { computed, signal, Signal } from '@angular/core';
import { of } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { ProjectList } from './project-list';
import { ProjectRepository } from '../../service/projects.repository';
import { ProjectI } from '../../domain/project.interface';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { FilterService } from '../../../shared/filter';
import { QueryOptions } from '../../../shared/api/api.interfaces';

const STORAGE_KEY = 'devhelper:selectedProjectId';

function makeProject(over: Partial<ProjectI> = {}): ProjectI & { id: string } {
  const now = Timestamp.now();
  return {
    id: 'p1',
    name: 'Yedra',
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

class MockStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

class FakeProjectRepository {
  private _allItemsSignal = signal<(ProjectI & { id: string })[]>([]);
  private _filteredItemsSignal = signal<(ProjectI & { id: string })[]>([]);
  private _loadingSignal = signal(false);

  readonly addProjectSpy = vi.fn();
  readonly updateProjectSpy = vi.fn();
  readonly archiveProjectSpy = vi.fn();
  readonly deleteProjectSpy = vi.fn();

  getCollection = vi.fn(() => ({
    isLoading: this._loadingSignal,
    hasValue: () => true,
    value: this._allItemsSignal,
    reload: vi.fn(),
    error: vi.fn(),
  }));

  getFilteredCollection = vi.fn((options: Signal<QueryOptions>) => ({
    isLoading: this._loadingSignal,
    hasValue: () => true,
    value: computed(() => {
      const opts = options();
      return opts.filters && opts.filters.length > 0
        ? this._filteredItemsSignal()
        : this._allItemsSignal();
    }),
    reload: vi.fn(),
    error: vi.fn(),
  }));

  addProject(input: { name: string; tag?: string; description?: string }) {
    const now = Timestamp.now();
    const payload = { ...input, archived: false, createdAt: now, updatedAt: now };
    this.addProjectSpy(payload);
    return of({ id: 'new-id', ...payload });
  }

  updateProject(id: string, patch: Partial<ProjectI>) {
    this.updateProjectSpy(id, patch);
    return of(undefined);
  }

  archiveProject(id: string, archived: boolean) {
    this.archiveProjectSpy(id, archived);
    return of(undefined);
  }

  deleteProject(id: string) {
    this.deleteProjectSpy(id);
    return of(undefined);
  }

  setAllItems(items: (ProjectI & { id: string })[]): void {
    this._allItemsSignal.set(items);
  }

  setFilteredItems(items: (ProjectI & { id: string })[]): void {
    this._filteredItemsSignal.set(items);
  }
}

class FakeConfirm {
  delete = vi.fn();
}

class FakeToast {
  success = vi.fn();
  error = vi.fn();
  warning = vi.fn();
  info = vi.fn();
}

class FakeScopeContext {
  readonly scope = signal<'global' | { kind: 'project'; projectId: string }>('global');
  readonly selectedProjectId = signal<string | null>(null);
  setGlobal = vi.fn(() => this.scope.set('global'));
  setProject = vi.fn((id: string) => {
    this.scope.set({ kind: 'project', projectId: id });
    this.selectedProjectId.set(id);
  });
}

describe('ProjectList', () => {
  let fixture: ComponentFixture<ProjectList>;
  let component: ProjectList;
  let repo: FakeProjectRepository;
  let confirm: FakeConfirm;
  let toast: FakeToast;
  let scope: FakeScopeContext;
  let filter: FilterService;
  let mockStorage: MockStorage;

  beforeEach(async () => {
    repo = new FakeProjectRepository();
    confirm = new FakeConfirm();
    toast = new FakeToast();
    scope = new FakeScopeContext();
    mockStorage = new MockStorage();
    vi.stubGlobal('localStorage', mockStorage);

    await TestBed.configureTestingModule({
      imports: [ProjectList],
      providers: [
        { provide: ProjectRepository, useValue: repo },
        { provide: ConfirmService, useValue: confirm },
        { provide: ToastService, useValue: toast },
        { provide: ScopeContext, useValue: scope },
        FilterService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectList);
    component = fixture.componentInstance;
    filter = fixture.componentRef.injector.get(FilterService);
    filter.reset();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function setItems(items: (ProjectI & { id: string })[], savedId: string | null = null): void {
    mockStorage.clear();
    if (savedId) {
      mockStorage.setItem(STORAGE_KEY, savedId);
    }
    repo.setAllItems(items);
    fixture.detectChanges();
  }

  it('opens the create modal when the + button is clicked', () => {
    component.openCreate();
    expect(component.isFormModalOpen()).toBe(true);
    expect(component.formStatus().editing).toBeUndefined();
  });

  it('opens the edit modal prefilled when edit is clicked on a project', () => {
    const p = makeProject({ id: 'p1', name: 'Yedra', tag: 'frontend' });
    component.openEdit(p);
    expect(component.isFormModalOpen()).toBe(true);
    expect(component.formStatus().editing?.id).toBe('p1');
  });

  it('calls repository.addProject with the trimmed form values', async () => {
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ name: '  Yedra  ', tag: 'frontend', description: ' desc ' });
    await component.save();
    expect(repo.addProjectSpy).toHaveBeenCalledWith({
      name: 'Yedra',
      tag: 'frontend',
      description: 'desc',
      archived: false,
      createdAt: expect.objectContaining({ toMillis: expect.any(Function) }),
      updatedAt: expect.objectContaining({ toMillis: expect.any(Function) }),
    });
    expect(component.isFormModalOpen()).toBe(false);
  });

  it('accepts a project with only a name (tag and description optional)', async () => {
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ name: 'Solo nombre', tag: '', description: '' });
    await component.save();
    expect(repo.addProjectSpy).toHaveBeenCalledOnce();
    const written = repo.addProjectSpy.mock.calls[0][0] as ProjectI;
    expect(written.name).toBe('Solo nombre');
    expect(written.tag).toBeUndefined();
    expect(written.description).toBeUndefined();
  });

  it('calls repository.updateProject when editing an existing project', async () => {
    const p = makeProject({ id: 'p1', name: 'Old', tag: 'old' });
    component.openEdit(p);
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ name: 'New', tag: 'new', description: '' });
    await component.save();
    expect(repo.updateProjectSpy).toHaveBeenCalled();
    const [id, patch] = repo.updateProjectSpy.mock.calls[0];
    expect(id).toBe('p1');
    expect(patch.name).toBe('New');
    expect(patch.tag).toBe('new');
  });

  it('does not call addProject when the form is invalid (empty name)', async () => {
    const form = (component as unknown as { _form: { patchValue: (v: unknown) => void } })._form;
    form.patchValue({ name: '', tag: '', description: '' });
    await component.save();
    expect(repo.addProjectSpy).not.toHaveBeenCalled();
  });

  it('does not require the vault: project actions are plain data', () => {
    component.openCreate();
    expect(component.isFormModalOpen()).toBe(true);
  });

  it('asks for confirmation and deletes on confirm', async () => {
    confirm.delete.mockResolvedValue(true);
    const p = makeProject({ id: 'p1', name: 'Yedra' });
    await component.deleteProject(p);
    expect(confirm.delete).toHaveBeenCalledWith(
      '¿Eliminar "Yedra"? Esta acción no se puede deshacer.',
    );
    expect(repo.deleteProjectSpy).toHaveBeenCalledWith('p1');
  });

  it('does not delete when the user cancels the confirmation', async () => {
    confirm.delete.mockResolvedValue(false);
    const p = makeProject({ id: 'p1', name: 'Yedra' });
    await component.deleteProject(p);
    expect(repo.deleteProjectSpy).not.toHaveBeenCalled();
  });

  it('archive calls archiveProject with the opposite of the current archived flag', async () => {
    const p = makeProject({ id: 'p1', name: 'Yedra', archived: false });
    await component.archive(p);
    expect(repo.archiveProjectSpy).toHaveBeenCalledWith('p1', true);
  });

  it('unarchive calls archiveProject with false when the project is archived', async () => {
    const p = makeProject({ id: 'p1', name: 'Yedra', archived: true });
    await component.archive(p);
    expect(repo.archiveProjectSpy).toHaveBeenCalledWith('p1', false);
  });

  it('select sets the project in the scope context', () => {
    const p = makeProject({ id: 'p1' });
    component.select(p);
    expect(scope.setProject).toHaveBeenCalledWith('p1');
  });

  it('select writes the selected project id to localStorage', () => {
    const p = makeProject({ id: 'p1' });
    component.select(p);
    expect(mockStorage.getItem(STORAGE_KEY)).toBe('p1');
  });

  it('select with a different id updates localStorage', () => {
    component.select(makeProject({ id: 'a' }));
    component.select(makeProject({ id: 'b' }));
    expect(mockStorage.getItem(STORAGE_KEY)).toBe('b');
  });

  it('renders one pill per project', () => {
    repo.setAllItems([makeProject({ id: 'a', name: 'a' }), makeProject({ id: 'b', name: 'b' })]);
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('[data-testid="project-pill"]');
    expect(pills.length).toBe(2);
    expect(pills[0].textContent).toContain('a');
    expect(pills[1].textContent).toContain('b');
  });

  it('does not render the tag in the pill', () => {
    repo.setAllItems([makeProject({ id: 'a', name: 'a', tag: 'frontend' })]);
    fixture.detectChanges();
    const pill = fixture.nativeElement.querySelector('[data-testid="project-pill"]');
    expect(pill.textContent).not.toContain('frontend');
    expect(pill.textContent).not.toContain('#');
  });

  it('marks the selected pill with the primary background class', () => {
    scope.setProject('p1');
    repo.setAllItems([
      makeProject({ id: 'p1', name: 'Yedra' }),
      makeProject({ id: 'p2', name: 'betcan' }),
    ]);
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('[data-testid="project-pill"]');
    expect(pills[0].className).toContain('bg-primary');
    expect(pills[1].className).not.toContain('bg-primary');
  });

  it('auto-selects the first project when there is no saved value', () => {
    setItems([makeProject({ id: 'a', name: 'a' }), makeProject({ id: 'b', name: 'b' })]);
    expect(scope.setProject).toHaveBeenCalledWith('a');
  });

  it('restores the saved project from localStorage when it still exists', () => {
    setItems([makeProject({ id: 'a', name: 'a' }), makeProject({ id: 'b', name: 'b' })], 'b');
    expect(scope.setProject).toHaveBeenCalledWith('b');
  });

  it('falls back to the first project when the saved id no longer exists', () => {
    setItems(
      [makeProject({ id: 'a', name: 'a' }), makeProject({ id: 'b', name: 'b' })],
      'deleted-id',
    );
    expect(scope.setProject).toHaveBeenCalledWith('a');
    expect(mockStorage.getItem(STORAGE_KEY)).toBe('a');
  });

  it('does not auto-select when the user has already selected a project', () => {
    scope.setProject('manual');
    setItems([makeProject({ id: 'a', name: 'a' }), makeProject({ id: 'b', name: 'b' })]);
    expect(scope.setProject).toHaveBeenCalledTimes(1);
    expect(scope.setProject).toHaveBeenCalledWith('manual');
  });

  it('clears localStorage when the currently selected project is deleted', async () => {
    setItems([makeProject({ id: 'a', name: 'a' })], 'a');
    expect(mockStorage.getItem(STORAGE_KEY)).toBe('a');
    confirm.delete.mockResolvedValue(true);
    await component.deleteProject(makeProject({ id: 'a', name: 'a' }));
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(scope.setGlobal).toHaveBeenCalled();
  });
});
