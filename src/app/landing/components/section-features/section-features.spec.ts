import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionFeatures } from './section-features';

describe('SectionFeatures', () => {
  let fixture: ComponentFixture<SectionFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionFeatures);
    fixture.detectChanges();
  });

  it('renders the section heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Todo lo que necesitas en un solo lugar');
  });

  it('renders the six feature cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(6);
  });

  it('renders 6 features each with title, description and image', () => {
    const root = fixture.nativeElement as HTMLElement;
    const cards = root.querySelectorAll('.card');
    expect(cards.length).toBe(6);
    const images = root.querySelectorAll('img');
    expect(images.length).toBe(6);
  });
});
