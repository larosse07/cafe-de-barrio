import { Pipe, PipeTransform } from '@angular/core';
import { ORDER_STATUS_LABELS } from '../../core/constants/app.constants';

@Pipe({
  name: 'orderStatus',
  standalone: true
})
export class OrderStatusPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return ORDER_STATUS_LABELS[value] ?? value;
  }
}
