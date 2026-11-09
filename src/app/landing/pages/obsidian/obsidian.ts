import { ViewportScroller } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authenticator } from '../../../shared/service/authenticator';
import { SiteHeader } from '../../components/site-header/site-header';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { Reveal } from '../../directives/reveal.directive';
import { SeoService } from '../../services/seo.service';
import { OBSIDIAN_LINKS } from '../../data/obsidian-links';

interface Capability {
  title: string;
  text: string;
}

interface DocsIndexItem {
  id: string;
  label: string;
}

const CAPABILITIES: readonly Capability[] = [
  {
    title: 'Proyectos y tareas',
    text: 'Cada proyecto es una carpeta con su nota principal; cada tarea, una nota abierta o hecha. Tus favoritos quedan a un clic.',
  },
  {
    title: 'Notas',
    text: 'Notas sueltas de un proyecto, sin estado, para lo que solo quieres recordar.',
  },
  {
    title: 'Archivos y proyecto General',
    text: 'Copia archivos a la carpeta de cada proyecto. Los que no son de ninguno van al proyecto General.',
  },
  {
    title: 'Credenciales cifradas',
    text: 'Usuarios y contraseñas por proyecto, cifrados con una contraseña maestra que nunca se guarda.',
  },
  {
    title: 'Calendario mensual',
    text: 'Eventos, reuniones, fechas límite y avisos, con rangos de días y repeticiones, sin crear una nota por cada día.',
  },
  {
    title: 'Botones de la barra',
    text: 'Tus propios atajos en JavaScript en la barra del dashboard, desactivados hasta que los permitas.',
  },
];

const DOCS_INDEX: readonly DocsIndexItem[] = [
  { id: 'instalacion', label: 'Instalación' },
  { id: 'primeros-pasos', label: 'Primeros pasos' },
  { id: 'skills', label: 'Skills de IA' },
  { id: 'credenciales', label: 'Credenciales' },
  { id: 'botones', label: 'Botones con código' },
  { id: 'faq', label: 'Preguntas frecuentes' },
];

const SITE_URL = 'https://devhelper.didierpiracoca.com';

const AUTHOR = {
  '@type': 'Person',
  name: 'Didier Piracoca',
  url: 'https://github.com/DidierPiracocaCampos',
};

const FREE = { '@type': 'Offer', price: '0', priceCurrency: 'EUR' };

const OBSIDIAN_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'DevHelper Dashboard',
      description:
        'Plugin de Obsidian que reúne proyectos, tareas, notas, archivos, credenciales cifradas y un calendario mensual en un dashboard sobre notas Markdown.',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'Plugin de Obsidian',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      url: OBSIDIAN_LINKS.pluginStore,
      sameAs: OBSIDIAN_LINKS.pluginRepo,
      screenshot: `${SITE_URL}/img/obsidian/dashboard.webp`,
      inLanguage: 'es',
      isAccessibleForFree: true,
      offers: FREE,
      author: AUTHOR,
    },
    {
      '@type': 'SoftwareApplication',
      name: 'DevHelper (theme de Obsidian)',
      description:
        'Theme oscuro y monocromo para Obsidian, diseñado junto al plugin DevHelper Dashboard.',
      applicationCategory: 'DesignApplication',
      applicationSubCategory: 'Theme de Obsidian',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      url: OBSIDIAN_LINKS.themeStore,
      sameAs: OBSIDIAN_LINKS.themeRepo,
      screenshot: `${SITE_URL}/img/obsidian/theme.webp`,
      isAccessibleForFree: true,
      offers: FREE,
      author: AUTHOR,
    },
  ],
};

@Component({
  selector: 'landing-obsidian',
  standalone: true,
  imports: [RouterLink, SiteHeader, SiteFooter, Reveal],
  templateUrl: './obsidian.html',
  styleUrl: './obsidian.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObsidianPage {
  private readonly _auth = inject(Authenticator);
  private readonly _seo = inject(SeoService);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);
  protected readonly isLogged = this._auth.isLoggedIn;
  protected readonly links = OBSIDIAN_LINKS;
  protected readonly capabilities = CAPABILITIES;
  protected readonly docsIndex = DOCS_INDEX;
  protected readonly activeDoc = signal<string | null>(null);

  constructor() {
    // Same offset as the landing: router fragment scrolling ignores scroll-margin-top.
    inject(ViewportScroller).setOffset([0, 88]);
    this._seo.set({
      title: 'Plugin de Obsidian para proyectos y tareas | DevHelper',
      description:
        'Plugin gratuito de Obsidian para registrar tus avances: proyectos, tareas, notas, archivos, credenciales cifradas y calendario. Con un theme a juego.',
      path: '/obsidian',
      image: `${SITE_URL}/og-obsidian.jpg`,
      imageAlt: 'DevHelper Dashboard, plugin de proyectos y tareas para Obsidian',
      jsonLd: OBSIDIAN_JSON_LD,
    });

    afterNextRender(() => this._watchActiveDoc());
  }

  /** Marks the docs index entry whose section crosses the upper third of the viewport. */
  private _watchActiveDoc(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = DOCS_INDEX.map((item) =>
      this._host.nativeElement.querySelector<HTMLElement>(`#${item.id}`),
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.activeDoc.set(entry.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach((el) => observer.observe(el));
    this._destroyRef.onDestroy(() => observer.disconnect());
  }
}
