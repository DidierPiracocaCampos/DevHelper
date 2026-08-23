import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SOCIAL_LINKS } from '../../data/social-links';
import { TERMS_VERSION } from '../../data/terms-version';

@Component({
  selector: 'landing-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  readonly termsVersion = TERMS_VERSION;
  readonly social = SOCIAL_LINKS;
}
