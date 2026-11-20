import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, variant: ToastVariant = 'info', title?: string, durationMs = 4200): void {
    const id = ++this.counter;
    this._toasts.update(list => [...list, { id, variant, title, message }]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  success(message: string, title = 'Listo'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title = 'Error'): void {
    this.show(message, 'error', title, 5500);
  }

  warning(message: string, title = 'Atención'): void {
    this.show(message, 'warning', title, 4800);
  }

  info(message: string, title = 'Información'): void {
    this.show(message, 'info', title);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
