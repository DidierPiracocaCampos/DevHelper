import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DEMO_TASKS, findDemoTask } from '../../data/demo-tasks';
import { Reveal } from '../../directives/reveal.directive';

@Component({
  selector: 'landing-section-search',
  standalone: true,
  imports: [Reveal],
  templateUrl: './section-search.html',
  styleUrl: './section-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionSearch {
  readonly id = input<string>('search');

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
