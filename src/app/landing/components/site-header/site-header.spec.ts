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

  it('renders the public anchor navigation', () => {
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('nav a');
    const hrefs = Array.from(links).map((link) => (link as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toContain('/#features');
    expect(hrefs).toContain('/#how-it-works');
    expect(hrefs).toContain('/#security');
    expect(fixture.nativeElement.textContent).toContain('Características');
    expect(fixture.nativeElement.textContent).toContain('Cómo funciona');
    expect(fixture.nativeElement.textContent).toContain('Seguridad');
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

  it('keeps anchor navigation and shows authenticated CTAs when isLogged is true', () => {
    fixture.componentRef.setInput('isLogged', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const hrefs = Array.from(root.querySelectorAll('nav a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(hrefs).toEqual(
      expect.arrayContaining(['/#features', '/#how-it-works', '/#security', '/home']),
    );
    expect(root.textContent).toContain('Ir al dashboard');
    expect(root.textContent).toContain('Cerrar sesión');
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

  it('renders a mobile dropdown trigger', () => {
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[role="button"][aria-label="Abrir menú"]',
    ) as HTMLElement;
    expect(trigger).toBeTruthy();
  });

  it('renders the mobile dropdown content with anchor links and public CTAs', () => {
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector('ul.dropdown-content');
    expect(panel).toBeTruthy();

    const hrefs = Array.from(panel!.querySelectorAll('a')).map((link) =>
      (link as HTMLAnchorElement).getAttribute('href'),
    );
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/#features',
        '/#how-it-works',
        '/#security',
        '/login',
        '/login/register',
      ]),
    );
  });

  it('renders the mobile dropdown CTAs for logged-in users', () => {
    fixture.componentRef.setInput('isLogged', true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('ul.dropdown-content') as HTMLElement;
    expect(panel).toBeTruthy();
    const hrefs = Array.from(panel.querySelectorAll('a')).map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/home');

    const logoutButton = panel.querySelector('button.text-error') as HTMLButtonElement;
    expect(logoutButton).toBeTruthy();
    logoutButton.click();
    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
