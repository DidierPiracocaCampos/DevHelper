import { Injectable, signal } from '@angular/core';

export type ConfirmSeverity = 'info' | 'warning' | 'error';

export interface ConfirmConfig {
  title: string;
  message: string;
  severity: ConfirmSeverity;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private readonly _isOpen = signal(false);
  private readonly _config = signal<ConfirmConfig | null>(null);
  private readonly _resolveRef = signal<((result: boolean) => void) | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly config = this._config.asReadonly();

  show(config: ConfirmConfig): Promise<boolean> {
    this._config.set(config);
    this._isOpen.set(true);
    return new Promise(resolve => this._resolveRef.set(resolve));
  }

  confirm(message: string, title = 'Confirmar'): Promise<boolean> {
    return this.show({
      title,
      message,
      severity: 'info',
      confirmLabel: 'Confirmar',
      showCancel: true,
    });
  }

  delete(message: string): Promise<boolean> {
    return this.show({
      title: 'Eliminar',
      message,
      severity: 'error',
      icon: 'delete',
      confirmLabel: 'Eliminar',
      showCancel: true,
    });
  }

  warning(message: string, title = 'Advertencia'): Promise<boolean> {
    return this.show({
      title,
      message,
      severity: 'warning',
      confirmLabel: 'Continuar',
      showCancel: true,
    });
  }

  info(message: string, title = 'Información'): Promise<boolean> {
    return this.show({
      title,
      message,
      severity: 'info',
      confirmLabel: 'Aceptar',
      showCancel: false,
    });
  }

  resolve(result: boolean): void {
    const resolve = this._resolveRef();
    if (resolve) {
      this._isOpen.set(false);
      this._config.set(null);
      this._resolveRef.set(null);
      resolve(result);
    }
  }
}