import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionCta } from './section-cta';

describe('SectionCta', () => {
  let fixture: ComponentFixture<SectionCta>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCta);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('closes with the call to action', () => {
    expect(root.querySelector('h2')?.textContent).toContain('Lo próximo que resuelvas, guárdalo.');
    expect(root.querySelector('a[href="/login/register"].btn-primary')).toBeTruthy();
    expect(root.querySelector('a[href="/login"]')).toBeTruthy();
  });

  it('hides the decorative blank task from assistive technology', () => {
    expect(root.querySelector('.blank')?.getAttribute('aria-hidden')).toBe('true');
  });
});
