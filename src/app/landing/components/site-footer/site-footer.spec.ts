import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SiteFooter } from './site-footer';
import { TERMS_VERSION } from '../../data/terms-version';

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
  });

  it('renders the three column titles', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Producto');
    expect(html).toContain('Legal');
    expect(html).toContain('DevHelper');
  });

  it('renders the Producto column links', () => {
    const features = fixture.nativeElement.querySelector('a[href="/#features"]');
    const security = fixture.nativeElement.querySelector('a[href="/#security"]');
    expect(features).toBeTruthy();
    expect(security).toBeTruthy();
  });

  it('renders the Legal column links', () => {
    const terms = fixture.nativeElement.querySelector('a[href="/legal/terms"]');
    const about = fixture.nativeElement.querySelector('a[href="/about"]');
    expect(terms).toBeTruthy();
    expect(about).toBeTruthy();
  });

  it('renders the T&C version line using TERMS_VERSION', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain(`T&C versión ${TERMS_VERSION}`);
  });
});
