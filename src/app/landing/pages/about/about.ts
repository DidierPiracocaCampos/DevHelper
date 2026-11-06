import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';
import { SiteHeader } from '../../components/site-header/site-header';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'landing-about',
  standalone: true,
  imports: [RouterLink, SiteHeader, SiteFooter],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly _auth = inject(Authenticator);
  private readonly _seo = inject(SeoService);
  protected readonly isLogged = this._auth.isLoggedIn;

  constructor() {
    this._seo.set({
      title: 'Qué es DevHelper',
      description:
        'DevHelper es una app para registrar tus avances como desarrollador: proyectos, tareas, soluciones, archivos y contraseñas en un solo lugar.',
      path: '/about',
    });
  }
}
