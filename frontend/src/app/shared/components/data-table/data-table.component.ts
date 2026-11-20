import { Component, Input } from '@angular/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [SkeletonLoaderComponent, EmptyStateComponent],
  template: `
    @if (loading) {
      <app-skeleton-loader variant="table" [count]="5" />
    } @else if (empty) {
      <app-empty-state [title]="emptyTitle" [description]="emptyDescription" />
    } @else {
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              @for (col of columns; track col) {
                <th>{{ col }}</th>
              }
            </tr>
          </thead>
          <tbody>
            <ng-content />
          </tbody>
        </table>
      </div>
    }
  `
})
export class DataTableComponent {
  @Input() columns: string[] = [];
  @Input() loading = false;
  @Input() empty = false;
  @Input() emptyTitle = 'Sin resultados';
  @Input() emptyDescription = 'No encontramos registros que coincidan con los filtros seleccionados.';
}
