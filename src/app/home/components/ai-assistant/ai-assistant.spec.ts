/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AiAssistant } from './ai-assistant';
import { AiService } from '../../ai/ai.service';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';
import { VaultSecurity } from '../../../shared/security';

describe('AiAssistant', () => {
  let component: AiAssistant;
  let mockAi: Partial<AiService>;
  let mockPrefs: Partial<PreferencesService>;

  beforeEach(() => {
    mockAi = {
      status: signal<'disabled' | 'downloading' | 'ready' | 'error'>('disabled'),
      downloadProgress: signal(null),
      isProcessing: signal(false),
      lastResult: signal(null),
      enable: () => Promise.resolve(),
      disable: () => {},
      query: () => Promise.resolve({ intent: 'unknown', answer: 'test', matched: [] }),
    } as any;
    mockPrefs = {
      aiAssistantEnabled: signal(false),
      aiSearcherEnabled: signal(true),
      setAiAssistantEnabled: vi.fn().mockResolvedValue(undefined),
      setAiSearcherEnabled: vi.fn().mockResolvedValue(undefined),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AiAssistant,
        { provide: AiService, useValue: mockAi },
        { provide: PreferencesService, useValue: mockPrefs },
        { provide: VaultSecurity, useValue: { isUnlocked: signal(true) } },
      ],
    });
    component = TestBed.inject(AiAssistant);
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('exposes searcherEnabled from preferences', () => {
    expect(component.searcherEnabled()).toBe(true);
    (mockPrefs.aiSearcherEnabled as any).set(false);
    expect(component.searcherEnabled()).toBe(false);
  });

  it('enable() also sets aiSearcherEnabled=true when activating the assistant', async () => {
    (mockPrefs.aiSearcherEnabled as any).set(false);
    await component.enable();
    expect(mockPrefs.setAiSearcherEnabled).toHaveBeenCalledWith(true);
  });

  it('disable() still persists aiAssistantEnabled=false', async () => {
    await component.disable();
    expect(mockPrefs.setAiAssistantEnabled).toHaveBeenCalledWith(false);
  });

  it('ask() is defensive against non-string text (does not throw)', async () => {
    // Simulates a stale listener or a wrong-type emission.
    await expect(component.ask(undefined as unknown as string)).resolves.not.toThrow();
    await expect(component.ask(null as unknown as string)).resolves.not.toThrow();
    await expect(component.ask(42 as unknown as string)).resolves.not.toThrow();
  });
});

describe('AiAssistant template (4 states)', () => {
  let fixture: ComponentFixture<AiAssistant>;
  let mockAi: any;
  let mockPrefs: any;
  let mockVault: { isUnlocked: ReturnType<typeof signal<boolean>> };

  beforeEach(async () => {
    mockAi = {
      status: signal<'disabled' | 'downloading' | 'ready' | 'error'>('disabled'),
      downloadProgress: signal(null),
      isProcessing: signal(false),
      lastResult: signal(null),
      enable: vi.fn().mockResolvedValue(undefined),
      disable: vi.fn(),
      query: vi.fn().mockResolvedValue({ intent: 'unknown', answer: 'test', matched: [] }),
    };
    mockPrefs = {
      aiAssistantEnabled: signal(false),
      aiSearcherEnabled: signal(true),
      setAiAssistantEnabled: vi.fn().mockResolvedValue(undefined),
      setAiSearcherEnabled: vi.fn().mockResolvedValue(undefined),
    };
    mockVault = { isUnlocked: signal(true) };

    await TestBed.configureTestingModule({
      imports: [AiAssistant],
      providers: [
        { provide: AiService, useValue: mockAi },
        { provide: PreferencesService, useValue: mockPrefs },
        { provide: VaultSecurity, useValue: mockVault },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistant);
  });

  function findButtonByText(text: string): HTMLButtonElement | undefined {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    return buttons.find((b) => (b.textContent ?? '').includes(text));
  }

  it('does not render the search field when enabled=true but status=disabled (model evicted)', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('disabled');
    fixture.detectChanges();

    const searchField = fixture.nativeElement.querySelector('ui-search-field');
    expect(searchField).toBeNull();
  });

  it('renders an "Activar modelo" button when enabled=true but status=disabled', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('disabled');
    fixture.detectChanges();

    expect(findButtonByText('Activar modelo')).toBeTruthy();
  });

  it('clicking "Activar modelo" calls enable()', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('disabled');
    fixture.detectChanges();

    const button = findButtonByText('Activar modelo') as HTMLButtonElement;
    expect(button).toBeTruthy();
    button.click();
    expect(mockAi.enable).toHaveBeenCalled();
  });

  it('renders the search field when enabled=true and status=ready', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('ready');
    fixture.detectChanges();

    const searchField = fixture.nativeElement.querySelector('ui-search-field');
    expect(searchField).toBeTruthy();
  });

  it('renders the "Activar asistente" card when enabled=false', () => {
    mockPrefs.aiAssistantEnabled.set(false);
    mockAi.status.set('disabled');
    fixture.detectChanges();

    const searchField = fixture.nativeElement.querySelector('ui-search-field');
    expect(searchField).toBeNull();
    expect(findButtonByText('Activar asistente')).toBeTruthy();
  });

  it('does not render the search field when vault is locked (even if status=ready)', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('ready');
    mockVault.isUnlocked.set(false);
    fixture.detectChanges();

    const searchField = fixture.nativeElement.querySelector('ui-search-field');
    expect(searchField).toBeNull();
  });

  it('renders a vault-locked message when vault is locked and status=ready', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('ready');
    mockVault.isUnlocked.set(false);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toMatch(/vault bloqueado/i);
  });

  it('renders the search field when vault is unlocked and status=ready', () => {
    mockPrefs.aiAssistantEnabled.set(true);
    mockAi.status.set('ready');
    mockVault.isUnlocked.set(true);
    fixture.detectChanges();

    const searchField = fixture.nativeElement.querySelector('ui-search-field');
    expect(searchField).toBeTruthy();
  });
});
