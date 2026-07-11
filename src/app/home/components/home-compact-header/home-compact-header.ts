import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { HomeActionsMenu } from '../home-actions-menu/home-actions-menu';
import { AiAssistant } from '../ai-assistant/ai-assistant';

@Component({
  selector: 'home-compact-header',
  imports: [HomeActionsMenu, AiAssistant],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex items-center gap-2 p-2 bg-base-100 border-b border-base-300 shrink-0">
      <home-actions-menu (vault)="vault.emit()" (config)="config.emit()" (logout)="logout.emit()" />
      <ai-assistant class="flex-1" />
    </header>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class HomeCompactHeader {
  readonly vault = output<void>();
  readonly config = output<void>();
  readonly logout = output<void>();
}
