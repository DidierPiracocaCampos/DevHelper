import { Component, effect, inject, signal } from '@angular/core';
import { UiCardButton } from '../../../shared/components/card-button/card-button';
import { NasaPicture } from '../../components/nasa-picture/nasa-picture';
import { Authenticator } from '../../../shared/service/authenticator';
import { PasswordList } from '../../components/password-list/password-list';
import { FileList } from '../../components/file-list/file-list';
import { Loader } from '../../../shared/service/loader';
import { ModalUnlockVault, VaultSecurity } from '../../../shared/security';
import { PreferencesService, UiConfigModal } from '../../../shared/preferences';
import { VAULT_STATUS } from '../../../shared/security/models/vault.model';
import { ScopeContext } from '../../../shared/scope/scope-context';
import HomeCalendar from '../../components/calendar/home-calendar';
import { ProjectList } from '../../components/project-list/project-list';
import { IssueList } from '../../components/issue-list/issue-list';
import { AiAssistant } from '../../components/ai-assistant/ai-assistant';
import { AiService } from '../../ai/ai.service';
import { WelcomeAiModal } from '../../../shared/components/welcome-ai-modal/welcome-ai-modal';

@Component({
  selector: 'app-home',
  imports: [
    UiCardButton,
    NasaPicture,
    PasswordList,
    FileList,
    ModalUnlockVault,
    UiConfigModal,
    HomeCalendar,
    ProjectList,
    IssueList,
    AiAssistant,
    WelcomeAiModal,
  ],
  templateUrl: './home.html',
})
export default class Home {
  private _authenticator = inject(Authenticator);
  private _loader = inject(Loader);
  private _vault = inject(VaultSecurity);
  private _scope = inject(ScopeContext);
  private _prefs = inject(PreferencesService);
  private _ai = inject(AiService);

  protected readonly isConfigOpen = signal(false);
  protected readonly _initialSection = signal('vault');
  protected readonly isWelcomeAiOpen = signal(false);
  private _aiEnabledTriggered = false;

  constructor() {
    effect(() => {
      const user = this._authenticator.user();
      const prefsReady = this._prefs.preferences.hasValue();
      if (!user || !prefsReady) return;

      const enabledFlag = this._prefs.preferences.value()?.aiAssistantEnabled;
      const status = this._ai.status();

      if (enabledFlag === undefined) {
        if (!this._aiEnabledTriggered) {
          this._aiEnabledTriggered = true;
          this.isWelcomeAiOpen.set(true);
        }
        return;
      }

      if (enabledFlag === true && status === 'disabled' && !this._aiEnabledTriggered) {
        this._aiEnabledTriggered = true;
        this._ai.enable().catch((err) => {
          console.error('[Home] auto-enable AI failed', err);
          this._aiEnabledTriggered = false;
        });
      }
    });

    effect(() => {
      if (this._vault.vaultStatus() === VAULT_STATUS.NO_CREATE && !this.isConfigOpen()) {
        this._initialSection.set('vault');
        this.isConfigOpen.set(true);
      }
    });
  }

  async ngOnInit() {
    this._scope.setGlobal();
    this._loader.hide();
  }

  logout() {
    this._authenticator.logout();
  }

  openVault() {
    this.openConfig('vault');
  }

  openConfig(section?: string) {
    if (section) {
      this._initialSection.set(section);
    }
    this.isConfigOpen.set(true);
  }

  closeWelcomeAi(): void {
    this.isWelcomeAiOpen.set(false);
  }

  async acceptWelcomeAi(): Promise<void> {
    try {
      await this._prefs.setAiAssistantEnabled(true);
      await this._ai.enable().catch((err) => {
        console.error('[Home] AI enable after welcome failed', err);
      });
    } catch (err) {
      console.error('[Home] could not persist AI preference from welcome modal', err);
    } finally {
      this.isWelcomeAiOpen.set(false);
    }
  }
}
