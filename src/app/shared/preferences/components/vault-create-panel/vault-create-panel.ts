import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vault-create-panel',
  imports: [],
  template: '<div data-testid="create-panel-placeholder">create</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultCreatePanel {}
