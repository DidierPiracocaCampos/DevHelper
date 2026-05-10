import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../service/toast';

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Solicitud inválida',
  401: 'No autorizado',
  403: 'Acceso denegado',
  404: 'Recurso no encontrado',
  409: 'Conflicto de datos',
  422: 'Datos inválidos',
  429: 'Demasiadas solicitudes',
  500: 'Error interno del servidor',
  502: 'Error del servidor',
  503: 'Servicio no disponible',
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      let message = HTTP_ERROR_MESSAGES[status];

      if (!message) {
        message = status >= 500
          ? 'Error del servidor'
          : 'Error en la solicitud';
      }

      let details: string | undefined;

      if (error.error instanceof ErrorEvent) {
        details = error.error.message;
      } else if (typeof error.error === 'string' && error.error) {
        details = error.error;
      } else if (error.error?.message) {
        details = error.error.message;
      }

      if (status === 0) {
        message = 'Sin conexión al servidor';
        details = 'Verifica tu conexión a internet';
      }

      toastService.error(message, details);

      return throwError(() => error);
    })
  );
};
