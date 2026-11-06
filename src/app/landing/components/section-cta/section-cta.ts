import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../directives/reveal.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-section-cta',
  standalone: true,
  imports: [RouterLink, Reveal],
  templateUrl: './section-cta.html',
  styleUrl: './section-cta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCta {}
