import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vault-unlock-panel',
  imports: [],
  template: '<div data-testid="unlock-panel-placeholder">unlock</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultUnlockPanel {}
