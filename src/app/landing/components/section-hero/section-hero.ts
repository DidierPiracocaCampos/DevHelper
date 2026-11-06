import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_TASKS, findDemoTask } from '../../data/demo-tasks';

@Component({
  selector: 'landing-section-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-hero.html',
  styleUrl: './section-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHero {
  protected readonly tasks = DEMO_TASKS;
  protected readonly query = signal('');
  protected readonly task = computed(() => findDemoTask(this.query()));
  protected readonly visibleTasks = computed(() => {
    const task = this.task();
    return task ? [task] : [];
  });
  protected readonly status = computed(() => {
    const task = this.task();
    return task ? 'Tarea de ejemplo encontrada: ' + task.title : 'Sin resultados en el ejemplo';
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.query.set('');
  }
}
