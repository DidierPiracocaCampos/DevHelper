import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';
import { SiteHeader } from '../../components/site-header/site-header';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { SeoService } from '../../services/seo.service';
import { OBSIDIAN_LINKS } from '../../data/obsidian-links';

@Component({
  selector: 'landing-obsidian',
  standalone: true,
  imports: [RouterLink, SiteHeader, SiteFooter],
  templateUrl: './obsidian.html',
  styleUrl: './obsidian.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObsidianPage {
  private readonly _auth = inject(Authenticator);
  private readonly _seo = inject(SeoService);
  protected readonly isLogged = this._auth.isLoggedIn;
  protected readonly links = OBSIDIAN_LINKS;

  constructor() {
    this._seo.set({
      title: 'DevHelper para Obsidian — plugin y theme',
      description:
        'DevHelper Dashboard es un plugin de Obsidian para registrar tus avances: proyectos, tareas, notas, archivos, credenciales cifradas y calendario sobre notas Markdown. Con el theme DevHelper a juego.',
      path: '/obsidian',
    });
  }
}
