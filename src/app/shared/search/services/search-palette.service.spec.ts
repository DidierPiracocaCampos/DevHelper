import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SearchPaletteService } from './search-palette.service';
import { Authenticator } from '../../service/authenticator';

function dispatchK(combo: { ctrl?: boolean; meta?: boolean; key?: string }): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: combo.key ?? 'k',
      ctrlKey: !!combo.ctrl,
      metaKey: !!combo.meta,
      bubbles: true,
      cancelable: true,
    }),
  );
}

describe('SearchPaletteService', () => {
  let authed: ReturnType<typeof signal<{ uid: string } | null>>;

  beforeEach(() => {
    authed = signal<{ uid: string } | null>({ uid: 'u1' });
    TestBed.configureTestingModule({
      providers: [
        SearchPaletteService,
        {
          provide: Authenticator,
          useValue: { user: authed.asReadonly(), isLoggedIn: signal(true) },
        },
      ],
    });
  });

  it('starts closed', () => {
    const svc = TestBed.inject(SearchPaletteService);
    expect(svc.isOpen()).toBe(false);
  });

  it('open/close/toggle change isOpen', () => {
    const svc = TestBed.inject(SearchPaletteService);
    svc.open();
    expect(svc.isOpen()).toBe(true);
    svc.close();
    expect(svc.isOpen()).toBe(false);
    svc.toggle();
    expect(svc.isOpen()).toBe(true);
    svc.toggle();
    expect(svc.isOpen()).toBe(false);
  });

  it('Ctrl+K toggles when authenticated', () => {
    const svc = TestBed.inject(SearchPaletteService);
    dispatchK({ ctrl: true });
    expect(svc.isOpen()).toBe(true);
    dispatchK({ ctrl: true });
    expect(svc.isOpen()).toBe(false);
  });

  it('Cmd+K (meta) toggles when authenticated', () => {
    const svc = TestBed.inject(SearchPaletteService);
    dispatchK({ meta: true });
    expect(svc.isOpen()).toBe(true);
  });

  it('does not open when unauthenticated', () => {
    authed.set(null);
    const svc = TestBed.inject(SearchPaletteService);
    dispatchK({ ctrl: true });
    expect(svc.isOpen()).toBe(false);
  });

  it('ignores Shift+Ctrl+K', () => {
    const svc = TestBed.inject(SearchPaletteService);
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(svc.isOpen()).toBe(false);
  });

  it('ignores other keys', () => {
    const svc = TestBed.inject(SearchPaletteService);
    dispatchK({ ctrl: true, key: 'a' });
    expect(svc.isOpen()).toBe(false);
  });

  it('calls preventDefault on Ctrl+K', () => {
    TestBed.inject(SearchPaletteService);
    const ev = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const spy = vi.spyOn(ev, 'preventDefault');
    document.dispatchEvent(ev);
    expect(spy).toHaveBeenCalled();
  });
});
