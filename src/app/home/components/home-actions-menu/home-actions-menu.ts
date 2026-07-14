import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  effect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'home-actions-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block">
      <button
        #trigger
        type="button"
        class="btn btn-ghost btn-square btn-md min-h-11 min-w-11"
        aria-label="Menú de acciones"
        [attr.aria-expanded]="isOpen()"
        (click)="toggle()"
      >
        <span class="icon">menu</span>
      </button>
      @if (isOpen()) {
        <ul
          #menu
          tabindex="-1"
          class="menu menu-lg bg-base-200 rounded-box shadow w-56"
          [style.position]="'fixed'"
          [style.top.px]="position().top"
          [style.left.px]="position().left"
          [style.zIndex]="60"
        >
          <li (click)="close(); config.emit()">
            <button type="button" class="w-full text-left flex items-center gap-2">
              <span class="icon">settings</span>
              Configuración
            </button>
          </li>
          <li (click)="close(); logout.emit()">
            <button type="button" class="w-full text-left flex items-center gap-2">
              <span class="icon">logout</span>
              Cerrar sesión
            </button>
          </li>
        </ul>
      }
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class HomeActionsMenu implements AfterViewInit {
  private readonly _trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly _menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly _destroyRef = inject(DestroyRef);

  readonly isOpen = signal(false);
  readonly position = signal({ top: 0, left: 0 });

  readonly config = output<void>();
  readonly logout = output<void>();

  constructor() {
    effect(() => {
      if (this.isOpen()) this._updatePosition();
    });
  }

  ngAfterViewInit(): void {
    const update = (): void => {
      if (this.isOpen()) this._updatePosition();
    };
    window.addEventListener('resize', update);
    this._destroyRef.onDestroy(() => window.removeEventListener('resize', update));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node;
    const triggerEl = this._trigger().nativeElement;
    const menuEl = this._menu()?.nativeElement;
    if (!triggerEl.contains(target) && !(menuEl && menuEl.contains(target))) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  private _updatePosition(): void {
    const rect = this._trigger().nativeElement.getBoundingClientRect();
    this.position.set({ top: rect.bottom + 4, left: rect.left });
  }
}
