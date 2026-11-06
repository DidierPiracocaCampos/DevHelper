import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionSecurity } from './section-security';

describe('SectionSecurity', () => {
  let fixture: ComponentFixture<SectionSecurity>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSecurity],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionSecurity);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders the section heading', () => {
    expect(root.querySelector('h2')?.textContent).toContain('Esto se cifra. Esto no.');
  });

  it('separates what is encrypted from what is not', () => {
    const encrypted = root.querySelector('[data-boundary="encrypted"]')?.textContent;
    const plain = root.querySelector('[data-boundary="plain"]')?.textContent;
    expect(encrypted).toContain('El valor de tus contraseñas');
    expect(encrypted).toContain('El contenido de tus archivos');
    expect(plain).toContain('Proyectos, tareas y notas');
    expect(plain).toContain('Eventos');
    expect(plain).toContain('Nombres de contraseñas y archivos');
  });

  it('makes no absolute privacy claim the product does not meet', () => {
    const text = root.textContent ?? '';
    expect(text).not.toContain('Zero-knowledge');
    expect(text).not.toContain('ni siquiera');
    expect(text).not.toContain('extremo a extremo');
  });

  it('warns that encrypted data cannot be recovered', () => {
    expect(root.querySelector('.security__warning')?.textContent).toContain(
      'lo cifrado no se puede recuperar',
    );
  });

  it('links to the public repository', () => {
    expect(root.querySelector('a[href*="github.com"]')).toBeTruthy();
  });
});
