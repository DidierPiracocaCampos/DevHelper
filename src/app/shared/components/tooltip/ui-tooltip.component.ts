import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  inject,
  input,
  OnDestroy,
} from '@angular/core';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipSeverity =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

@Component({
  selector: 'ui-tooltip',
  template: '<ng-content />',
})
export class UiTooltipComponent implements OnDestroy {
  text = input.required<string>({ alias: 'text' });
  placement = input<TooltipPlacement>('top');
  severity = input<TooltipSeverity>('neutral');

  private _renderer = inject(Renderer2);
  private _hostElement = inject(ElementRef);
  private _tooltipEl: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.hideTooltip();
  }

  private showTooltip() {
    this._tooltipEl = this._renderer.createElement('div');
    this._renderer.setAttribute(
      this._tooltipEl,
      'class',
      `tooltip tooltip-${this.placement()} tooltip-${this.severity()} tooltip-open`,
    );
    this._renderer.setAttribute(this._tooltipEl, 'data-tip', this.text());

    const rect = this._hostElement.nativeElement.getBoundingClientRect();
    this._positionTooltip(rect);

    this._renderer.appendChild(document.body, this._tooltipEl);
  }

  private _positionTooltip(rect: DOMRect) {
    if (!this._tooltipEl) return;

    const placement = this.placement();
    let top = 0,
      left = 0;

    switch (placement) {
      case 'top':
        top = rect.top;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right;
        break;
    }

    this._renderer.setStyle(this._tooltipEl, 'position', 'fixed');
    this._renderer.setStyle(this._tooltipEl, 'top', `${top}px`);
    this._renderer.setStyle(this._tooltipEl, 'left', `${left}px`);
    this._renderer.setStyle(this._tooltipEl, 'transform', 'translate(-50%, -50%)');
    this._renderer.setStyle(this._tooltipEl, 'z-index', '9999');
  }

  private hideTooltip() {
    if (this._tooltipEl) {
      this._renderer.removeChild(document.body, this._tooltipEl);
      this._tooltipEl = null;
    }
  }

  ngOnDestroy() {
    this.hideTooltip();
  }
}
