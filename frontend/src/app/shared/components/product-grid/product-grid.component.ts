import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto } from '../../../core/models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <div class="product-grid" [class.product-grid--compact]="columns === 3">
      @for (product of products; track product.id) {
        <app-product-card [product]="product" (addToCart)="addToCart.emit($event)" />
      }
    </div>
  `,
  styles: `
    .product-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 576px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @media (min-width: 960px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      @media (min-width: 1220px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      &--compact {
        @media (min-width: 1220px) {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    }
  `
})
export class ProductGridComponent {
  @Input({ required: true }) products: Producto[] = [];
  @Input() columns: 3 | 4 = 4;
  @Output() addToCart = new EventEmitter<Producto>();
}
