import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../directives/reveal.directive';

interface Capability {
  readonly label: string;
  readonly icon: string;
  readonly fragment: string;
}

@Component({
  selector: 'landing-section-capabilities',
  standalone: true,
  imports: [RouterLink, Reveal],
  templateUrl: './section-capabilities.html',
  styleUrl: './section-capabilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCapabilities {
  protected readonly items: readonly Capability[] = [
    { label: 'Proyectos y tareas', icon: 'task_alt', fragment: 'feature-tasks' },
    { label: 'Tus avances', icon: 'trending_up', fragment: 'feature-progress' },
    { label: 'Buscador', icon: 'search', fragment: 'search' },
    { label: 'Archivos', icon: 'folder', fragment: 'feature-files' },
    { label: 'Contraseñas', icon: 'key', fragment: 'feature-passwords' },
    { label: 'Eventos', icon: 'event', fragment: 'feature-events' },
    { label: 'IA local', icon: 'memory', fragment: 'feature-ai' },
  ];

  protected delay(index: number): number {
    return Math.min(index * 40, 240);
  }
}
