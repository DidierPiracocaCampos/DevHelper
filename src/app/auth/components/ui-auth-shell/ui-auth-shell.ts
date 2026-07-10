import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-auth-shell',
  template: `
    <div
      class="min-h-screen w-full flex flex-col items-center justify-center
                px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12
                gap-6 sm:gap-8 md:gap-10"
    >
      <div class="w-full max-w-[20rem] sm:max-w-sm flex flex-col items-center">
        <ng-content />
      </div>
      <div class="w-full max-w-[20rem] sm:max-w-sm flex flex-col items-center gap-3">
        <ng-content select="[authFooter]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class UiAuthShell {}
