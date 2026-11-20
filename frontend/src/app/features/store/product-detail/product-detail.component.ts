import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { Producto } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { ProductGridComponent } from '../../../shared/components/product-grid/product-grid.component';
import { StockBadgeComponent } from '../../../shared/components/stock-badge/stock-badge.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    ImageFallbackDirective,
    AppIconComponent,
    PriceDisplayComponent,
    StockBadgeComponent,
    ProductGridComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent
  ],
  template: `
    <div class="container detail-page">
      <nav class="breadcrumb" aria-label="Ruta de navegación">
        <a routerLink="/">Inicio</a>
        <span>/</span>
        <a routerLink="/tienda">Tienda</a>
        @if (product()) {
          <span>/</span>
          <a routerLink="/tienda" [queryParams]="{ categoria: product()!.categoriaId }">
            {{ product()!.categoriaNombre }}
          </a>
          <span>/</span>
          <strong>{{ product()!.nombre }}</strong>
        }
      </nav>

      @if (loading()) {
        <app-loading-spinner label="Cargando detalle del producto..." />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="reload()" />
      } @else if (product(); as p) {
        <div class="detail-grid">
          <!-- GALERÍA DE FOTOGRAFÍAS -->
          <div class="gallery">
            <div class="gallery__main">
              <img [src]="selectedImage()" [alt]="p.nombre" appImageFallback />
            </div>
            <div class="gallery__thumbs">
              @for (img of galleryImages(); track img; let idx = $index) {
                <button
                  type="button"
                  class="gallery__thumb"
                  [class.is-active]="selectedImage() === img"
                  (click)="selectedImage.set(img)"
                  [attr.aria-label]="'Vista ' + (idx + 1)"
                >
                  <img [src]="img" [alt]="p.nombre + ' vista ' + (idx + 1)" appImageFallback />
                </button>
              }
            </div>
          </div>

          <!-- INFORMACIÓN -->
          <div class="detail-info">
            <div class="detail-info__top">
              <span class="eyebrow">{{ p.categoriaNombre }}</span>
              <app-stock-badge [stock]="p.stock" [active]="p.activo" [showCount]="true" />
            </div>

            <h1>{{ p.nombre }}</h1>

            <div class="detail-info__price">
              <app-price-display [amount]="p.precio" size="xl" />
              <span class="detail-info__tax">Precio final en Soles (PEN)</span>
            </div>

            <p class="detail-info__desc">{{ p.descripcion }}</p>

            <div class="detail-info__purchase surface-card">
              <div class="qty-row">
                <label for="qty-input">Cantidad</label>
                <div class="qty-stepper">
                  <button
                    type="button"
                    (click)="changeQuantity(-1)"
                    [disabled]="quantity() <= 1 || !p.disponible"
                    aria-label="Disminuir cantidad"
                  >
                    <app-icon name="minus" [size]="15" />
                  </button>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    [max]="p.stock"
                    [value]="quantity()"
                    (change)="onDirectQuantity($event)"
                    [disabled]="!p.disponible"
                  />
                  <button
                    type="button"
                    (click)="changeQuantity(1)"
                    [disabled]="quantity() >= p.stock || !p.disponible"
                    aria-label="Aumentar cantidad"
                  >
                    <app-icon name="plus" [size]="15" />
                  </button>
                </div>
                <span class="qty-max">Máx. {{ p.stock }} disponibles</span>
              </div>

              <div class="detail-info__buttons">
                <button
                  type="button"
                  class="btn btn--primary btn--lg btn--full"
                  [disabled]="!p.disponible"
                  (click)="addToCart(p)"
                >
                  <app-icon name="shopping-bag" [size]="18" />
                  <span>{{ p.disponible ? 'Agregar al carrito' : 'Sin stock disponible' }}</span>
                </button>
                <a routerLink="/carrito" class="btn btn--secondary btn--lg">
                  Ver carrito
                </a>
              </div>
            </div>

            <ul class="detail-info__perks">
              <li><app-icon name="check-circle" [size]="16" /> Stock verificado directamente en tienda</li>
              <li><app-icon name="coffee" [size]="16" /> Tostado y preparado artesanalmente bajo pedido</li>
              <li><app-icon name="map-pin" [size]="16" /> Entrega a domicilio en Lima Metropolitana</li>
            </ul>
          </div>
        </div>

        <!-- PRODUCTOS RELACIONADOS -->
        @if (relatedProducts().length > 0) {
          <section class="related-section">
            <div class="section-header">
              <div class="section-header__text">
                <span class="eyebrow">También te puede gustar</span>
                <h2>Productos relacionados</h2>
              </div>
              <a routerLink="/tienda" [queryParams]="{ categoria: p.categoriaId }" class="btn btn--outline btn--sm">
                Ver toda la categoría
              </a>
            </div>
            <app-product-grid [products]="relatedProducts()" (addToCart)="addRelated($event)" />
          </section>
        }
      }
    </div>
  `,
  styles: `
    .detail-page {
      padding-block: var(--space-8) var(--space-12);
    }

    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
      a:hover { color: var(--color-espresso); }
      strong { color: var(--color-espresso); }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-10);
      align-items: start;
      @media (min-width: 900px) {
        grid-template-columns: 1.05fr 0.95fr;
      }
    }

    .gallery {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      &__main {
        aspect-ratio: 4 / 3;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-cream);
        border: 1px solid var(--color-border);
        img { width: 100%; height: 100%; object-fit: cover; }
      }
      &__thumbs {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-3);
      }
      &__thumb {
        aspect-ratio: 4 / 3;
        padding: 0;
        border-radius: var(--radius-sm);
        overflow: hidden;
        border: 2px solid transparent;
        background: var(--color-cream);
        opacity: 0.72;
        transition: all var(--transition-fast);
        &:hover { opacity: 1; }
        &.is-active { border-color: var(--color-espresso); opacity: 1; }
        img { width: 100%; height: 100%; object-fit: cover; }
      }
    }

    .detail-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);

      &__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        flex-wrap: wrap;
      }

      h1 { font-size: clamp(2rem, 3.6vw, 3rem); }

      &__price {
        display: flex;
        align-items: baseline;
        gap: var(--space-3);
        flex-wrap: wrap;
      }

      &__tax { font-size: var(--text-xs); color: var(--color-text-muted); }

      &__desc {
        font-size: var(--text-base);
        color: var(--color-text-secondary);
        line-height: 1.75;
      }

      &__purchase {
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }

      &__buttons {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        @media (min-width: 576px) {
          flex-direction: row;
        }
      }

      &__perks {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        li { display: flex; align-items: center; gap: var(--space-2); color: var(--color-coffee); }
      }
    }

    .qty-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      label {
        font-size: var(--text-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-secondary);
      }
    }

    .qty-stepper {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--color-warm-white);
      button {
        width: 38px; height: 38px; border: none; background: var(--color-cream);
        color: var(--color-espresso); display: inline-flex; align-items: center; justify-content: center;
        &:hover:not(:disabled) { background: var(--color-beige); }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      }
      input {
        width: 56px; height: 38px; text-align: center; border: none;
        font-weight: 600; background: var(--color-warm-white);
        &::-webkit-inner-spin-button { -webkit-appearance: none; }
      }
    }

    .qty-max { font-size: var(--text-xs); color: var(--color-text-muted); }

    .related-section {
      margin-top: var(--space-16);
      padding-top: var(--space-12);
      border-top: 1px solid var(--color-border);
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly product = signal<Producto | null>(null);
  readonly relatedProducts = signal<Producto[]>([]);
  readonly quantity = signal(1);
  readonly selectedImage = signal('');
  readonly galleryImages = signal<string[]>([]);

  private currentId = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.currentId = id;
        this.loadProduct(id);
      }
    });
  }

  reload(): void {
    if (this.currentId) this.loadProduct(this.currentId);
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.quantity.set(1);

    this.productService.getProductById(id).subscribe({
      next: prod => {
        this.product.set(prod);
        const images = [
          prod.imagenUrl,
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
          'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85'
        ];
        this.galleryImages.set(images);
        this.selectedImage.set(images[0]);
        this.loading.set(false);
        this.loadRelated(prod);
      },
      error: (err: FriendlyHttpError) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  private loadRelated(prod: Producto): void {
    this.productService
      .getProducts({ categoria: prod.categoriaId, disponible: true, size: 5 })
      .subscribe({
        next: res => {
          this.relatedProducts.set(res.content.filter(item => item.id !== prod.id).slice(0, 4));
        },
        error: () => this.relatedProducts.set([])
      });
  }

  changeQuantity(delta: number): void {
    const prod = this.product();
    if (!prod) return;
    const next = Math.min(Math.max(1, this.quantity() + delta), Math.max(1, prod.stock));
    this.quantity.set(next);
  }

  onDirectQuantity(event: Event): void {
    const prod = this.product();
    if (!prod) return;
    const input = event.target as HTMLInputElement;
    const parsed = Math.floor(Number(input.value) || 1);
    const clamped = Math.min(Math.max(1, parsed), Math.max(1, prod.stock));
    this.quantity.set(clamped);
    input.value = String(clamped);
  }

  addToCart(product: Producto): void {
    this.cartService.addItem(product, this.quantity());
  }

  addRelated(product: Producto): void {
    this.cartService.addItem(product, 1);
  }
}
