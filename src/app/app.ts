import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastComponent } from './shared/components/toast/ui-toast';
import { ConfirmModal } from './shared/components/confirm-modal/confirm-modal';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiToastComponent, ConfirmModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('devhelper-web');
}
