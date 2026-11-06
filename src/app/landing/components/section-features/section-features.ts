import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../../directives/reveal.directive';

@Component({
  selector: 'landing-section-features',
  standalone: true,
  imports: [Reveal],
  templateUrl: './section-features.html',
  styleUrl: './section-features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionFeatures {
  readonly id = input<string>('features');
}
