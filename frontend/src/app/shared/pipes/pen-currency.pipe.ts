import { Pipe, PipeTransform } from '@angular/core';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Pipe({
  name: 'penCurrency',
  standalone: true
})
export class PenCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) {
      return `${APP_CONSTANTS.CURRENCY_SYMBOL} 0.00`;
    }
    return `${APP_CONSTANTS.CURRENCY_SYMBOL} ${num.toFixed(2)}`;
  }
}
