import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/components/card-base/card-base';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { NasaPicture } from '../../components/nasa-picture/nasa-picture';
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from '../../components/password-list/password-list';
import { FileList } from '../../components/file-list/file-list';
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault, ModalUnlockVault, VaultSecurity } from '../../../shared/security';
import { NasaImageSection, UiConfigModal } from '../../../shared/preferences';
import { ScopeContext } from '../../../shared/scope/scope-context';
import { EventRepository } from '../../service/events.repository';

@Component({
  selector: 'app-home',
  imports: [
    UiCard,
    UiCardButton,
    NasaPicture,
    PasswordList,
    FileList,
    ModalCreateVault,
    ModalUnlockVault,
    UiConfigModal,
    NasaImageSection,
    RouterLink,
  ],
  templateUrl: './home.html',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);
  private _scope = inject(ScopeContext);
  private _eventsRepo = inject(EventRepository);

  protected readonly isConfigOpen = signal(false);

  protected readonly today = signal(new Date());
  protected readonly todayEventsResource = this._eventsRepo.eventsOfDay$(this.today);
  protected readonly todayEventsCount = computed(
    () => this.todayEventsResource.value()?.length ?? 0,
  );

  async ngOnInit() {
    this._scope.setGlobal();
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

  openVault() {
    this._vault.openUnlockVaultModal();
  }

  openConfig() {
    this.isConfigOpen.set(true);
  }
}
