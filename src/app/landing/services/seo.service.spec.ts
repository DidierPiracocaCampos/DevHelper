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
});
