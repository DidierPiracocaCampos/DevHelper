import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionStack } from './section-stack';

describe('SectionStack', () => {
  let fixture: ComponentFixture<SectionStack>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionStack],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionStack);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('lists the four technologies with their logo and role', () => {
    const items = root.querySelectorAll('.stack__item');
    expect(items.length).toBe(4);
    for (const item of items) {
      const logo = item.querySelector('.stack__logo') as HTMLElement;
      expect(logo.getAttribute('aria-hidden')).toBe('true');
      expect(logo.style.getPropertyValue('mask-image')).toContain('/icons/stack/');
      expect(item.querySelector('.stack__role')?.textContent?.trim()).toBeTruthy();
    }
  });

  it('avoids the daisyUI stack class on its root', () => {
    expect(root.querySelector('section')?.classList).not.toContain('stack');
  });

  it('is honest about Firebase being a proprietary service', () => {
    const text = root.textContent ?? '';
    expect(text).toContain('Firebase, un servicio de Google');
    expect(text).not.toContain('vendor lock-in');
    expect(text).not.toContain('Todo el stack es open source');
  });

  it('links to the public repository', () => {
    expect(root.querySelector('a[href*="github.com"]')?.getAttribute('rel')).toBe(
      'noopener noreferrer',
    );
  });
});
