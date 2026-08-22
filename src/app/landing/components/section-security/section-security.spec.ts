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

  it('renders the four security bullets', () => {
    const items = fixture.nativeElement.querySelectorAll('ul li');
    expect(items.length).toBe(4);
    const texts = Array.from(items as NodeListOf<HTMLElement>).map((item) =>
      item.querySelector('span:last-child')?.textContent?.trim(),
    );
    expect(texts).toEqual([
      'Cifrado AES-GCM 256 en dispositivo antes de sincronizar.',
      'PIN o Passkey con clave local.',
      'Sin acceso administrativo ni cuenta maestra.',
      'Firebase eur3 y acceso owner-only.',
    ]);
  });

  it('renders the vault screenshot in the DOM', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/img/landing/vault-home.png');
    expect(img?.getAttribute('alt')).toBe('Vista del workspace protegido de DevHelper');
    expect(img?.getAttribute('width')).toBe('2560');
    expect(img?.getAttribute('height')).toBe('1600');
  });

  it('marks security icons as decorative', () => {
    const icons = fixture.nativeElement.querySelectorAll('.icon');
    expect(icons.length).toBe(4);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
