import { Component, inject, signal } from '@angular/core';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { NasaPicture } from '../../components/nasa-picture/nasa-picture';
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from '../../components/password-list/password-list';
import { FileList } from '../../components/file-list/file-list';
import { Loader } from '../../../shared/service/loader';
import { ModalCreateVault, ModalUnlockVault, VaultSecurity } from '../../../shared/security';
import { NasaImageSection, UiConfigModal } from '../../../shared/preferences';
import { ScopeContext } from '../../../shared/scope/scope-context';
import HomeCalendar from '../../components/calendar/home-calendar';
import { ProjectList } from '../../components/project-list/project-list';
import { IssueList } from '../../components/issue-list/issue-list';
import { AiAssistant } from '../../components/ai-assistant/ai-assistant';

@Component({
  selector: 'app-home',
  imports: [
    UiCardButton,
    NasaPicture,
    PasswordList,
    FileList,
    ModalCreateVault,
    ModalUnlockVault,
    UiConfigModal,
    NasaImageSection,
    HomeCalendar,
    ProjectList,
    IssueList,
    AiAssistant,
  ],
  templateUrl: './home.html',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);
  private _scope = inject(ScopeContext);

  protected readonly isConfigOpen = signal(false);

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
