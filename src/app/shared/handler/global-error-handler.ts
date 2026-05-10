import { ErrorHandler, inject } from '@angular/core';
import { ToastService } from '../service/toast';

export class GlobalErrorHandler extends ErrorHandler {
  private toastService = inject(ToastService);

  private readonly IGNORED_ERRORS = [
    'Unrecognized feature',
    'Squirrelly',
  ];

  private shouldIgnore(message: string): boolean {
    return this.IGNORED_ERRORS.some(ignored =>
      message.includes(ignored)
    );
  }

  override handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);

    if (this.shouldIgnore(message)) {
      return;
    }

    console.error('Global error:', error);

    const details = error instanceof Error
      ? error.stack || error.message
      : String(error);

    this.toastService.error(
      'Ha ocurrido un error inesperado',
      details
    );
  }
}
