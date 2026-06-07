import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastComponent } from './shared/components/toast/ui-toast';
import { ConfirmModal } from './shared/components/confirm-modal/confirm-modal';
import { LoaderComponent } from './shared/components/loader/loader';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiToastComponent, ConfirmModal, LoaderComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'devhelper-web';
}
