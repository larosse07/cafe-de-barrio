import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, ImageFallbackDirective, AppIconComponent, PriceDisplayComponent, EmptyStateComponent],
  template: `
    <section class="cart-page container">
      <div class="cart-header">
        <div>
          <span class="eyebrow">Tu Selección</span>
          <h1>Carrito de compras</h1>
        </div>
        @if (!cart.isEmpty()) {
          <button type="button" class="btn btn--ghost btn--sm" (click)="cart.clear()">
            <app-icon name="trash" [size]="15" />
            Vaciar carrito
          </button>
        }
      </div>

      @if (cart.isEmpty()) {
        <app-empty-state
          icon="shopping-bag"
          title="Tu carrito está vacío"
          description="Explora nuestros cafés de especialidad, bebidas de barra y pastelería recién horneada."
          actionLabel="Explorar catálogo"
          (action)="goToCatalog()"
        />
      } @else {
        <div class="cart-layout">
          <div class="cart-list">
            @for (item of cart.items(); track item.productoId) {
              <article class="cart-item surface-card">
                <a [routerLink]="['/producto', item.productoId]" class="cart-item__img">
                  <img [src]="item.imagenUrl" [alt]="item.nombre" appImageFallback />
                </a>

                <div class="cart-item__info">
                  <span class="cart-item__cat">{{ item.categoriaNombre }}</span>
                  <a [routerLink]="['/producto', item.productoId]" class="cart-item__name">
                    <h3>{{ item.nombre }}</h3>
                  </a>
                  <span class="cart-item__unit">
                    Precio unitario: <app-price-display [amount]="item.precio" size="sm" />
                  </span>
                  <span class="cart-item__stock">Stock disponible: {{ item.stockDisponible }}</span>
                </div>

                <div class="cart-item__controls">
                  <div class="qty-box">
                    <button
                      type="button"
                      (click)="cart.decrement(item.productoId)"
                      aria-label="Reducir cantidad"
                    >
                      <app-icon name="minus" [size]="14" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      [max]="item.stockDisponible"
                      [value]="item.cantidad"
                      (change)="onQtyChange(item.productoId, $event)"
                      aria-label="Cantidad"
                    />
                    <button
                      type="button"
                      (click)="cart.increment(item.productoId)"
                      [disabled]="item.cantidad >= item.stockDisponible"
                      aria-label="Aumentar cantidad"
                    >
                      <app-icon name="plus" [size]="14" />
                    </button>
                  </div>

                  <div class="cart-item__subtotal">
                    <span>Subtotal</span>
                    <app-price-display [amount]="item.precio * item.cantidad" size="md" />
                  </div>

                  <button
                    type="button"
                    class="btn btn--ghost btn--icon cart-item__remove"
                    (click)="cart.removeItem(item.productoId)"
                    aria-label="Eliminar producto"
                  >
                    <app-icon name="trash" [size]="16" />
                  </button>
                </div>
              </article>
            }
          </div>

          <aside class="cart-summary surface-card">
            <h2>Resumen de compra</h2>

            <div class="summary-rows">
              <div class="summary-row">
                <span>Productos ({{ cart.totalItems() }})</span>
                <app-price-display [amount]="cart.totalAmount()" size="sm" />
              </div>
              <div class="summary-row">
                <span>Entrega local</span>
                <span class="summary-free">Coordinada al confirmar</span>
              </div>
            </div>

            <div class="summary-total">
              <span>Total estimado</span>
              <app-price-display [amount]="cart.totalAmount()" size="lg" />
            </div>

            <p class="summary-note">
              Al continuar validaremos el stock y precios actuales directamente con nuestra base de datos.
            </p>

            <button
              type="button"
              class="btn btn--primary btn--lg btn--full"
              [disabled]="validating()"
              (click)="proceedToCheckout()"
            >
              <span>{{ validating() ? 'Verificando stock...' : 'Continuar al checkout' }}</span>
              <app-icon name="arrow-right" [size]="17" />
            </button>

            <a routerLink="/tienda" class="btn btn--ghost btn--full">
              Seguir comprando
            </a>
          </aside>
        </div>
      }
    </section>
  `,
  styles: `
    .cart-page {
      padding-block: var(--space-10) var(--space-12);
    }

    .cart-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
      h1 { font-size: clamp(2rem, 3.5vw, 2.85rem); margin-top: var(--space-1); }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      align-items: start;
      @media (min-width: 960px) {
        grid-template-columns: 1.45fr 0.85fr;
      }
    }

    .cart-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .cart-item {
      padding: var(--space-4);
      display: grid;
      grid-template-columns: 88px 1fr;
      gap: var(--space-4);
      align-items: center;

      @media (min-width: 680px) {
        grid-template-columns: 108px 1fr auto;
        padding: var(--space-5);
      }

      &__img {
        aspect-ratio: 1 / 1;
        border-radius: var(--radius-sm);
        overflow: hidden;
        background: var(--color-cream);
        img { width: 100%; height: 100%; object-fit: cover; }
      }

      &__info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      &__cat {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-olive-dark);
        font-weight: 700;
      }

      &__name h3 { font-size: 1.25rem; }
      &__unit, &__stock { font-size: var(--text-xs); color: var(--color-text-secondary); }

      &__controls {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding-top: var(--space-3);
        border-top: 1px solid var(--color-cream-deep);

        @media (min-width: 680px) {
          grid-column: auto;
          padding-top: 0;
          border-top: none;
        }
      }

      &__subtotal {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        span { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; }
      }

      &__remove { color: var(--color-danger); }
    }

    .qty-box {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      overflow: hidden;
      button {
        width: 34px; height: 34px; border: none; background: var(--color-cream);
        display: inline-flex; align-items: center; justify-content: center;
        &:hover:not(:disabled) { background: var(--color-beige); }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      }
      input {
        width: 46px; height: 34px; text-align: center; border: none; font-weight: 600;
        &::-webkit-inner-spin-button { -webkit-appearance: none; }
      }
    }

    .cart-summary {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-5));
      h2 { font-size: var(--text-2xl); }
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }

    .summary-free { color: var(--color-olive-dark); font-weight: 600; font-size: var(--text-xs); }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 700;
    }

    .summary-note { font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.5; }
  `
})
export class CartComponent {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly validating = signal(false);

  onQtyChange(productoId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const qty = Math.floor(Number(input.value) || 1);
    this.cart.updateQuantity(productoId, qty);
  }

  proceedToCheckout(): void {
    this.validating.set(true);
    this.cart.revalidateStock().subscribe({
      next: result => {
        this.validating.set(false);
        if (result.messages.length > 0) {
          result.messages.forEach(msg => this.toast.warning(msg, 'Stock actualizado'));
        }
        if (!this.cart.isEmpty()) {
          this.router.navigate(['/checkout']);
        }
      },
      error: () => {
        this.validating.set(false);
        this.toast.error('No pudimos verificar el stock en el servidor. Intenta nuevamente.');
      }
    });
  }

  goToCatalog(): void {
    this.router.navigate(['/tienda']);
  }
}
