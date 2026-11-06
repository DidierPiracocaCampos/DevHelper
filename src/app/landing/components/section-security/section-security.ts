import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Reveal } from '../../directives/reveal.directive';
import { SOCIAL_LINKS } from '../../data/social-links';

@Component({
  selector: 'landing-section-security',
  standalone: true,
  imports: [Reveal],
  templateUrl: './section-security.html',
  styleUrl: './section-security.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionSecurity {
  readonly id = input<string>('security');
  protected readonly github = SOCIAL_LINKS.github;
}
