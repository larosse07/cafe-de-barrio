import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <app-icon [name]="icon" [size]="28" />
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      @if (actionLabel) {
        <button type="button" class="btn btn--primary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: `
    .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-6);
      background-color: var(--color-cream);
      border: 1px dashed var(--color-border-strong);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      &__icon {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background-color: var(--color-warm-white);
        color: var(--color-coffee);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-xs);
        margin-bottom: var(--space-1);
      }
      h3 { font-size: var(--text-2xl); }
      p { color: var(--color-text-secondary); max-width: 440px; font-size: var(--text-sm); }
    }
  `
})
export class EmptyStateComponent {
  @Input() icon: IconName = 'coffee';
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
