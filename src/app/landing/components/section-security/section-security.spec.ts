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
  });
});
