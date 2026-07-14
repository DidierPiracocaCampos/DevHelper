import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProjectI, ProjectCreateInput } from '../../domain/project.interface';
import { ProjectRepository } from '../../service/projects.repository';
import { projectFilterSchema } from '../../service/project-filter.schema';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { UiButton } from '../../../shared/components/ui-button/button';
import { UiModal } from '../../../shared/components/ui-modal/ui-modal';
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
  readonly openMenuProjectId = signal<string | null>(null);
  readonly menuPosition = signal<{ top: string; left: string }>({ top: '0', left: '0' });

  toggleMenu(id: string, event?: Event): void {
    const current = this.openMenuProjectId();
    if (current === id) {
      this.openMenuProjectId.set(null);
      return;
    }
    if (current) {
      this.hideMenu(current);
    }
    if (event) {
      const trigger = event.currentTarget as HTMLElement | null;
      if (trigger) this.positionMenu(id, trigger);
    }
    this.openMenuProjectId.set(id);
  }

  closeMenu(id?: string): void {
    const targetId = id ?? this.openMenuProjectId();
    if (targetId) {
      this.hideMenu(targetId);
    }
    this.openMenuProjectId.set(null);
  }

  runMenuAction(p: ProjectI & { id: string }, action: 'edit' | 'archive' | 'delete'): void {
    if (action === 'edit') this.openEdit(p);
    else if (action === 'archive') this.archive(p);
    else this.deleteProject(p);
    this.closeMenu(p.id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const openId = this.openMenuProjectId();
    if (!openId) return;
    const target = event.target as Node | null;
    if (!target) return;
    const menu = this.getMenuEl(openId);
    const trigger = document.getElementById(`project-menu-trigger-${openId}`);
    if (menu?.contains(target) || trigger?.contains(target)) return;
    this.closeMenu();
  }

  private positionMenu(id: string, trigger: HTMLElement): void {
    const menu = this.getMenuEl(id);
    if (!menu) return;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || 176;
    const left = Math.max(4, rect.right - menuWidth);
    const top = rect.bottom + 4;
    this.menuPosition.set({ top: `${top}px`, left: `${left}px` });
  }

  private hideMenu(id: string): void {
    void id;
  }

  private getMenuEl(id: string): HTMLElement | null {
    return document.getElementById(`project-menu-${id}`);
  }

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
