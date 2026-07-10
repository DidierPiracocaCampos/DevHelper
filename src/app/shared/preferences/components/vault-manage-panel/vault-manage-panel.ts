import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vault-manage-panel',
  imports: [],
  template: '<div data-testid="manage-panel-placeholder">manage</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultManagePanel {}
