import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { IssueI, IssueCreateInput } from '../../domain/issue.interface';
import { IssueRepository } from '../../service/issues.repository';
import { issueFilterSchema } from '../../service/issue-filter.schema';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import {
  UiTextField,
  UiTextareaField,
  UiDateField,
  ErrorMessage,
} from '../../../shared/forms/fields';
import { UiListItem } from '../../../shared/components/item-list/item-list';
import { UiListButton } from '../../../shared/components/list-button/list-button';
import { ActiveFilters, FilterBar, FilterService } from '../../../shared/filter';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { ScopeContext } from '../../../shared/scope/scope-context';

interface IssueFormStatus {
  editing?: IssueI & { id: string };
  loading: boolean;
}

@Component({
  selector: 'issue-list',
  imports: [
    ReactiveFormsModule,
    UiCard,
    UiCardButton,
    UiButton,
    UiModal,
    UiTooltipComponent,
    UiTextField,
    UiTextareaField,
    UiDateField,
    ErrorMessage,
    UiListItem,
    UiListButton,
    FilterBar,
  ],
  providers: [FilterService],
  templateUrl: './issue-list.html',
  styleUrl: './issue-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueList {
  private _repo = inject(IssueRepository);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _confirm = inject(ConfirmService);
  private _toast = inject(ToastService);
  private _scope = inject(ScopeContext);
  private _filter = inject(FilterService);

  readonly filterSchema = issueFilterSchema;
  readonly collection = this._repo.getFilteredCollection(this._filter.queryOptions);
  readonly hasProject = computed(() => this._scope.selectedProjectId() !== null);

  readonly isFormModalOpen = signal(false);
  readonly formStatus = signal<IssueFormStatus>({ loading: false });

  protected readonly _form = this._formBuilder.group({
    title: this._formBuilder.control<string>('', [Validators.required, Validators.maxLength(200)]),
    description: this._formBuilder.control<string>(''),
    isNote: this._formBuilder.control<boolean>(false),
    priority: this._formBuilder.control<'normal' | 'high'>('normal'),
    dueDate: this._formBuilder.control<string>(''),
  });

  onFiltersApply(_filters: ActiveFilters): void {
    this.collection.reload();
  }

  onFiltersClear(): void {
    this.collection.reload();
  }

  openCreate(): void {
    this.formStatus.set({ loading: false });
    this._form.reset({
      title: '',
      description: '',
      isNote: false,
      priority: 'normal',
      dueDate: '',
    });
    this.isFormModalOpen.set(true);
  }

  openEdit(issue: IssueI & { id: string }): void {
    this.formStatus.set({ editing: issue, loading: false });
    this._form.reset({
      title: issue.title,
      description: issue.description ?? '',
      isNote: issue.isNote,
      priority: issue.priority,
      dueDate: issue.dueAt ? this._formatDateForInput(issue.dueAt.toDate()) : '',
    });
    this.isFormModalOpen.set(true);
  }

  cancelForm(): void {
    this.isFormModalOpen.set(false);
    this.formStatus.set({ loading: false });
    this._form.reset({
      title: '',
      description: '',
      isNote: false,
      priority: 'normal',
      dueDate: '',
    });
  }

  async save(): Promise<void> {
    if (this._form.invalid) {
      this._form.markAllAsDirty();
      return;
    }
    const editing = this.formStatus().editing;
    const raw = this._form.getRawValue();
    const isNote = raw.isNote;
    const title = raw.title.trim();
    const description = raw.description.trim() || undefined;
    const priority = raw.priority;

    this.formStatus.update((s) => ({ ...s, loading: true }));

    try {
      if (editing?.id) {
        const patch: Partial<IssueI> = { title, isNote, priority };
        if (description !== undefined) patch.description = description;
        if (!isNote && raw.dueDate) {
          patch.dueAt = Timestamp.fromDate(new Date(raw.dueDate));
        } else {
          patch.dueAt = undefined;
        }
        await firstValueFrom(this._repo.updateIssue(editing.id, patch));
        this._toast.success('Tarea actualizada');
      } else {
        const input: IssueCreateInput = {
          title,
          status: isNote ? null : 'pending',
          isNote,
          priority,
        };
        if (description !== undefined) input.description = description;
        if (!isNote && raw.dueDate) {
          input.dueAt = Timestamp.fromDate(new Date(raw.dueDate));
        }
        await firstValueFrom(this._repo.addIssue(input));
        this._toast.success(isNote ? 'Nota creada' : 'Tarea creada');
      }
      this.isFormModalOpen.set(false);
      this.formStatus.set({ loading: false });
      this.collection.reload();
    } catch (_err) {
      this.formStatus.update((s) => ({ ...s, loading: false }));
      this._toast.error(editing ? 'No se pudo actualizar' : 'No se pudo crear');
    }
  }

  async toggleStatus(issue: IssueI & { id: string }): Promise<void> {
    if (issue.isNote) return;
    await firstValueFrom(this._repo.toggleStatus(issue.id, issue.status));
    this.collection.reload();
  }

  async remove(issue: IssueI & { id: string }): Promise<void> {
    const ok = await this._confirm.delete(
      `¿Eliminar "${issue.title}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    this._repo.deleteIssue(issue.id).subscribe({
      next: () => {
        this._toast.success('Eliminado');
        this.collection.reload();
      },
      error: () => this._toast.error('No se pudo eliminar'),
    });
  }

  statusCircleClass(issue: IssueI): string {
    if (issue.isNote) return '';
    if (issue.status === 'done') return 'status-circle--done';
    if (issue.priority === 'high') return 'status-circle--high';
    return 'status-circle--normal';
  }

  private _formatDateForInput(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
