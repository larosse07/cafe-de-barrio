import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';
import { AppIconComponent } from '../icon/icon.component';
import { PriceDisplayComponent } from '../price-display/price-display.component';
import { StockBadgeComponent } from '../stock-badge/stock-badge.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, ImageFallbackDirective, AppIconComponent, PriceDisplayComponent, StockBadgeComponent],
  template: `
    <article class="product-card" [class.product-card--out]="!product.disponible">
      <a [routerLink]="['/producto', product.id]" class="product-card__media">
        <img [src]="product.imagenUrl" [alt]="product.nombre" appImageFallback loading="lazy" />
        <div class="product-card__badges">
          <span class="product-card__cat">{{ product.categoriaNombre }}</span>
          <app-stock-badge [stock]="product.stock" [active]="product.activo" />
        </div>
      </a>

      <div class="product-card__body">
        <a [routerLink]="['/producto', product.id]" class="product-card__title">
          <h3>{{ product.nombre }}</h3>
        </a>
        <p class="product-card__desc">{{ product.descripcion }}</p>

        <div class="product-card__meta">
          <app-price-display [amount]="product.precio" size="md" />
          <span class="product-card__stock-text">
            {{ product.stock > 0 ? product.stock + ' en stock' : 'Sin stock' }}
          </span>
        </div>

        <div class="product-card__actions">
          <a [routerLink]="['/producto', product.id]" class="btn btn--secondary btn--sm">
            Ver detalle
          </a>
          <button
            type="button"
            class="btn btn--primary btn--sm"
            [disabled]="!product.disponible"
            (click)="addToCart.emit(product)"
          >
            <app-icon name="shopping-bag" [size]="15" />
            <span>{{ product.disponible ? 'Agregar' : 'Agotado' }}</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: `
    .product-card {
      display: flex;
      flex-direction: column;
      background-color: var(--color-warm-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-border-strong);
        .product-card__media img { transform: scale(1.05); }
      }

      &--out {
        .product-card__media img { filter: grayscale(35%) opacity(0.85); }
      }

      &__media {
        position: relative;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        background-color: var(--color-cream);
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
      }

      &__badges {
        position: absolute;
        top: var(--space-3);
        left: var(--space-3);
        right: var(--space-3);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-2);
        flex-wrap: wrap;
      }

      &__cat {
        background: rgba(56, 37, 29, 0.84);
        backdrop-filter: blur(4px);
        color: var(--color-warm-white);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.03em;
      }

      &__body {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: var(--space-5);
        gap: var(--space-3);
      }

      &__title h3 {
        font-size: 1.35rem;
        line-height: 1.2;
        transition: color var(--transition-fast);
        &:hover { color: var(--color-coffee); }
      }

      &__desc {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
      }

      &__meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding-top: var(--space-2);
        border-top: 1px solid var(--color-cream-deep);
      }

      &__stock-text {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }

      &__actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-2);
      }
    }
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Producto;
  @Output() addToCart = new EventEmitter<Producto>();
}
