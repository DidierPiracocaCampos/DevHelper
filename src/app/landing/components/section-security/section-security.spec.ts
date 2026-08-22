import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionSecurity } from './section-security';

describe('SectionSecurity', () => {
  let fixture: ComponentFixture<SectionSecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSecurity],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionSecurity);
    fixture.detectChanges();
  });

  it('renders the section heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Seguridad y privacidad');
  });

  it('renders the four security rows as a list (no card boxes)', () => {
    const root = fixture.nativeElement as HTMLElement;
    const rows = root.querySelectorAll('.section-security__row');
    expect(rows.length).toBe(4);
    const titles = Array.from(rows as NodeListOf<HTMLElement>).map((row) =>
      row.querySelector('h3')?.textContent?.trim(),
    );
    expect(titles).toEqual([
      'Cifrado AES-GCM 256',
      'PIN o Passkey',
      'Zero-knowledge',
      'Firebase eur3',
    ]);
    expect(root.querySelectorAll('article.card').length).toBe(0);
  });

  it('renders the vault screenshot in the DOM', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/img/landing/vault-home.webp');
    expect(img?.getAttribute('alt')).toBe('Vista del workspace protegido de DevHelper');
    expect(img?.getAttribute('width')).toBe('2560');
    expect(img?.getAttribute('height')).toBe('1600');
  });

  it('marks icon and marker spans as decorative', () => {
    const root = fixture.nativeElement as HTMLElement;
    const decorative = root.querySelectorAll('.section-security__marker, .icon');
    expect(decorative.length).toBeGreaterThan(0);
    for (const node of decorative) {
      expect(node.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
