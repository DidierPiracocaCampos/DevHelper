import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SectionStack } from './section-stack';

describe('SectionStack', () => {
  it('renders all stack badges', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const badges = root.querySelectorAll('.badge');
    expect(badges.length).toBe(9);
  });
});
