import { Component, Input } from '@angular/core';
import { PenCurrencyPipe } from '../../pipes/pen-currency.pipe';

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [PenCurrencyPipe],
  template: `
    <span class="price" [class]="'price price--' + size">
      {{ amount | penCurrency }}
    </span>
  `,
  styles: `
    .price {
      font-family: var(--font-body);
      font-weight: 700;
      color: var(--color-espresso);
      letter-spacing: -0.01em;
      white-space: nowrap;
      &--sm { font-size: var(--text-sm); }
      &--md { font-size: var(--text-lg); }
      &--lg { font-size: var(--text-2xl); }
      &--xl { font-size: var(--text-3xl); font-family: var(--font-display); }
    }
  `
})
export class PriceDisplayComponent {
  @Input({ required: true }) amount!: number | string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
}
