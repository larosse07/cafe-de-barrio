import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { Categoria, PageResponse, Producto } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ProductGridComponent } from '../../../shared/components/product-grid/product-grid.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule,
    SearchBarComponent,
    ProductGridComponent,
    PaginationComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    AppIconComponent
  ],
  template: `
    <section class="catalog-hero">
      <div class="container">
        <span class="eyebrow">Tienda Artesanal</span>
        <h1>Catálogo de Café de Barrio</h1>
        <p>Explora granos peruanos de especialidad, bebidas recién extraídas, pastelería del día y métodos.</p>
      </div>
    </section>

    <section class="container catalog-body">
      <!-- BARRA DE FILTROS -->
      <div class="filters-bar surface-card">
        <div class="filters-bar__search">
          <app-search-bar
            placeholder="Buscar café, bebidas o pastelería..."
            [value]="searchTerm()"
            (searchChange)="onSearch($event)"
          />
        </div>

        <div class="filters-bar__controls">
          <select
            class="select"
            [ngModel]="selectedCategory()"
            (ngModelChange)="onCategoryChange($event)"
            aria-label="Filtrar por categoría"
          >
            <option [ngValue]="null">Todas las categorías</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.nombre }}</option>
            }
          </select>

          <select
            class="select"
            [ngModel]="availabilityFilter()"
            (ngModelChange)="onAvailabilityChange($event)"
            aria-label="Filtrar por disponibilidad"
          >
            <option value="all">Cualquier disponibilidad</option>
            <option value="true">Solo disponibles</option>
            <option value="false">Agotados</option>
          </select>

          <select
            class="select"
            [ngModel]="sortOption()"
            (ngModelChange)="onSortChange($event)"
            aria-label="Ordenar productos"
          >
            <option value="fechaCreacion:desc">Más recientes</option>
            <option value="precio:asc">Precio: menor a mayor</option>
            <option value="precio:desc">Precio: mayor a menor</option>
            <option value="nombre:asc">Nombre: A – Z</option>
            <option value="nombre:desc">Nombre: Z – A</option>
          </select>

          @if (hasActiveFilters()) {
            <button type="button" class="btn btn--secondary" (click)="clearFilters()">
              <app-icon name="x" [size]="15" />
              Limpiar
            </button>
          }
        </div>
      </div>

      <!-- CHIPS DE CATEGORÍA -->
      @if (categories().length > 0) {
        <div class="cat-chips" role="tablist" aria-label="Categorías rápidas">
          <button
            type="button"
            class="chip"
            [class.is-active]="selectedCategory() === null"
            (click)="onCategoryChange(null)"
          >
            Todos
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              type="button"
              class="chip"
              [class.is-active]="selectedCategory() === cat.id"
              (click)="onCategoryChange(cat.id)"
            >
              {{ cat.nombre }}
            </button>
          }
        </div>
      }

      <!-- RESUMEN -->
      @if (!loading() && !error() && pageData()) {
        <div class="catalog-meta">
          <span>
            Mostrando <strong>{{ pageData()!.content.length }}</strong> de
            <strong>{{ pageData()!.totalElements }}</strong> productos
          </span>
        </div>
      }

      <!-- CONTENIDO -->
      @if (loading()) {
        <app-skeleton-loader variant="product-grid" [count]="8" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="loadProducts()" />
      } @else if (pageData() && pageData()!.content.length === 0) {
        <app-empty-state
          icon="search"
          title="No encontramos productos"
          description="Prueba ajustando la búsqueda o limpiando los filtros para ver todo nuestro catálogo."
          actionLabel="Limpiar filtros"
          (action)="clearFilters()"
        />
      } @else if (pageData()) {
        <app-product-grid [products]="pageData()!.content" (addToCart)="onAddToCart($event)" />
        <app-pagination
          [page]="pageData()!.page"
          [totalPages]="pageData()!.totalPages"
          (pageChange)="onPageChange($event)"
        />
      }
    </section>
  `,
  styles: `
    .catalog-hero {
      background-color: var(--color-cream);
      border-bottom: 1px solid var(--color-border);
      padding-block: var(--space-12) var(--space-10);
      h1 {
        font-size: clamp(2rem, 3.8vw, 3.1rem);
        margin-block: var(--space-2) var(--space-3);
      }
      p { color: var(--color-text-secondary); max-width: 600px; }
    }

    .catalog-body {
      padding-block: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .filters-bar {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);

      @media (min-width: 1024px) {
        flex-direction: row;
        align-items: center;
      }

      &__search { flex: 1.2; min-width: 220px; }
      &__controls {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-3);
        @media (min-width: 600px) {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (min-width: 1024px) {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          .select { width: auto; min-width: 175px; }
        }
      }
    }

    .cat-chips {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }

    .chip {
      padding: 0.45rem 1rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border-strong);
      background: var(--color-warm-white);
      color: var(--color-text-secondary);
      font-size: var(--text-xs);
      font-weight: 600;
      white-space: nowrap;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-espresso); color: var(--color-espresso); }
      &.is-active {
        background: var(--color-espresso);
        border-color: var(--color-espresso);
        color: var(--color-warm-white);
      }
    }

    .catalog-meta {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
  `
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = signal<Categoria[]>([]);
  readonly pageData = signal<PageResponse<Producto> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal<number | null>(null);
  readonly availabilityFilter = signal<'all' | 'true' | 'false'>('all');
  readonly sortOption = signal('fechaCreacion:desc');
  readonly currentPage = signal(0);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });

    this.route.queryParamMap.subscribe(params => {
      const catParam = params.get('categoria');
      const dispParam = params.get('disponible');
      const searchParam = params.get('search');

      this.selectedCategory.set(catParam ? Number(catParam) : null);
      this.availabilityFilter.set(dispParam === 'true' ? 'true' : dispParam === 'false' ? 'false' : 'all');
      this.searchTerm.set(searchParam ?? '');
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const [sortBy, sortDir] = this.sortOption().split(':') as [string, 'asc' | 'desc'];
    const disp = this.availabilityFilter();

    this.productService
      .getProducts({
        categoria: this.selectedCategory(),
        disponible: disp === 'all' ? null : disp === 'true',
        search: this.searchTerm().trim() || null,
        page: this.currentPage(),
        size: 12,
        sortBy,
        sortDir
      })
      .subscribe({
        next: data => {
          this.pageData.set(data);
          this.loading.set(false);
        },
        error: (err: FriendlyHttpError) => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onCategoryChange(catId: number | null): void {
    this.selectedCategory.set(catId);
    this.currentPage.set(0);
    this.syncQueryParams();
  }

  onAvailabilityChange(value: 'all' | 'true' | 'false'): void {
    this.availabilityFilter.set(value);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(value: string): void {
    this.sortOption.set(value);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategory() !== null ||
      this.availabilityFilter() !== 'all' ||
      this.searchTerm().trim().length > 0 ||
      this.sortOption() !== 'fechaCreacion:desc'
    );
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.availabilityFilter.set('all');
    this.sortOption.set('fechaCreacion:desc');
    this.currentPage.set(0);
    this.router.navigate(['/tienda']);
    this.loadProducts();
  }

  onAddToCart(product: Producto): void {
    this.cartService.addItem(product, 1);
  }

  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categoria: this.selectedCategory() ?? undefined
      },
      queryParamsHandling: 'merge'
    });
  }
}
