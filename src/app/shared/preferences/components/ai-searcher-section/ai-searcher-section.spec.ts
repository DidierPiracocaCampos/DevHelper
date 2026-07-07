/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AiSearcherSection } from './ai-searcher-section';
import { PreferencesService } from '../../services/preferences.service';

describe('AiSearcherSection', () => {
  let fixture: ComponentFixture<AiSearcherSection>;
  let _component: AiSearcherSection;
  let mockPrefs: any;
  let setAiSearcherEnabled: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    setAiSearcherEnabled = vi.fn().mockResolvedValue(undefined);
    mockPrefs = {
      aiSearcherEnabled: signal(true),
      setAiSearcherEnabled,
    };

    await TestBed.configureTestingModule({
      imports: [AiSearcherSection],
      providers: [{ provide: PreferencesService, useValue: mockPrefs }],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSearcherSection);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a heading', () => {
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toContain('Buscador de IA');
  });

  it('renders toggle as checked when enabled=true', () => {
    const toggle = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it('reflects enabled=false in the toggle', () => {
    mockPrefs.aiSearcherEnabled.set(false);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });

  it('renders the "Desactivar buscador" label', () => {
    expect(fixture.nativeElement.textContent).toContain('Desactivar buscador');
  });

  it('calls setAiSearcherEnabled(false) when toggle is unchecked', async () => {
    mockPrefs.aiSearcherEnabled.set(true);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(setAiSearcherEnabled).toHaveBeenCalledWith(false);
  });

  it('calls setAiSearcherEnabled(true) when toggle is checked', async () => {
    mockPrefs.aiSearcherEnabled.set(false);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(setAiSearcherEnabled).toHaveBeenCalledWith(true);
  });
});
