import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap" [class.spinner-wrap--inline]="inline" role="status" aria-live="polite">
      <span class="spinner" [style.width.px]="size" [style.height.px]="size"></span>
      @if (label) {
        <span class="spinner-label">{{ label }}</span>
      }
    </div>
  `,
  styles: `
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-4);
      &--inline {
        flex-direction: row;
        padding: 0;
        gap: var(--space-2);
      }
    }
    .spinner {
      border: 2.5px solid var(--color-beige);
      border-top-color: var(--color-espresso);
      border-radius: 50%;
      animation: spin 750ms linear infinite;
      display: inline-block;
    }
    .spinner-label {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
  `
})
export class LoadingSpinnerComponent {
  @Input() size = 28;
  @Input() label = '';
  @Input() inline = false;
}
