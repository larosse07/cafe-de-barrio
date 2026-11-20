import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { Categoria, PageResponse, Producto } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomValidators } from '../../../core/validators/custom.validators';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { StockBadgeComponent } from '../../../shared/components/stock-badge/stock-badge.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SearchBarComponent,
    DataTableComponent,
    PaginationComponent,
    PriceDisplayComponent,
    StockBadgeComponent,
    FormFieldComponent,
    ConfirmDialogComponent,
    ErrorStateComponent,
    AppIconComponent,
    ImageFallbackDirective
  ],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <div>
          <span class="eyebrow">Inventario y Catálogo</span>
          <h1>Gestión de productos</h1>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" [size]="16" />
          Nuevo producto
        </button>
      </div>

      <!-- FILTROS -->
      <div class="toolbar surface-card">
        <div class="toolbar__search">
          <app-search-bar
            placeholder="Buscar producto por nombre o descripción..."
            [value]="searchTerm()"
            (searchChange)="onSearch($event)"
          />
        </div>

        <select
          class="select toolbar__select"
          [ngModel]="categoryFilter()"
          (ngModelChange)="onCategoryFilter($event)"
          aria-label="Filtrar por categoría"
        >
          <option [ngValue]="null">Todas las categorías</option>
          @for (cat of categories(); track cat.id) {
            <option [ngValue]="cat.id">{{ cat.nombre }}</option>
          }
        </select>

        <select
          class="select toolbar__select"
          [ngModel]="availabilityFilter()"
          (ngModelChange)="onAvailabilityFilter($event)"
          aria-label="Filtrar por stock"
        >
          <option value="all">Todo el stock</option>
          <option value="true">Con stock</option>
          <option value="false">Sin stock</option>
        </select>
      </div>

      @if (error()) {
        <app-error-state [message]="error()!" (retry)="loadProducts()" />
      } @else {
        <app-data-table
          [columns]="['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones']"
          [loading]="loading()"
          [empty]="!loading() && (pageData()?.content?.length ?? 0) === 0"
          emptyTitle="Sin productos encontrados"
          emptyDescription="Crea un nuevo producto o ajusta los filtros de búsqueda."
        >
          @for (prod of pageData()?.content ?? []; track prod.id) {
            <tr>
              <td>
                <div class="prod-cell">
                  <img [src]="prod.imagenUrl" [alt]="prod.nombre" appImageFallback />
                  <div>
                    <strong>{{ prod.nombre }}</strong>
                    <span>ID #{{ prod.id }}</span>
                  </div>
                </div>
              </td>
              <td>{{ prod.categoriaNombre }}</td>
              <td><app-price-display [amount]="prod.precio" size="sm" /></td>
              <td>
                <app-stock-badge [stock]="prod.stock" [active]="prod.activo" [showCount]="true" />
              </td>
              <td>
                <span class="badge" [class.badge--success]="prod.activo" [class.badge--neutral]="!prod.activo">
                  {{ prod.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn btn--secondary btn--sm" (click)="openEditModal(prod)">
                    <app-icon name="edit" [size]="14" />
                    Editar
                  </button>
                  @if (prod.activo) {
                    <button type="button" class="btn btn--ghost btn--sm row-actions__danger" (click)="askDeactivate(prod)">
                      <app-icon name="trash" [size]="14" />
                      Desactivar
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
        </app-data-table>

        @if (pageData(); as pd) {
          <app-pagination [page]="pd.page" [totalPages]="pd.totalPages" (pageChange)="onPageChange($event)" />
        }
      }
    </div>

    <!-- MODAL CREAR / EDITAR -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModalOnBackdrop($event)">
        <div class="modal-panel modal-panel--lg" role="dialog" aria-modal="true">
          <div class="modal-panel__header">
            <h3>{{ editingProduct() ? 'Editar producto' : 'Nuevo producto' }}</h3>
            <button type="button" class="btn btn--ghost btn--icon" (click)="closeModal()" aria-label="Cerrar">
              <app-icon name="x" [size]="18" />
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveProduct()" novalidate>
            <div class="modal-panel__body form-grid">
              <app-form-field label="Nombre" forId="p-nombre" [required]="true" [control]="form.controls.nombre">
                <input id="p-nombre" type="text" class="input" formControlName="nombre" placeholder="Ej. Cajamarca Origen 250g" />
              </app-form-field>

              <app-form-field label="Categoría" forId="p-cat" [required]="true" [control]="form.controls.categoriaId">
                <select id="p-cat" class="select" formControlName="categoriaId">
                  <option [ngValue]="null" disabled>Selecciona una categoría</option>
                  @for (cat of categories(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.nombre }}</option>
                  }
                </select>
              </app-form-field>

              <app-form-field label="Precio (S/ PEN)" forId="p-precio" [required]="true" [control]="form.controls.precio">
                <input id="p-precio" type="number" step="0.10" min="0.01" class="input" formControlName="precio" />
              </app-form-field>

              <app-form-field label="Stock disponible" forId="p-stock" [required]="true" [control]="form.controls.stock">
                <input id="p-stock" type="number" min="0" step="1" class="input" formControlName="stock" />
              </app-form-field>

              <div class="form-grid__full">
                <app-form-field
                  label="URL de imagen"
                  forId="p-img"
                  [required]="true"
                  [control]="form.controls.imagenUrl"
                  hint="Usa una fotografía real acorde al producto (HTTPS o ruta local)."
                >
                  <input id="p-img" type="url" class="input" formControlName="imagenUrl" placeholder="https://images.unsplash.com/..." />
                </app-form-field>
                @if (form.controls.imagenUrl.value) {
                  <div class="img-preview">
                    <img [src]="form.controls.imagenUrl.value" alt="Vista previa" appImageFallback />
                  </div>
                }
              </div>

              <div class="form-grid__full">
                <app-form-field label="Descripción" forId="p-desc" [required]="true" [control]="form.controls.descripcion">
                  <textarea id="p-desc" class="textarea" formControlName="descripcion" placeholder="Describe origen, notas de cata o ingredientes..."></textarea>
                </app-form-field>
              </div>

              <div class="form-grid__full checkbox-row">
                <input id="p-activo" type="checkbox" formControlName="activo" />
                <label for="p-activo">Producto activo y visible en la tienda pública</label>
              </div>
            </div>

            <div class="modal-panel__footer">
              <button type="button" class="btn btn--secondary" [disabled]="saving()" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary" [disabled]="saving()">
                {{ saving() ? 'Guardando...' : (editingProduct() ? 'Guardar cambios' : 'Crear producto') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="!!productToDeactivate()"
      title="Desactivar producto"
      [message]="'¿Deseas desactivar &quot;' + (productToDeactivate()?.nombre ?? '') + '&quot;? Dejará de mostrarse en la tienda pública, conservando el historial de pedidos.'"
      confirmLabel="Sí, desactivar"
      [danger]="true"
      [loading]="deactivating()"
      (confirm)="confirmDeactivate()"
      (cancel)="productToDeactivate.set(null)"
    />
  `,
  styles: `
    .admin-section { display: flex; flex-direction: column; gap: var(--space-5); }
    .section-top {
      display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-4);
      h1 { font-size: clamp(1.75rem, 3vw, 2.3rem); margin-top: 2px; }
    }
    .toolbar {
      padding: var(--space-4); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center;
      &__search { flex: 1; min-width: 220px; }
      &__select { width: auto; min-width: 175px; }
    }
    .prod-cell {
      display: flex; align-items: center; gap: var(--space-3); min-width: 200px;
      img { width: 46px; height: 46px; border-radius: var(--radius-xs); object-fit: cover; flex-shrink: 0; }
      div { display: flex; flex-direction: column; }
      strong { color: var(--color-espresso); font-size: var(--text-sm); }
      span { font-size: var(--text-xs); color: var(--color-text-muted); }
    }
    .row-actions {
      display: flex; gap: var(--space-2); align-items: center;
      &__danger { color: var(--color-danger); }
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr; gap: var(--space-4);
      @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
      &__full { grid-column: 1 / -1; }
    }
    .img-preview {
      margin-top: var(--space-2); width: 140px; height: 96px; border-radius: var(--radius-sm);
      overflow: hidden; border: 1px solid var(--color-border);
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .checkbox-row {
      display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm);
      input { width: 18px; height: 18px; accent-color: var(--color-espresso); }
    }
  `
})
export class AdminProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Categoria[]>([]);
  readonly pageData = signal<PageResponse<Producto> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly categoryFilter = signal<number | null>(null);
  readonly availabilityFilter = signal<'all' | 'true' | 'false'>('all');
  readonly page = signal(0);

  readonly modalOpen = signal(false);
  readonly editingProduct = signal<Producto | null>(null);
  readonly saving = signal(false);

  readonly productToDeactivate = signal<Producto | null>(null);
  readonly deactivating = signal(false);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(2), Validators.maxLength(140)]],
    descripcion: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(10), Validators.maxLength(2000)]],
    precio: [15 as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [10 as number | null, [Validators.required, Validators.min(0)]],
    imagenUrl: ['', [Validators.required, CustomValidators.imageUrl(), Validators.maxLength(500)]],
    categoriaId: [null as number | null, [Validators.required]],
    activo: [true]
  });

  ngOnInit(): void {
    this.categoryService.getCategories(undefined, true).subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    const disp = this.availabilityFilter();

    this.productService
      .getProducts({
        categoria: this.categoryFilter(),
        disponible: disp === 'all' ? null : disp === 'true',
        search: this.searchTerm().trim() || null,
        incluirInactivos: true,
        page: this.page(),
        size: 10,
        sortBy: 'id',
        sortDir: 'desc'
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
    this.page.set(0);
    this.loadProducts();
  }

  onCategoryFilter(id: number | null): void {
    this.categoryFilter.set(id);
    this.page.set(0);
    this.loadProducts();
  }

  onAvailabilityFilter(val: 'all' | 'true' | 'false'): void {
    this.availabilityFilter.set(val);
    this.page.set(0);
    this.loadProducts();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.loadProducts();
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 15,
      stock: 10,
      imagenUrl: '',
      categoriaId: this.categories()[0]?.id ?? null,
      activo: true
    });
    this.modalOpen.set(true);
  }

  openEditModal(prod: Producto): void {
    this.editingProduct.set(prod);
    this.form.reset({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: Number(prod.precio),
      stock: prod.stock,
      imagenUrl: prod.imagenUrl,
      categoriaId: prod.categoriaId,
      activo: prod.activo
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.modalOpen.set(false);
  }

  closeModalOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  saveProduct(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      nombre: (raw.nombre ?? '').trim(),
      descripcion: (raw.descripcion ?? '').trim(),
      precio: Number(raw.precio),
      stock: Math.floor(Number(raw.stock)),
      imagenUrl: (raw.imagenUrl ?? '').trim(),
      categoriaId: Number(raw.categoriaId),
      activo: Boolean(raw.activo)
    };

    this.saving.set(true);
    const editing = this.editingProduct();
    const req$ = editing
      ? this.productService.updateProduct(editing.id, payload)
      : this.productService.createProduct(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        this.loadProducts();
      },
      error: (err: FriendlyHttpError) => {
        this.saving.set(false);
        this.toast.error(err.message);
      }
    });
  }

  askDeactivate(prod: Producto): void {
    this.productToDeactivate.set(prod);
  }

  confirmDeactivate(): void {
    const prod = this.productToDeactivate();
    if (!prod) return;
    this.deactivating.set(true);
    this.productService.deactivateProduct(prod.id).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.productToDeactivate.set(null);
        this.toast.success(`"${prod.nombre}" fue desactivado.`);
        this.loadProducts();
      },
      error: (err: FriendlyHttpError) => {
        this.deactivating.set(false);
        this.toast.error(err.message);
      }
    });
  }
}
