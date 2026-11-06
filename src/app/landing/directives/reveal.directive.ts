import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

@Directive({ selector: '[landingReveal]' })
export class Reveal {
  readonly delay = input(0, { alias: 'revealDelay' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;

      const el = this.el;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-revealed');
        return;
      }

      el.classList.add('reveal-pending');
      el.style.setProperty('--reveal-delay', `${this.delay()}ms`);

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          el.classList.remove('reveal-pending');
          el.classList.add('is-revealed');
          observer.unobserve(el);
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
