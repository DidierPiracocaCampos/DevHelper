import { Component, inject } from '@angular/core';
import { ToastService, ToastI } from '../../service/toast';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [],
  templateUrl: './ui-toast.html',
  styleUrl: './ui-toast.css',
})
export class UiToastComponent {
  protected toastService = inject(ToastService);

  protected getIcon(severity: ToastI['severity']): string {
    const icons: Record<ToastI['severity'], string> = {
      error: 'error',
      success: 'check_circle',
      warning: 'warning',
      info: 'info',
    };
    return icons[severity];
  }

  protected onToastClick(toast: ToastI): void {
    this.toastService.toggleExpanded(toast.id);
  }

  protected onDismiss(event: Event, id: string): void {
    event.stopPropagation();
    this.toastService.dismiss(id);
  }
}
