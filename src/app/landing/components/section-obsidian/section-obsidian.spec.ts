import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionObsidian } from './section-obsidian';
import { OBSIDIAN_LINKS } from '../../data/obsidian-links';

describe('SectionObsidian', () => {
  let fixture: ComponentFixture<SectionObsidian>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionObsidian],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SectionObsidian);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('links to /obsidian and the store', () => {
    expect(root.querySelector('h2')?.textContent).toContain('Obsidian');
    expect(root.querySelector('a[href="/obsidian"]')).toBeTruthy();
    const store = root.querySelector(`a[href="${OBSIDIAN_LINKS.pluginStore}"]`);
    expect(store?.getAttribute('target')).toBe('_blank');
    expect(store?.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
