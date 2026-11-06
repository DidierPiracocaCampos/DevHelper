import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { About } from './about';
import { Authenticator } from '../../../shared/service/authenticator';

class FakeAuth {
  readonly user = signal<{ uid: string } | null>(null);
  readonly isLoggedIn = computed(() => !!this.user());
  logout = (() => Promise.resolve()) as unknown as Authenticator['logout'];
}

describe('About', () => {
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([]), { provide: Authenticator, useValue: new FakeAuth() }],
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    fixture.detectChanges();
  });

  const root = () => fixture.nativeElement as HTMLElement;

  it('says what the app is in the H1', () => {
    expect(root().querySelector('h1')?.textContent).toContain(
      'DevHelper es una app para registrar tus avances.',
    );
  });

  it('shows the app in images with descriptive alt text', () => {
    const images = Array.from(root().querySelectorAll('main img'));
    expect(images.length).toBe(3);
    for (const image of images) {
      expect(image.getAttribute('alt')?.length).toBeGreaterThan(20);
      expect(image.getAttribute('width')).toBeTruthy();
      expect(image.getAttribute('height')).toBeTruthy();
    }
  });

  it('explains how a task records progress', () => {
    const steps = Array.from(root().querySelectorAll('.about__step h3'));
    expect(steps.map((step) => step.textContent?.trim())).toEqual([
      'Divide el proyecto en tareas',
      'Apunta qué pasó y cómo lo resolviste',
      'Encuéntralo cuando vuelva a hacer falta',
    ]);
  });

  it('labels example data and links to sign up', () => {
    expect(root().textContent).toContain('datos de ejemplo');
    expect(root().querySelector('a[href="/login/register"]')).toBeTruthy();
  });

  it('makes no privacy claim the product does not meet', () => {
    const text = root().textContent ?? '';
    expect(text).not.toContain('Ni siquiera');
    expect(text).not.toContain('backdoor');
    expect(text).not.toContain('workspace personal cifrado');
    expect(text).toContain('Los proyectos, tareas, notas y eventos no');
  });
});
