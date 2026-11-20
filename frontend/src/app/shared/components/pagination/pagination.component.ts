import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    @if (totalPages > 1) {
      <nav class="pagination" aria-label="Paginación">
        <button
          type="button"
          class="pagination__btn"
          [disabled]="page <= 0"
          (click)="goTo(page - 1)"
          aria-label="Página anterior"
        >
          <app-icon name="chevron-left" [size]="16" />
          <span>Anterior</span>
        </button>

        <div class="pagination__pages">
          @for (p of pages; track p) {
            <button
              type="button"
              class="pagination__num"
              [class.is-active]="p === page"
              (click)="goTo(p)"
              [attr.aria-current]="p === page ? 'page' : null"
            >
              {{ p + 1 }}
            </button>
          }
        </div>

        <button
          type="button"
          class="pagination__btn"
          [disabled]="page >= totalPages - 1"
          (click)="goTo(page + 1)"
          aria-label="Página siguiente"
        >
          <span>Siguiente</span>
          <app-icon name="chevron-right" [size]="16" />
        </button>
      </nav>
    }
  `,
  styles: `
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
      flex-wrap: wrap;
      &__pages { display: flex; align-items: center; gap: var(--space-1); }
      &__btn, &__num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-1);
        min-height: 38px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-strong);
        background: var(--color-warm-white);
        color: var(--color-espresso);
        font-size: var(--text-sm);
        font-weight: 500;
        transition: all var(--transition-fast);
        &:hover:not(:disabled) { background: var(--color-cream); border-color: var(--color-coffee); }
        &:disabled { opacity: 0.45; cursor: not-allowed; }
      }
      &__btn { padding: 0 var(--space-3); }
      &__num {
        min-width: 38px;
        &.is-active {
          background: var(--color-espresso);
          color: var(--color-warm-white);
          border-color: var(--color-espresso);
        }
      }
    }
  `
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const start = Math.max(0, this.page - 2);
    const end = Math.min(this.totalPages - 1, start + 4);
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  goTo(target: number): void {
    if (target >= 0 && target < this.totalPages && target !== this.page) {
      this.pageChange.emit(target);
    }
  }
}
