import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { SiteHeader } from './site-header';
import { Authenticator } from '../../../shared/service/authenticator';

class FakeAuth {
  logout = vi.fn().mockResolvedValue(undefined);
}

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let auth: FakeAuth;

  beforeEach(async () => {
    auth = new FakeAuth();
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([]), { provide: Authenticator, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
  });

  it('renders the public CTAs when isLogged is false (default)', () => {
    fixture.detectChanges();

    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Iniciar sesión');
    expect(html).toContain('Crear cuenta');
    expect(html).not.toContain('Ir al dashboard');
    expect(html).not.toContain('Cerrar sesión');
  });

  it('renders the dashboard CTAs when isLogged is true', () => {
    fixture.componentRef.setInput('isLogged', true);
    fixture.detectChanges();

    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Ir al dashboard');
    expect(html).toContain('Cerrar sesión');
    expect(html).not.toContain('Iniciar sesión');
    expect(html).not.toContain('Crear cuenta');
  });

  it('calls Authenticator.logout when the logout button is clicked', () => {
    fixture.componentRef.setInput('isLogged', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.btn-error') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    expect(auth.logout).toHaveBeenCalledOnce();
  });

  it('shows the DevHelper logo as a link to /', () => {
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector(
      'a[aria-label="DevHelper - Inicio"]',
    ) as HTMLAnchorElement;
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('href')).toBe('/');
    expect(logo.textContent?.trim()).toBe('DevHelper');
  });
});
