import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { Categoria, Producto } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { ProductGridComponent } from '../../../shared/components/product-grid/product-grid.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CategoryCardComponent,
    ProductGridComponent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    AppIconComponent,
    ImageFallbackDirective
  ],
  template: `
    <!-- HERO EDITORIAL -->
    <section class="hero">
      <div class="hero__bg">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=85"
          alt="Preparación artesanal de café de especialidad en Café de Barrio"
          appImageFallback
        />
        <div class="hero__scrim"></div>
      </div>

      <div class="container hero__content">
        <span class="hero__eyebrow">Tostaduría de Especialidad · Origen Peruano</span>
        <h1>El buen café comienza en tu barrio</h1>
        <p class="hero__lead">
          Granos arábica de altura cosechados en Cajamarca, Chanchamayo y Cusco, tostados cada
          semana en lotes pequeños junto a nuestra barra de espresso y pastelería artesanal.
        </p>

        <div class="hero__actions">
          <a routerLink="/tienda" class="btn btn--accent btn--lg">
            <span>Explorar productos</span>
            <app-icon name="arrow-right" [size]="18" />
          </a>
          <a routerLink="/" fragment="nosotros" class="btn btn--hero-ghost btn--lg">
            Nuestra historia
          </a>
        </div>

        <div class="hero__highlights">
          <div>
            <strong>100% Arábica</strong>
            <span>Microlotes peruanos</span>
          </div>
          <div>
            <strong>Tueste semanal</strong>
            <span>Frescura garantizada</span>
          </div>
          <div>
            <strong>Entrega local</strong>
            <span>Pedido directo a casa</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORÍAS DESTACADAS -->
    <section class="section" id="categorias">
      <div class="container">
        <div class="section-header">
          <div class="section-header__text">
            <span class="eyebrow">Nuestra Selección</span>
            <h2>Categorías destacadas</h2>
            <p>Desde granos recién tostados para tu método favorito hasta bebidas de barra y horneado del día.</p>
          </div>
          <a routerLink="/tienda" class="btn btn--outline">
            Ver catálogo completo
            <app-icon name="arrow-right" [size]="16" />
          </a>
        </div>

        @if (loading()) {
          <app-skeleton-loader variant="product-grid" [count]="4" />
        } @else if (error()) {
          <app-error-state [message]="error()!" (retry)="loadHomeData()" />
        } @else {
          <div class="categories-grid">
            @for (cat of categories(); track cat.id) {
              <app-category-card [category]="cat" />
            }
          </div>
        }
      </div>
    </section>

    <!-- PRODUCTOS POPULARES -->
    <section class="section section--tinted">
      <div class="container">
        <div class="section-header">
          <div class="section-header__text">
            <span class="eyebrow">Favoritos del Barrio</span>
            <h2>Productos populares</h2>
            <p>Los favoritos de nuestros vecinos cada mañana, disponibles hoy con stock verificado en tiempo real.</p>
          </div>
          <a routerLink="/tienda" [queryParams]="{ disponible: true }" class="btn btn--secondary">
            Ver disponibles
          </a>
        </div>

        @if (loading()) {
          <app-skeleton-loader variant="product-grid" [count]="4" />
        } @else if (error()) {
          <app-error-state [message]="error()!" (retry)="loadHomeData()" />
        } @else {
          <app-product-grid [products]="popularProducts()" (addToCart)="onAddToCart($event)" />
        }
      </div>
    </section>

    <!-- BANNER PROMOCIONAL EDITORIAL -->
    <section class="section">
      <div class="container">
        <div class="promo-banner">
          <div class="promo-banner__text">
            <span class="eyebrow">Cosecha de Temporada</span>
            <h2>Maridaje de mañana: grano de origen y pastelería recién horneada</h2>
            <p>
              Combina cualquiera de nuestros cafés de especialidad de 250g con nuestros croissants de
              mantequilla o brownies de cacao piurano. Preparamos cada pedido al instante para conservar
              el aroma intacto.
            </p>
            <div class="promo-banner__cta">
              <a routerLink="/tienda" class="btn btn--primary btn--lg">Armar mi pedido</a>
              <span class="promo-banner__tag">Todos los precios en Soles (PEN)</span>
            </div>
          </div>
          <div class="promo-banner__media">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85"
              alt="Barra de café y pastelería artesanal de Café de Barrio"
              appImageFallback
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS RECOMENDADOS -->
    <section class="section section--tinted">
      <div class="container">
        <div class="section-header">
          <div class="section-header__text">
            <span class="eyebrow">Curaduría del Barista</span>
            <h2>Recomendados para tu pausa</h2>
            <p>Perfiles aromáticos y métodos seleccionados por nuestro equipo de tueste.</p>
          </div>
          <a routerLink="/tienda" class="btn btn--ghost">
            Explorar todo
            <app-icon name="arrow-right" [size]="16" />
          </a>
        </div>

        @if (loading()) {
          <app-skeleton-loader variant="product-grid" [count]="4" />
        } @else if (!error()) {
          <app-product-grid [products]="recommendedProducts()" (addToCart)="onAddToCart($event)" />
        }
      </div>
    </section>

    <!-- HISTORIA DE LA CAFETERÍA -->
    <section class="section" id="nosotros">
      <div class="container story">
        <div class="story__gallery">
          <img
            class="story__img-main"
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=85"
            alt="Tueste artesanal y selección de granos en Café de Barrio"
            appImageFallback
            loading="lazy"
          />
          <img
            class="story__img-sub"
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=85"
            alt="Extracción en barra de Café de Barrio"
            appImageFallback
            loading="lazy"
          />
        </div>

        <div class="story__content">
          <span class="eyebrow">Nuestra Historia</span>
          <h2>Nacimos con la idea de devolver el ritual del buen café a la esquina del barrio</h2>
          <p>
            En <strong>Café de Barrio</strong> trabajamos de forma directa con familias caficultoras de
            San Ignacio (Cajamarca), Villa Rica y Quillabamba. Cada bolsa refleja trazabilidad real,
            tueste en lotes pequeños y respeto por la materia prima.
          </p>
          <p>
            No creemos en el café apurado ni en los atajos industriales: calibramos nuestros molinos cada
            mañana, horneamos nuestra pastelería con mantequilla pura y empacamos tu pedido el mismo día.
          </p>

          <div class="story__pillars">
            <div class="story__pillar">
              <strong>+1,800 msnm</strong>
              <span>Altitud de nuestros orígenes peruanos</span>
            </div>
            <div class="story__pillar">
              <strong>48 horas</strong>
              <span>Fermentación lenta en nuestra pastelería</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER VISUAL (informativo, sin simular suscripción sin backend) -->
    <section class="section">
      <div class="container">
        <div class="newsletter-card">
          <div class="newsletter-card__text">
            <span class="eyebrow">Bitácora del Tostador</span>
            <h2>Próximas cosechas y catas de fin de semana</h2>
            <p>
              Muy pronto habilitaremos nuestra lista de correo para anunciar microlotes de temporada y
              sesiones abiertas de catación en nuestra barra de Barranco.
            </p>
          </div>
          <div class="newsletter-card__box">
            <span class="badge badge--neutral">Próximamente disponible</span>
            <p class="newsletter-card__note">
              Mientras tanto, descubre nuestros lotes frescos disponibles hoy directamente en la tienda.
            </p>
            <a routerLink="/tienda" class="btn btn--primary">Ir a la tienda</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      min-height: min(86vh, 720px);
      display: flex;
      align-items: center;
      overflow: hidden;
      background-color: var(--color-espresso-900);
      color: var(--color-warm-white);

      &__bg {
        position: absolute;
        inset: 0;
        img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
        }
      }

      &__scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          rgba(38, 24, 18, 0.9) 0%,
          rgba(56, 37, 29, 0.72) 52%,
          rgba(38, 24, 18, 0.42) 100%
        );
      }

      &__content {
        position: relative;
        z-index: 1;
        padding-block: var(--space-16);
        max-width: 780px;
        margin-inline: 0;
        @media (min-width: 1280px) {
          margin-inline: auto;
          max-width: var(--container-max);
        }
      }

      &__eyebrow {
        display: inline-block;
        padding: 0.35rem 0.85rem;
        border-radius: var(--radius-full);
        background: rgba(232, 216, 195, 0.16);
        border: 1px solid rgba(232, 216, 195, 0.34);
        color: var(--color-beige);
        font-size: var(--text-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        margin-bottom: var(--space-5);
      }

      h1 {
        color: var(--color-warm-white);
        font-size: var(--text-hero);
        max-width: 14ch;
        margin-bottom: var(--space-5);
      }

      &__lead {
        font-size: clamp(1rem, 1.5vw, 1.15rem);
        color: rgba(255, 252, 247, 0.88);
        max-width: 560px;
        margin-bottom: var(--space-8);
        line-height: 1.7;
      }

      &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-bottom: var(--space-10);
      }

      &__highlights {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
        gap: var(--space-5);
        max-width: 560px;
        padding-top: var(--space-6);
        border-top: 1px solid rgba(232, 216, 195, 0.24);

        strong {
          display: block;
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--color-warm-white);
        }
        span {
          font-size: var(--text-xs);
          color: var(--color-beige);
        }
      }
    }

    .btn--hero-ghost {
      background: rgba(255, 252, 247, 0.1);
      color: var(--color-warm-white);
      border: 1px solid rgba(255, 252, 247, 0.36);
      &:hover {
        background: rgba(255, 252, 247, 0.2);
      }
    }

    .section {
      padding-block: var(--space-16);
      &--tinted {
        background-color: var(--color-cream);
        border-block: 1px solid var(--color-border);
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5);
      @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
      @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
    }

    .promo-banner {
      display: grid;
      grid-template-columns: 1fr;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background-color: var(--color-cream);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);

      @media (min-width: 900px) {
        grid-template-columns: 1.15fr 0.85fr;
      }

      &__text {
        padding: var(--space-8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--space-4);
        @media (min-width: 900px) { padding: var(--space-12); }

        h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); }
        p { color: var(--color-text-secondary); line-height: 1.7; }
      }

      &__cta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-4);
        margin-top: var(--space-2);
      }

      &__tag {
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-olive-dark);
      }

      &__media {
        min-height: 260px;
        img { width: 100%; height: 100%; object-fit: cover; }
      }
    }

    .story {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-10);
      align-items: center;

      @media (min-width: 960px) {
        grid-template-columns: 1fr 1.05fr;
      }

      &__gallery {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: var(--space-4);
        align-items: end;
      }

      &__img-main, &__img-sub {
        width: 100%;
        object-fit: cover;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }

      &__img-main { aspect-ratio: 4 / 5; }
      &__img-sub { aspect-ratio: 3 / 4; }

      &__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        h2 { font-size: clamp(1.85rem, 3vw, 2.65rem); }
        p { color: var(--color-text-secondary); line-height: 1.75; }
      }

      &__pillars {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
        margin-top: var(--space-3);
        padding-top: var(--space-5);
        border-top: 1px solid var(--color-border);
      }

      &__pillar {
        strong {
          display: block;
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          color: var(--color-olive-dark);
        }
        span { font-size: var(--text-xs); color: var(--color-text-secondary); }
      }
    }

    .newsletter-card {
      background-color: var(--color-cream);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
      align-items: center;

      @media (min-width: 900px) {
        grid-template-columns: 1.3fr 0.9fr;
        padding: var(--space-12);
      }

      &__text {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        h2 { font-size: clamp(1.6rem, 2.8vw, 2.3rem); }
        p { color: var(--color-text-secondary); }
      }

      &__box {
        background: var(--color-warm-white);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }

      &__note {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
      }
    }
  `
})
export class HomeComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly categories = signal<Categoria[]>([]);
  readonly popularProducts = signal<Producto[]>([]);
  readonly recommendedProducts = signal<Producto[]>([]);

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      categories: this.categoryService.getCategories(),
      popular: this.productService.getProducts({ disponible: true, page: 0, size: 4, sortBy: 'stock', sortDir: 'desc' }),
      recommended: this.productService.getProducts({ disponible: true, page: 0, size: 4, sortBy: 'precio', sortDir: 'desc' })
    }).subscribe({
      next: ({ categories, popular, recommended }) => {
        this.categories.set(categories);
        this.popularProducts.set(popular.content);
        this.recommendedProducts.set(recommended.content);
        this.loading.set(false);
      },
      error: (err: FriendlyHttpError) => {
        this.error.set(err.message || 'No se pudo cargar el catálogo desde el servidor.');
        this.loading.set(false);
      }
    });
  }

  onAddToCart(product: Producto): void {
    this.cartService.addItem(product, 1);
  }
}
