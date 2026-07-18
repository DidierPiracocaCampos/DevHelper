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

  it('uses the default id "security" for the anchor', () => {
    const section = fixture.nativeElement.querySelector('section#security');
    expect(section).toBeTruthy();
  });

  it('renders the four security bullets in the correct order', () => {
    const items = Array.from(fixture.nativeElement.querySelectorAll('ul li')) as HTMLElement[];
    expect(items.length).toBe(4);
    expect(items[0].textContent).toContain('AES-GCM 256-bit');
    expect(items[0].textContent).toContain('La clave maestra nunca sale de tu dispositivo');
    expect(items[1].textContent).toContain('PIN o Passkey (WebAuthn)');
    expect(items[1].textContent).toContain('datos son irrecuperables');
    expect(items[2].textContent).toContain('Sin backdoor del servidor');
    expect(items[3].textContent).toContain('eur3');
  });

  it('renders the T&C link to /legal/terms in a new tab', () => {
    const link = fixture.nativeElement.querySelector('a[href="/legal/terms"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.textContent?.trim()).toBe('Lee los detalles en Términos y Condiciones');
  });
});
