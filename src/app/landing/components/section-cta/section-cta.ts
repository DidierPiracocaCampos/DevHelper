import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-section-cta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-cta.html',
  styleUrl: './section-cta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCta {}
