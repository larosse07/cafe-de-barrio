import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    @if (variant === 'product-grid') {
      <div class="skeleton-grid">
        @for (item of placeholders; track item) {
          <div class="skeleton-card">
            <div class="skeleton-shimmer skeleton-card__img"></div>
            <div class="skeleton-card__body">
              <div class="skeleton-shimmer skeleton-line skeleton-line--short"></div>
              <div class="skeleton-shimmer skeleton-line skeleton-line--title"></div>
              <div class="skeleton-shimmer skeleton-line"></div>
              <div class="skeleton-card__footer">
                <div class="skeleton-shimmer skeleton-line skeleton-line--price"></div>
                <div class="skeleton-shimmer skeleton-btn"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (variant === 'table') {
      <div class="skeleton-table">
        @for (item of placeholders; track item) {
          <div class="skeleton-shimmer skeleton-row"></div>
        }
      </div>
    } @else {
      <div class="skeleton-stack">
        @for (item of placeholders; track item) {
          <div class="skeleton-shimmer skeleton-block" [style.height.px]="height"></div>
        }
      </div>
    }
  `,
  styles: `
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-6);
    }
    .skeleton-card {
      background: var(--color-warm-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      &__img { height: 220px; width: 100%; }
      &__body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
      &__footer { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-2); }
    }
    .skeleton-line {
      height: 12px; border-radius: var(--radius-xs); width: 100%;
      &--short { width: 38%; height: 10px; }
      &--title { width: 78%; height: 18px; }
      &--price { width: 32%; height: 20px; }
    }
    .skeleton-btn { width: 96px; height: 34px; border-radius: var(--radius-sm); }
    .skeleton-table, .skeleton-stack { display: flex; flex-direction: column; gap: var(--space-3); }
    .skeleton-row { height: 52px; border-radius: var(--radius-sm); }
    .skeleton-block { width: 100%; border-radius: var(--radius-md); }
  `
})
export class SkeletonLoaderComponent {
  @Input() variant: 'product-grid' | 'table' | 'block' = 'product-grid';
  @Input() count = 4;
  @Input() height = 110;

  get placeholders(): number[] {
    return Array.from({ length: this.count }, (_, idx) => idx);
  }
}
