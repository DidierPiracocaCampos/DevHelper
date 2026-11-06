import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionHowItWorks } from './section-how-it-works';

describe('SectionHowItWorks', () => {
  let fixture: ComponentFixture<SectionHowItWorks>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHowItWorks],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHowItWorks);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders the three steps in an ordered list', () => {
    expect(root.querySelector('h2')?.textContent).toContain(
      'Tres pasos para no volver a buscarlo.',
    );
    const headings = root.querySelectorAll('ol h3');
    expect(Array.from(headings).map((heading) => heading.textContent?.trim())).toEqual([
      'Crea tu cuenta',
      'Cierra tu vault',
      'Guarda y recupera',
    ]);
  });

  it('links each step to where it continues', () => {
    expect(root.querySelector('a[href="/login/register"]')).toBeTruthy();
    expect(root.querySelector('a[href="/#security"]')).toBeTruthy();
    expect(root.querySelector('a[href="/login"]')).toBeTruthy();
  });

  it('does not promise that tasks are encrypted', () => {
    expect(root.textContent).not.toContain('cifrados con AES-GCM');
  });
});
