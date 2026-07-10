import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VaultSecurity } from '../../../security/vault-security';
import { VAULT_STATUS } from '../../../security/models/vault.model';
import { VaultCreatePanel } from '../vault-create-panel/vault-create-panel';
import { VaultUnlockPanel } from '../vault-unlock-panel/vault-unlock-panel';
import { VaultManagePanel } from '../vault-manage-panel/vault-manage-panel';

@Component({
  selector: 'vault-section',
  imports: [VaultCreatePanel, VaultUnlockPanel, VaultManagePanel],
  templateUrl: './vault-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultSection {
  protected readonly VAULT_STATUS = VAULT_STATUS;
  private _vault = inject(VaultSecurity);
  protected readonly status = computed(() => this._vault.vaultStatus());
}
