import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AiAssistant } from './ai-assistant';
import { SearchPaletteService } from '../../../shared/search/services/search-palette.service';

describe('AiAssistant (trigger-only card)', () => {
  let fixture: ComponentFixture<AiAssistant>;
  let component: AiAssistant;
  let openMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    openMock = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AiAssistant],
      providers: [{ provide: SearchPaletteService, useValue: { open: openMock } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistant);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('open() calls SearchPaletteService.open()', () => {
    component.open();
    expect(openMock).toHaveBeenCalledOnce();
  });

  it('clicking the card opens the palette', () => {
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
    expect(card).toBeTruthy();
    card.click();
    expect(openMock).toHaveBeenCalledOnce();
  });

  it('Enter on the card opens the palette', () => {
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('[role="button"]') as HTMLElement;
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(openMock).toHaveBeenCalledOnce();
  });

  it('renders a kbd badge with the shortcut hint', () => {
    fixture.detectChanges();
    const kbd = fixture.nativeElement.querySelector('kbd') as HTMLElement;
    expect(kbd).toBeTruthy();
    expect(kbd.textContent ?? '').toMatch(/(\u2318K|Ctrl\+K)/);
  });
});
