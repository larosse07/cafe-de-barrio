import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiErrorResponse } from '../models';

export interface FriendlyHttpError {
  status: number;
  message: string;
  validationErrors?: Record<string, string>;
  raw: HttpErrorResponse;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => ({
          status: 0,
          message: 'La solicitud tardó demasiado tiempo en responder. Verifica tu conexión e inténtalo de nuevo.',
          raw: error
        }));
      }

      const apiError = error.error as Partial<ApiErrorResponse> | null;
      let message = apiError?.message;

      if (!message) {
        switch (error.status) {
          case 0:
            message = 'No se pudo conectar con el servidor de Café de Barrio. Verifica que el backend esté en ejecución.';
            break;
          case 400:
            message = 'Los datos enviados no son válidos. Revisa los campos del formulario.';
            break;
          case 401:
            message = 'Tu sesión ha expirado o no tienes autorización. Inicia sesión nuevamente.';
            break;
          case 403:
            message = 'No tienes permisos suficientes para realizar esta operación.';
            break;
          case 404:
            message = 'El recurso solicitado no fue encontrado.';
            break;
          case 409:
            message = 'Conflicto de operación: verifica stock disponible o registros relacionados.';
            break;
          default:
            message = 'Ocurrió un error inesperado en el servidor. Intenta nuevamente más tarde.';
        }
      }

      const friendly: FriendlyHttpError = {
        status: error.status,
        message,
        validationErrors: apiError?.validationErrors,
        raw: error
      };

      return throwError(() => friendly);
    })
  );
};
