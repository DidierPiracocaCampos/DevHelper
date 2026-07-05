/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AiAssistant } from './ai-assistant';
import { AiService } from '../../ai/ai.service';
import { PreferencesService } from '../../../shared/preferences/services/preferences.service';

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
      setAiAssistantEnabled: vi.fn().mockResolvedValue(undefined),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AiAssistant,
        { provide: AiService, useValue: mockAi },
        { provide: PreferencesService, useValue: mockPrefs },
      ],
    });
    component = TestBed.inject(AiAssistant);
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });
});
