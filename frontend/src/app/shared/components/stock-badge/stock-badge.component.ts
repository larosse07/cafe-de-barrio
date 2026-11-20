import { Component, Input } from '@angular/core';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-stock-badge',
  standalone: true,
  template: `
    @if (!active) {
      <span class="badge badge--neutral">Inactivo</span>
    } @else if (stock <= 0) {
      <span class="badge badge--danger">Agotado</span>
    } @else if (stock <= lowThreshold) {
      <span class="badge badge--warning">Últimas {{ stock }} unid.</span>
    } @else {
      <span class="badge badge--success">
        @if (showCount) {
          Disponible ({{ stock }})
        } @else {
          Disponible
        }
      </span>
    }
  `
})
export class StockBadgeComponent {
  @Input({ required: true }) stock!: number;
  @Input() active = true;
  @Input() showCount = false;
  readonly lowThreshold = APP_CONSTANTS.LOW_STOCK_THRESHOLD;
}
