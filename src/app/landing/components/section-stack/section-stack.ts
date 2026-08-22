import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface StackItem {
  name: string;
  logo: string;
  groupTitle: string;
}

interface StackChip {
  name: string;
  logo: string;
}

const STACK: readonly StackItem[] = [
  { name: 'Angular 20', logo: '/icons/stack/angular.svg', groupTitle: 'Interfaz' },
  { name: 'DaisyUI 5', logo: '/icons/stack/daisyui.svg', groupTitle: 'Interfaz' },
  { name: 'Tailwind 4', logo: '/icons/stack/tailwind.svg', groupTitle: 'Interfaz' },
  { name: 'Firebase', logo: '/icons/stack/firebase.svg', groupTitle: 'Datos y auth' },
];

/** Repeat items so the track is wide enough for a smooth infinite scroll. */
function densify(items: readonly StackChip[], times = 2): readonly StackChip[] {
  return Array.from({ length: times }, () => items).flat();
}

const CHIPS: readonly StackChip[] = densify(
  STACK.map(({ name, logo }) => ({ name, logo })),
  3,
);

@Component({
  selector: 'landing-section-stack',
  standalone: true,
  templateUrl: './section-stack.html',
  styleUrl: './section-stack.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionStack {
  readonly id = input<string>('stack');
  readonly entries = STACK;
  readonly chips = CHIPS;
}
