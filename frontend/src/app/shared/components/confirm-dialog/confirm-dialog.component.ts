import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-panel" role="dialog" aria-modal="true">
          <div class="modal-panel__header">
            <div class="confirm-title">
              <span class="confirm-icon" [class.confirm-icon--danger]="danger">
                <app-icon [name]="danger ? 'alert-triangle' : 'info'" [size]="20" />
              </span>
              <h3>{{ title }}</h3>
            </div>
            <button type="button" class="btn btn--ghost btn--icon" (click)="cancel.emit()" aria-label="Cerrar">
              <app-icon name="x" [size]="18" />
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-msg">{{ message }}</p>
          </div>
          <div class="modal-panel__footer">
            <button type="button" class="btn btn--secondary" [disabled]="loading" (click)="cancel.emit()">
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn--danger]="danger"
              [class.btn--primary]="!danger"
              [disabled]="loading"
              (click)="confirm.emit()"
            >
              {{ loading ? 'Procesando...' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .confirm-title { display: flex; align-items: center; gap: var(--space-3); }
    .confirm-icon {
      width: 38px; height: 38px; border-radius: 50%;
      background: var(--color-cream); color: var(--color-espresso);
      display: inline-flex; align-items: center; justify-content: center;
      &--danger { background: var(--color-danger-bg); color: var(--color-danger); }
    }
    .confirm-msg { color: var(--color-text-secondary); font-size: var(--text-sm); line-height: 1.65; }
  `
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Deseas continuar con esta operación?';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() danger = false;
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.cancel.emit();
    }
  }
}
