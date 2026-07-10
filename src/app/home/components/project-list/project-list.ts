import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProjectI, ProjectCreateInput } from '../../domain/project.interface';
import { ProjectRepository } from '../../service/projects.repository';
import { projectFilterSchema } from '../../service/project-filter.schema';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
import { UiTooltipComponent } from '../../../shared/components/tooltip';
import { UiTextField, UiTextareaField, ErrorMessage } from '../../../shared/forms/fields';
import { ActiveFilters, FilterBar, FilterService } from '../../../shared/filter';
import { ConfirmService } from '../../../shared/service/confirm.service';
import { ToastService } from '../../../shared/service/toast';
import { SelectedProjectStore } from '../../../shared/scope';

interface FormStatus {
  editing?: ProjectI;
  loading: boolean;
}

@Component({
  selector: 'project-list',
  imports: [
    ReactiveFormsModule,
    UiCard,
    UiCardButton,
    UiButton,
    UiModal,
    UiTooltipComponent,
    UiTextField,
    UiTextareaField,
    ErrorMessage,
    FilterBar,
  ],
  providers: [FilterService],
  templateUrl: './project-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectList {
  private _repo = inject(ProjectRepository);
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _confirmService = inject(ConfirmService);
  private _toastService = inject(ToastService);
  private _selected = inject(SelectedProjectStore);
  private _filter = inject(FilterService);

  readonly filterSchema = projectFilterSchema;
  readonly collection = this._repo.getFilteredCollection(this._filter.queryOptions);

  readonly isFormModalOpen = signal(false);
  readonly formStatus = signal<FormStatus>({ loading: false });
  readonly selectedId = this._selected.selectedId;

  protected readonly _form = this._formBuilder.group({
    name: this._formBuilder.control<string>('', [Validators.required, Validators.maxLength(200)]),
    tag: this._formBuilder.control<string>(''),
    description: this._formBuilder.control<string>(''),
  });

  constructor() {
    effect(() => {
      const loading = this.collection.isLoading();
      const items = this.collection.value();
      const current = this.selectedId();
      if (loading) return;
      if (current) return;
      if (!items || items.length === 0) return;

      const saved = this._selected.readSaved();
      const match = saved ? items.find((p) => p.id === saved) : undefined;
      const target = match ?? items[0];
      this.select(target);
    });
  }

  onFiltersApply(_filters: ActiveFilters): void {
    this.collection.reload();
  }

  onFiltersClear(): void {
    this.collection.reload();
  }

  select(p: ProjectI & { id: string }): void {
    this._selected.set(p.id);
  }

  openCreate(): void {
    this.formStatus.set({ loading: false });
    this._form.reset({ name: '', tag: '', description: '' });
    this.isFormModalOpen.set(true);
  }

  openEdit(p: ProjectI & { id: string }): void {
    this.formStatus.set({ editing: p, loading: false });
    this._form.reset({
      name: p.name,
      tag: p.tag ?? '',
      description: p.description ?? '',
    });
    this.isFormModalOpen.set(true);
  }

  cancelForm(): void {
    this.isFormModalOpen.set(false);
    this.formStatus.set({ loading: false });
    this._form.reset({ name: '', tag: '', description: '' });
  }

  async save(): Promise<void> {
    if (this._form.invalid) {
      this._form.markAllAsDirty();
      return;
    }
    const editing = this.formStatus().editing;
    const raw = this._form.getRawValue();
    const tag = raw.tag.trim();
    const description = raw.description.trim();
    const payload: ProjectCreateInput = { name: raw.name.trim() };
    if (tag) payload.tag = tag;
    if (description) payload.description = description;

    this.formStatus.update((s) => ({ ...s, loading: true }));

    try {
      if (editing?.id) {
        await firstValueFrom(this._repo.updateProject(editing.id, payload));
        this._toastService.success('Proyecto actualizado');
      } else {
        await firstValueFrom(this._repo.addProject(payload));
        this._toastService.success('Proyecto creado');
      }
      this.isFormModalOpen.set(false);
      this.formStatus.set({ loading: false });
      this._form.reset({ name: '', tag: '', description: '' });
      this.collection.reload();
    } catch (_err) {
      this.formStatus.update((s) => ({ ...s, loading: false }));
      this._toastService.error(
        editing ? 'No se pudo actualizar el proyecto' : 'No se pudo crear el proyecto',
      );
    }
  }

  archive(p: ProjectI & { id: string }): void {
    const next = !p.archived;
    this._repo.archiveProject(p.id, next).subscribe({
      next: () => {
        this._toastService.success(next ? 'Proyecto archivado' : 'Proyecto restaurado');
        this.collection.reload();
      },
      error: () => this._toastService.error('No se pudo cambiar el estado del proyecto'),
    });
  }

  async deleteProject(p: ProjectI & { id: string }): Promise<void> {
    const confirmed = await this._confirmService.delete(
      `¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    this._repo.deleteProject(p.id).subscribe({
      next: () => {
        this._toastService.success('Proyecto eliminado');
        if (this.selectedId() === p.id) {
          this._selected.clear();
        }
        this.collection.reload();
      },
      error: () => this._toastService.error('No se pudo eliminar el proyecto'),
    });
  }
}
