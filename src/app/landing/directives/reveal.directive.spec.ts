import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './reveal.directive';

@Component({
  imports: [Reveal],
  template: `
    <div landingReveal [revealDelay]="120" id="target"></div>
  `,
})
class Host {}

class FakeObserver {
  static instances: FakeObserver[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(
    public cb: (entries: { isIntersecting: boolean; target: Element }[]) => void,
    public options?: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this);
  }
}

function mount() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  TestBed.tick();
  const el = fixture.nativeElement.querySelector('#target') as HTMLElement;
  return { fixture, el };
}

function stubRect(top: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
  } as DOMRect);
}

describe('Reveal', () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does nothing without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { el } = mount();
    expect(el.className).toBe('');
  });

  it('does nothing with prefers-reduced-motion', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: true, media: q }));
    const { el } = mount();
    expect(el.className).toBe('');
    expect(FakeObserver.instances.length).toBe(0);
  });

  it('reveals directly when already in viewport', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    stubRect(10);
    const { el } = mount();
    expect(el.classList.contains('is-revealed')).toBe(true);
    expect(el.classList.contains('reveal-pending')).toBe(false);
  });

  it('marks pending off-screen and reveals on intersect', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    stubRect(window.innerHeight + 500);
    const { el } = mount();
    expect(el.classList.contains('reveal-pending')).toBe(true);
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('120ms');
    const io = FakeObserver.instances[0];
    expect(io.options).toEqual({ threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    io.cb([{ isIntersecting: true, target: el }]);
    expect(el.classList.contains('reveal-pending')).toBe(false);
    expect(el.classList.contains('is-revealed')).toBe(true);
    expect(io.unobserve).toHaveBeenCalledWith(el);
  });

  it('disconnects on destroy', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    stubRect(window.innerHeight + 500);
    const { fixture } = mount();
    fixture.destroy();
    expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled();
  });
});
