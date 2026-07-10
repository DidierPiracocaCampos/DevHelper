import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { SearchPalette } from './search-palette';
import { SearchPaletteService } from '../../services/search-palette.service';
import { AiService } from '../../../../home/ai/ai.service';
import { VaultModalState } from '../../../security/services/vault-modal-state';
import { IssueLocationService } from '../../services/issue-location.service';
import { SelectedProjectStore } from '../../../scope';

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

describe('SearchPalette', () => {
  let fixture: ComponentFixture<SearchPalette>;
  let component: SearchPalette;
  let palette: {
    isOpen: ReturnType<typeof signal<boolean>>;
    open: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let ai: Partial<AiService>;
  let issueLocation: { findProjectIdByIssue: ReturnType<typeof vi.fn> };
  let selected: { set: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
  let _windowOpenSpy: ReturnType<typeof vi.fn> | undefined;

  beforeEach(async () => {
    palette = {
      isOpen: signal(false),
      open: vi.fn(() => palette.isOpen.set(true)),
      close: vi.fn(() => palette.isOpen.set(false)),
    };
    ai = {
      status: signal('ready') as AiService['status'],
      isProcessing: signal(false) as AiService['isProcessing'],
      lastResult: signal(null) as AiService['lastResult'],
      enable: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue({
        intent: 'search',
        answer: '',
        matched: [
          { id: 'iA', collection: 'issues', title: 'Task A', score: 0.95 },
          { id: 'pB', collection: 'proyectos', title: 'Proj B', score: 0.7 },
          { id: 'pwC', collection: 'passwords', title: 'Pass C', score: 0.6 },
        ],
      }) as AiService['query'],
    };
    const vaultModal = { openUnlock: vi.fn() };
    issueLocation = { findProjectIdByIssue: vi.fn().mockResolvedValue('proj42') };
    selected = { set: vi.fn(), clear: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SearchPalette],
      providers: [
        { provide: SearchPaletteService, useValue: palette },
        { provide: AiService, useValue: ai },
        { provide: VaultModalState, useValue: vaultModal },
        { provide: IssueLocationService, useValue: issueLocation },
        { provide: SelectedProjectStore, useValue: selected },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPalette);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    _windowOpenSpy?.mockRestore();
    _windowOpenSpy = undefined;
  });

  function stubWindowOpen(): void {
    _windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue(null) as unknown as ReturnType<
      typeof vi.fn
    >;
  }

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  async function flushQuery(text: string): Promise<void> {
    palette.isOpen.set(true);
    fixture.detectChanges();
    component.query.set(text);
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 500));
    fixture.detectChanges();
  }

  it('opening the palette calls AiService.query when the user types', async () => {
    await flushQuery('hola');
    expect(ai.query).toHaveBeenCalledWith('hola');
  });

  it('ArrowDown / ArrowUp move the highlight within result bounds', async () => {
    await flushQuery('test');
    expect(component.result().length).toBe(3);
    expect(component.selectedIdx()).toBe(0);
    component.onArrowDown({ preventDefault: () => {} } as KeyboardEvent);
    expect(component.selectedIdx()).toBe(1);
    component.onArrowDown({ preventDefault: () => {} } as KeyboardEvent);
    expect(component.selectedIdx()).toBe(2);
    component.onArrowDown({ preventDefault: () => {} } as KeyboardEvent);
    expect(component.selectedIdx()).toBe(2);
    component.onArrowUp({ preventDefault: () => {} } as KeyboardEvent);
    expect(component.selectedIdx()).toBe(1);
  });

  it('Enter on an issue match opens the issue route in a new tab', async () => {
    stubWindowOpen();
    await flushQuery('test');
    expect(component.result().length).toBe(3);
    component.selectedIdx.set(0);
    await component.onEnter({ preventDefault: () => {} } as KeyboardEvent);
    expect(issueLocation.findProjectIdByIssue).toHaveBeenCalledWith('iA');
    expect(window.open).toHaveBeenCalledWith(
      '/proyect/proj42/issues/iA',
      '_blank',
      'noopener,noreferrer',
    );
    expect(palette.isOpen()).toBe(false);
  });

  it('Enter on a password match does not navigate', async () => {
    stubWindowOpen();
    await flushQuery('test');
    expect(component.result().length).toBe(3);
    component.selectedIdx.set(2);
    await component.onEnter({ preventDefault: () => {} } as KeyboardEvent);
    expect(issueLocation.findProjectIdByIssue).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    expect(palette.isOpen()).toBe(true);
  });

  it('Enter on an issue match without a projectId resolves to no navigation', async () => {
    stubWindowOpen();
    issueLocation.findProjectIdByIssue.mockResolvedValue(null);
    await flushQuery('test');
    expect(component.result().length).toBe(3);
    component.selectedIdx.set(0);
    await component.onEnter({ preventDefault: () => {} } as KeyboardEvent);
    expect(window.open).not.toHaveBeenCalled();
    expect(palette.isOpen()).toBe(true);
  });

  it('Enter on a project match selects the project and closes the palette', async () => {
    stubWindowOpen();
    await flushQuery('test');
    expect(component.result().length).toBe(3);
    component.selectedIdx.set(1);
    await component.onEnter({ preventDefault: () => {} } as KeyboardEvent);
    expect(selected.set).toHaveBeenCalledWith('pB');
    expect(window.open).not.toHaveBeenCalled();
    expect(palette.isOpen()).toBe(false);
  });

  it('Click on a project match selects the project and closes the palette', async () => {
    stubWindowOpen();
    await flushQuery('test');
    const projectMatch = component.result()[1];
    component.onResultClick(projectMatch);
    await Promise.resolve();
    expect(selected.set).toHaveBeenCalledWith('pB');
    expect(window.open).not.toHaveBeenCalled();
    expect(palette.isOpen()).toBe(false);
  });

  it('Click on an issue match opens the issue route in a new tab', async () => {
    stubWindowOpen();
    await flushQuery('test');
    const issueMatch = component.result()[0];
    component.onResultClick(issueMatch);
    await Promise.resolve();
    expect(issueLocation.findProjectIdByIssue).toHaveBeenCalledWith('iA');
    expect(window.open).toHaveBeenCalledWith(
      '/proyect/proj42/issues/iA',
      '_blank',
      'noopener,noreferrer',
    );
    expect(palette.isOpen()).toBe(false);
  });

  it('Click on a password match does not navigate', async () => {
    stubWindowOpen();
    await flushQuery('test');
    const passwordMatch = component.result()[2];
    component.onResultClick(passwordMatch);
    await Promise.resolve();
    expect(selected.set).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    expect(palette.isOpen()).toBe(true);
  });
});
