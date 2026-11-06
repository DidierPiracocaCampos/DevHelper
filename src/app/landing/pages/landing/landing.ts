import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Authenticator } from '../../../shared/service/authenticator';
import { SectionHero } from '../../components/section-hero/section-hero';
import { SectionFeatures } from '../../components/section-features/section-features';
import { SectionCapabilities } from '../../components/section-capabilities/section-capabilities';
import { SectionSearch } from '../../components/section-search/section-search';
import { SectionSecurity } from '../../components/section-security/section-security';
import { SectionStack } from '../../components/section-stack/section-stack';
import { SectionCta } from '../../components/section-cta/section-cta';
import { SiteHeader } from '../../components/site-header/site-header';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'landing-page',
  standalone: true,
  imports: [
    SiteHeader,
    SectionHero,
    SectionCapabilities,
    SectionFeatures,
    SectionSearch,
    SectionSecurity,
    SectionStack,
    SectionCta,
    SiteFooter,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  private readonly _auth = inject(Authenticator);
  private readonly _seo = inject(SeoService);
  protected readonly isLogged = this._auth.isLoggedIn;

  constructor() {
    this._seo.set({
      title: 'DevHelper: registra tus avances y encuéntralos cuando vuelvan',
      description:
        'App para registrar tus avances como desarrollador: proyectos y tareas con su solución, contraseñas y archivos cifrados en cliente, eventos e IA local opcional.',
      path: '/',
    });
  }
}
