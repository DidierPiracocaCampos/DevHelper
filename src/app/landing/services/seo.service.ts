import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_URL = 'https://devhelper-a61ef.web.app';

export interface SeoPage {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly _title = inject(Title);
  private readonly _meta = inject(Meta);
  private readonly _doc = inject(DOCUMENT);

  set(page: SeoPage): void {
    const url = `${SITE_URL}${page.path}`;
    const image = page.image ?? `${SITE_URL}/og-image.jpg`;
    const imageAlt = page.imageAlt ?? 'DevHelper — workspace personal cifrado para developers';
    this._title.setTitle(page.title);
    this._meta.updateTag({ name: 'description', content: page.description });
    this._meta.updateTag({ property: 'og:site_name', content: 'DevHelper' });
    this._meta.updateTag({ property: 'og:locale', content: 'es_ES' });
    this._meta.updateTag({ property: 'og:title', content: page.title });
    this._meta.updateTag({ property: 'og:description', content: page.description });
    this._meta.updateTag({ property: 'og:url', content: url });
    this._meta.updateTag({ property: 'og:type', content: 'website' });
    this._meta.updateTag({ property: 'og:image', content: image });
    this._meta.updateTag({ property: 'og:image:secure_url', content: image });
    this._meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this._meta.updateTag({ property: 'og:image:width', content: '1200' });
    this._meta.updateTag({ property: 'og:image:height', content: '630' });
    this._meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this._meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this._meta.updateTag({ name: 'twitter:title', content: page.title });
    this._meta.updateTag({ name: 'twitter:description', content: page.description });
    this._meta.updateTag({ name: 'twitter:image', content: image });
    this._meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });
    let link = this._doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this._doc.createElement('link');
      link.rel = 'canonical';
      this._doc.head.appendChild(link);
    }
    link.href = url;
  }
}
