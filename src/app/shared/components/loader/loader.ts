import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Loader } from '../../service/loader';

@Component({
  selector: 'app-loader',
  imports: [],
  template: `
    @if (loader.isVisible()) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <span class="loading loading-infinity w-30 text-primary"></span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  protected readonly loader = inject(Loader);
}
