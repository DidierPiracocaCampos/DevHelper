import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { IssueDetail } from './issue-detail';
import { IssueRepository } from '../../service/issues.repository';
import { IssueI } from '../../domain/issue.interface';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';

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
  readonly updateIssue = vi.fn(() => of(undefined));
  readonly deleteIssue = vi.fn(() => of(undefined));
  readonly toggleStatus = vi.fn(() => of(undefined));
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

  it('save() forwards trimmed values to updateIssue including solution', async () => {
    repo.setCurrent(makeIssue({ id: 'i1', title: 'Antiguo' }));
    component.reload();
    component['_form'].patchValue({
      title: '  Nuevo  ',
      description: '  desc  ',
      solution: '  Reiniciar  ',
    });
    await component.save();
    expect(repo.updateIssue).toHaveBeenCalled();
    const [_id, patch] = repo.updateIssue.mock.calls[0];
    expect((patch as Partial<IssueI>).title).toBe('Nuevo');
    expect((patch as Partial<IssueI>).description).toBe('desc');
    expect((patch as Partial<IssueI>).solution).toBe('Reiniciar');
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
