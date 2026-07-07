import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UiModal } from '../ui-modal/ui-modal';
import { UiButton } from '../ui-button/button';

@Component({
  selector: 'app-welcome-ai-modal',
  standalone: true,
  imports: [UiModal, UiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './welcome-ai-modal.html',
  styleUrl: './welcome-ai-modal.css',
})
export class WelcomeAiModal {
  readonly isOpen = input<boolean>(false);
  readonly accept = output<void>();
  readonly dismiss = output<void>();

  onOpenChange(open: boolean): void {
    if (!open) {
      this.dismiss.emit();
    }
  }

  acceptAction(): void {
    this.accept.emit();
  }

  dismissAction(): void {
    this.dismiss.emit();
  }
}
