import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="error-state" role="alert">
      <div class="error-state__icon">
        <app-icon name="alert-circle" [size]="28" />
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (showRetry) {
        <button type="button" class="btn btn--outline" (click)="retry.emit()">
          <app-icon name="refresh" [size]="16" />
          Reintentar
        </button>
      }
    </div>
  `,
  styles: `
    .error-state {
      text-align: center;
      padding: var(--space-10) var(--space-6);
      background-color: var(--color-danger-bg);
      border: 1px solid rgba(155, 59, 46, 0.25);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      &__icon {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background-color: var(--color-warm-white);
        color: var(--color-danger);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h3 { font-size: var(--text-2xl); color: var(--color-danger); }
      p { color: var(--color-text-primary); max-width: 480px; font-size: var(--text-sm); }
    }
  `
})
export class ErrorStateComponent {
  @Input() title = 'No pudimos cargar la información';
  @Input() message = 'Verifica tu conexión con el servidor de Café de Barrio e intenta nuevamente.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
