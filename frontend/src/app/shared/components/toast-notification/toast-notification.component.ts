import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { AppIconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast--' + toast.variant">
          <app-icon [name]="iconFor(toast.variant)" [size]="18" />
          <div class="toast__content">
            @if (toast.title) {
              <strong class="toast__title">{{ toast.title }}</strong>
            }
            <span class="toast__msg">{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="toast__close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar notificación"
          >
            <app-icon name="x" [size]="15" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      bottom: var(--space-5);
      right: var(--space-5);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: min(390px, calc(100vw - 2rem));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-warm-white);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-md);
      animation: scaleIn 200ms ease-out;
      &--success { border-left: 4px solid var(--color-success); color: var(--color-success); }
      &--error { border-left: 4px solid var(--color-danger); color: var(--color-danger); }
      &--warning { border-left: 4px solid var(--color-warning); color: var(--color-warning); }
      &--info { border-left: 4px solid var(--color-coffee); color: var(--color-coffee); }
      &__content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      &__title { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-espresso); }
      &__msg { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.4; }
      &__close {
        background: transparent; border: none; color: var(--color-text-muted);
        padding: 2px; border-radius: var(--radius-xs);
        &:hover { color: var(--color-espresso); background: var(--color-cream); }
      }
    }
  `
})
export class ToastNotificationComponent {
  readonly toastService = inject(ToastService);

  iconFor(variant: string): IconName {
    switch (variant) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  }
}
