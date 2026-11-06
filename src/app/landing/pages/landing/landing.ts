import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Authenticator } from '../../../shared/service/authenticator';
import { SectionHero } from '../../components/section-hero/section-hero';
import { SectionFeatures } from '../../components/section-features/section-features';
import { SectionHowItWorks } from '../../components/section-how-it-works/section-how-it-works';
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
    SectionFeatures,
    SectionSearch,
    SectionHowItWorks,
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
      title: 'DevHelper — Tu memoria técnica, siempre a mano',
      description:
        'Workspace para desarrolladores: proyectos, tareas y eventos en un solo lugar, con contraseñas y archivos cifrados en cliente e IA local opcional.',
      path: '/',
    });
  }
}
