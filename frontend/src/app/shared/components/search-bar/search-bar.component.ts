import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, AppIconComponent],
  template: `
    <div class="search-bar">
      <app-icon name="search" [size]="17" class="search-bar__icon" />
      <input
        type="search"
        class="input search-bar__input"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onInputChange($event)"
        [attr.aria-label]="placeholder"
      />
      @if (value) {
        <button type="button" class="search-bar__clear" (click)="clear()" aria-label="Limpiar búsqueda">
          <app-icon name="x" [size]="15" />
        </button>
      }
    </div>
  `,
  styles: `
    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      &__icon {
        position: absolute;
        left: 0.9rem;
        color: var(--color-text-muted);
        pointer-events: none;
      }
      &__input {
        padding-left: 2.55rem;
        padding-right: 2.3rem;
      }
      &__clear {
        position: absolute;
        right: 0.65rem;
        border: none;
        background: transparent;
        color: var(--color-text-muted);
        padding: 4px;
        border-radius: 50%;
        display: inline-flex;
        &:hover { color: var(--color-espresso); background: var(--color-cream); }
      }
    }
  `
})
export class SearchBarComponent implements OnDestroy {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Output() searchChange = new EventEmitter<string>();

  private readonly input$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.input$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => this.searchChange.emit(term));
  }

  onInputChange(term: string): void {
    this.value = term;
    this.input$.next(term);
  }

  clear(): void {
    this.value = '';
    this.searchChange.emit('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
