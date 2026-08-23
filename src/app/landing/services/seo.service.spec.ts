import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SeoService] });
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  it('sets title, description, og and canonical', () => {
    service.set({ title: 'DevHelper', description: 'desc', path: '/' });
    expect(title.getTitle()).toBe('DevHelper');
    expect(meta.getTag('name="description"')?.content).toBe('desc');
    expect(meta.getTag('property="og:title"')?.content).toBe('DevHelper');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://devhelper-a61ef.web.app/');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://devhelper-a61ef.web.app/',
    );
  });

  it('sets og image and twitter tags with default image', () => {
    service.set({ title: 'DevHelper', description: 'desc', path: '/' });
    expect(meta.getTag('property="og:site_name"')?.content).toBe('DevHelper');
    expect(meta.getTag('property="og:locale"')?.content).toBe('es_ES');
    expect(meta.getTag('property="og:type"')?.content).toBe('website');
    expect(meta.getTag('property="og:description"')?.content).toBe('desc');
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://devhelper-a61ef.web.app/og-image.jpg',
    );
    expect(meta.getTag('property="og:image:secure_url"')?.content).toBe(
      'https://devhelper-a61ef.web.app/og-image.jpg',
    );
    expect(meta.getTag('property="og:image:type"')?.content).toBe('image/jpeg');
    expect(meta.getTag('property="og:image:width"')?.content).toBe('1200');
    expect(meta.getTag('property="og:image:height"')?.content).toBe('630');
    expect(meta.getTag('property="og:image:alt"')?.content).toBe(
      'DevHelper — workspace personal cifrado para developers',
    );
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(meta.getTag('name="twitter:title"')?.content).toBe('DevHelper');
    expect(meta.getTag('name="twitter:description"')?.content).toBe('desc');
    expect(meta.getTag('name="twitter:image"')?.content).toBe(
      'https://devhelper-a61ef.web.app/og-image.jpg',
    );
    expect(meta.getTag('name="twitter:image:alt"')?.content).toBe(
      'DevHelper — workspace personal cifrado para developers',
    );
  });

  it('uses custom image and imageAlt when provided', () => {
    service.set({
      title: 'Custom',
      description: 'custom desc',
      path: '/about',
      image: 'https://devhelper-a61ef.web.app/img/custom.jpg',
      imageAlt: 'Custom alt',
    });
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://devhelper-a61ef.web.app/img/custom.jpg',
    );
    expect(meta.getTag('property="og:image:alt"')?.content).toBe('Custom alt');
    expect(meta.getTag('name="twitter:image"')?.content).toBe(
      'https://devhelper-a61ef.web.app/img/custom.jpg',
    );
    expect(meta.getTag('name="twitter:image:alt"')?.content).toBe('Custom alt');
  });
});
