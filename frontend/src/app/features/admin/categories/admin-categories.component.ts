import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { Categoria } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomValidators } from '../../../core/validators/custom.validators';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SearchBarComponent,
    DataTableComponent,
    FormFieldComponent,
    ConfirmDialogComponent,
    ErrorStateComponent,
    AppIconComponent
  ],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <div>
          <span class="eyebrow">Organización del Catálogo</span>
          <h1>Gestión de categorías</h1>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" [size]="16" />
          Nueva categoría
        </button>
      </div>

      <div class="toolbar surface-card">
        <app-search-bar
          placeholder="Buscar categoría por nombre o descripción..."
          [value]="searchTerm()"
          (searchChange)="onSearch($event)"
        />
      </div>

      @if (error()) {
        <app-error-state [message]="error()!" (retry)="loadCategories()" />
      } @else {
        <app-data-table
          [columns]="['Nombre', 'Descripción', 'Productos', 'Estado', 'Acciones']"
          [loading]="loading()"
          [empty]="!loading() && categories().length === 0"
          emptyTitle="Sin categorías"
          emptyDescription="Crea la primera categoría para organizar tus productos."
        >
          @for (cat of categories(); track cat.id) {
            <tr>
              <td><strong>{{ cat.nombre }}</strong></td>
              <td class="desc-col">{{ cat.descripcion }}</td>
              <td><span class="badge badge--neutral">{{ cat.cantidadProductos }}</span></td>
              <td>
                <span class="badge" [class.badge--success]="cat.activo" [class.badge--neutral]="!cat.activo">
                  {{ cat.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn btn--secondary btn--sm" (click)="openEditModal(cat)">
                    <app-icon name="edit" [size]="14" />
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn--ghost btn--sm row-actions__danger"
                    [disabled]="cat.cantidadProductos > 0"
                    [title]="cat.cantidadProductos > 0 ? 'Tiene productos asociados' : 'Eliminar categoría'"
                    (click)="askDelete(cat)"
                  >
                    <app-icon name="trash" [size]="14" />
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          }
        </app-data-table>
      }
    </div>

    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeOnBackdrop($event)">
        <div class="modal-panel" role="dialog" aria-modal="true">
          <div class="modal-panel__header">
            <h3>{{ editingCategory() ? 'Editar categoría' : 'Nueva categoría' }}</h3>
            <button type="button" class="btn btn--ghost btn--icon" (click)="closeModal()" aria-label="Cerrar">
              <app-icon name="x" [size]="18" />
            </button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="modal-panel__body form-stack">
              <app-form-field label="Nombre" forId="c-nombre" [required]="true" [control]="form.controls.nombre">
                <input id="c-nombre" type="text" class="input" formControlName="nombre" placeholder="Ej. Café de Especialidad" />
              </app-form-field>

              <app-form-field label="Descripción" forId="c-desc" [required]="true" [control]="form.controls.descripcion">
                <textarea id="c-desc" class="textarea" formControlName="descripcion" placeholder="Describe qué productos agrupa esta categoría..."></textarea>
              </app-form-field>

              <div class="checkbox-row">
                <input id="c-activo" type="checkbox" formControlName="activo" />
                <label for="c-activo">Categoría activa en la tienda</label>
              </div>
            </div>
            <div class="modal-panel__footer">
              <button type="button" class="btn btn--secondary" [disabled]="saving()" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn--primary" [disabled]="saving()">
                {{ saving() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="!!categoryToDelete()"
      title="Eliminar categoría"
      [message]="'¿Seguro que deseas eliminar la categoría &quot;' + (categoryToDelete()?.nombre ?? '') + '&quot;? Esta acción no se puede deshacer.'"
      confirmLabel="Eliminar"
      [danger]="true"
      [loading]="deleting()"
      (confirm)="confirmDelete()"
      (cancel)="categoryToDelete.set(null)"
    />
  `,
  styles: `
    .admin-section { display: flex; flex-direction: column; gap: var(--space-5); }
    .section-top {
      display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-4);
      h1 { font-size: clamp(1.75rem, 3vw, 2.3rem); margin-top: 2px; }
    }
    .toolbar { padding: var(--space-4); }
    .desc-col { max-width: 380px; color: var(--color-text-secondary); }
    .row-actions {
      display: flex; gap: var(--space-2); align-items: center;
      &__danger { color: var(--color-danger); }
    }
    .form-stack { display: flex; flex-direction: column; gap: var(--space-4); }
    .checkbox-row {
      display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm);
      input { width: 18px; height: 18px; accent-color: var(--color-espresso); }
    }
  `
})
export class AdminCategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly modalOpen = signal(false);
  readonly editingCategory = signal<Categoria | null>(null);
  readonly saving = signal(false);

  readonly categoryToDelete = signal<Categoria | null>(null);
  readonly deleting = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(2), Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(5), Validators.maxLength(300)]],
    activo: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryService.getCategories(this.searchTerm().trim() || undefined, true).subscribe({
      next: data => {
        this.categories.set(data);
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
    this.loadCategories();
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.form.reset({ nombre: '', descripcion: '', activo: true });
    this.modalOpen.set(true);
  }

  openEditModal(cat: Categoria): void {
    this.editingCategory.set(cat);
    this.form.reset({ nombre: cat.nombre, descripcion: cat.descripcion, activo: cat.activo });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.modalOpen.set(false);
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.saving.set(true);
    const editing = this.editingCategory();
    const req$ = editing
      ? this.categoryService.updateCategory(editing.id, payload)
      : this.categoryService.createCategory(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Categoría actualizada.' : 'Categoría creada.');
        this.loadCategories();
      },
      error: (err: FriendlyHttpError) => {
        this.saving.set(false);
        this.toast.error(err.message);
      }
    });
  }

  askDelete(cat: Categoria): void {
    this.categoryToDelete.set(cat);
  }

  confirmDelete(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;
    this.deleting.set(true);
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.categoryToDelete.set(null);
        this.toast.success('Categoría eliminada correctamente.');
        this.loadCategories();
      },
      error: (err: FriendlyHttpError) => {
        this.deleting.set(false);
        this.toast.error(err.message);
      }
    });
  }
}
