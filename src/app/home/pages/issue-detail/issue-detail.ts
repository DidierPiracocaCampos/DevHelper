import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { deleteField } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { IssueI, IssueStatus, IssuePriority, IssueUpdateInput } from '../../domain/issue.interface';
import { IssueRepository } from '../../service/issues.repository';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { FileList } from '../../components/file-list/file-list';
import { PasswordList } from '../../components/password-list/password-list';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import {
  UiLabel,
  UiTextField,
  UiTextareaField,
  UiSelectField,
  SelectOption,
  ErrorMessage,
} from '../../../shared/forms/fields';

@Component({
  selector: 'issue-detail',
  imports: [
    ReactiveFormsModule,
    NgClass,
    UiTextField,
    UiTextareaField,
    UiLabel,
    UiSelectField,
    ErrorMessage,
    UiCardButton,
    UiTooltipComponent,
    FileList,
    PasswordList,
  ],
  templateUrl: './issue-detail.html',
  styleUrl: './issue-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetail implements OnDestroy {
  private _route = inject(ActivatedRoute);
  private _repo = inject(IssueRepository);
  private _scope = inject(ScopeContext);
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _title = inject(Title);

  protected readonly _form = this._formBuilder.group({
    title: this._formBuilder.control<string>('', [Validators.required, Validators.maxLength(200)]),
    description: this._formBuilder.control<string>(''),
    solution: this._formBuilder.control<string>(''),
    priority: this._formBuilder.control<IssuePriority>('normal'),
  });

  protected readonly priorityOptions: ReadonlyArray<SelectOption<IssuePriority>> = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
  ];

  private readonly _defaultTitle = 'DevhelperWeb';

  readonly projectId = signal<string>('');
  readonly issueId = signal<string>('');
  readonly issue = signal<(IssueI & { id: string }) | null>(null);
  readonly statusCircleClass = computed(() => {
    const it = this.issue();
    if (!it) return 'status-circle--normal';
    if (it.isNote) return '';
    if (it.status === 'done') return 'status-circle--done';
    if (it.priority === 'high') return 'status-circle--high';
    return 'status-circle--normal';
  });

  constructor() {
    const params = this._route.snapshot.paramMap;
    this.projectId.set(params.get('projectId') ?? '');
    this.issueId.set(params.get('issueId') ?? '');
    this._scope.setIssue(this.projectId(), this.issueId());
    this.reload();

    effect(() => {
      const it = this.issue();
      if (!it) return;
      untracked(() => {
        this._form.patchValue(
          {
            title: it.title,
            description: it.description ?? '',
            solution: it.solution ?? '',
            priority: it.priority ?? 'normal',
          },
          { emitEvent: false },
        );
        this._title.setTitle(it.title);
      });
    });
  }

  ngOnDestroy(): void {
    this._scope.setGlobal();
    this._title.setTitle(this._defaultTitle);
  }

  reload(): void {
    const id = this.issueId();
    if (!id) return;
    this._repo.getById(id).subscribe((it) => {
      this.issue.set(it as (IssueI & { id: string }) | null);
    });
  }

  async save(): Promise<void> {
    if (this._form.invalid) {
      this._form.markAllAsDirty();
      return;
    }
    const id = this.issueId();
    if (!id) return;
    const raw = this._form.getRawValue();
    const solutionTrim = raw.solution.trim();
    const patch: IssueUpdateInput = {
      title: raw.title.trim(),
      description: raw.description.trim() || undefined,
      solution: solutionTrim
        ? solutionTrim
        : (deleteField() as unknown as IssueUpdateInput['solution']),
      priority: raw.priority,
    };
    try {
      await firstValueFrom(this._repo.updateIssue(id, patch));
      this._toast.success('Cambios guardados');
      this.reload();
    } catch (_err) {
      this._toast.error('No se pudieron guardar los cambios');
    }
  }

  async remove(): Promise<void> {
    const it = this.issue();
    if (!it) return;
    const ok = await this._confirm.delete(
      `¿Eliminar "${it.title}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    try {
      await firstValueFrom(this._repo.deleteIssue(it.id!));
      this._toast.success('Issue eliminada');
      if (window.opener) {
        window.close();
      }
    } catch (_err) {
      this._toast.error('No se pudo eliminar');
    }
  }

  async toggleStatus(): Promise<void> {
    const it = this.issue();
    if (!it || it.isNote) return;
    const next: IssueStatus = it.status === 'done' ? 'pending' : 'done';
    this.issue.set({ ...it, status: next });
    try {
      await firstValueFrom(this._repo.toggleStatus(it.id!, it.status));
    } catch (_err) {
      this.issue.set(it);
      this._toast.error('No se pudo cambiar el estado');
    }
  }

  export(): void {
    this._toast.info('Exportar: próximamente');
  }
}
