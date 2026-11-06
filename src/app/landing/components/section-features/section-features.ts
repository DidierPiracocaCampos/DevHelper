import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'landing-section-features',
  standalone: true,
  templateUrl: './section-features.html',
  styleUrl: './section-features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionFeatures {
  readonly id = input<string>('features');
}
