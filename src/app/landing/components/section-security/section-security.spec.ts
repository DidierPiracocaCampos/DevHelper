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

  it('renders the four security cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('article.card');
    expect(cards.length).toBe(4);
    const titles = Array.from(cards as NodeListOf<HTMLElement>).map((card) =>
      card.querySelector('.card-title')?.textContent?.trim(),
    );
    expect(titles).toEqual([
      'Cifrado AES-GCM 256',
      'PIN o Passkey',
      'Zero-knowledge',
      'Firebase eur3',
    ]);
  });

  it('renders the vault screenshot in the DOM', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/img/landing/vault-home.webp');
    expect(img?.getAttribute('alt')).toBe('Vista del workspace protegido de DevHelper');
    expect(img?.getAttribute('width')).toBe('2560');
    expect(img?.getAttribute('height')).toBe('1600');
  });

  it('marks security icons as decorative', () => {
    const icons = fixture.nativeElement.querySelectorAll('.icon');
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
