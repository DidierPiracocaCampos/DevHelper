import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionCta } from './section-cta';

describe('SectionCta', () => {
  let fixture: ComponentFixture<SectionCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionCta);
    fixture.detectChanges();
  });

  it('renders the CTA heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Empieza a centralizar tu memoria técnica');
  });
});
