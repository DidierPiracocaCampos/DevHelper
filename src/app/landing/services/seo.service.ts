import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://devhelper-a61ef.web.app';

export interface SeoPage {
  title: string;
  description: string;
  path: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly _title = inject(Title);
  private readonly _meta = inject(Meta);
  private readonly _doc = inject(DOCUMENT);

  set(page: SeoPage): void {
    const url = `${SITE_URL}${page.path}`;
    const image = page.image ?? `${SITE_URL}/img/landing/hero-home.webp`;
    this._title.setTitle(page.title);
    this._meta.updateTag({ name: 'description', content: page.description });
    this._meta.updateTag({ property: 'og:title', content: page.title });
    this._meta.updateTag({ property: 'og:description', content: page.description });
    this._meta.updateTag({ property: 'og:url', content: url });
    this._meta.updateTag({ property: 'og:image', content: image });
    this._meta.updateTag({ property: 'og:type', content: 'website' });
    this._meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    let link = this._doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this._doc.createElement('link');
      link.rel = 'canonical';
      this._doc.head.appendChild(link);
    }
    link.href = url;
  }
}
