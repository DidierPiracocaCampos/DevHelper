import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Authenticator } from '../../../shared/service/authenticator';
import { SectionHero } from '../../components/section-hero/section-hero';
import { SectionFeatures } from '../../components/section-features/section-features';
import { SectionHowItWorks } from '../../components/section-how-it-works/section-how-it-works';
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
      title: 'DevHelper — Tu memoria técnica, organizada y protegida',
      description:
        'Workspace cifrado en cliente para desarrolladores: proyectos, tareas, credenciales, archivos y eventos, con IA local opcional.',
      path: '/',
    });
  }
}
