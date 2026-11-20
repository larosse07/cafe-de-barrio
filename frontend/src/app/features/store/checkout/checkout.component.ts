import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomValidators } from '../../../core/validators/custom.validators';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormFieldComponent,
    PriceDisplayComponent,
    EmptyStateComponent,
    AppIconComponent,
    ImageFallbackDirective
  ],
  template: `
    <section class="container checkout-page">
      <div class="checkout-header">
        <a routerLink="/carrito" class="back-link">
          <app-icon name="arrow-left" [size]="16" />
          Volver al carrito
        </a>
        <h1>Finalizar pedido</h1>
        <p>Completa tus datos de entrega. Este pedido se registra directamente en nuestra tienda sin pasarela de pago.</p>
      </div>

      @if (cart.isEmpty()) {
        <app-empty-state
          icon="shopping-bag"
          title="No hay productos para confirmar"
          description="Agrega productos a tu carrito antes de realizar un pedido."
          actionLabel="Ir al catálogo"
          (action)="goToCatalog()"
        />
      } @else {
        <div class="checkout-grid">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="checkout-form surface-card" novalidate>
            <h2>Datos de entrega</h2>

            @if (submitError()) {
              <div class="checkout-alert" role="alert">
                <app-icon name="alert-circle" [size]="18" />
                <span>{{ submitError() }}</span>
              </div>
            }

            <app-form-field
              label="Nombre completo"
              forId="clienteNombre"
              [required]="true"
              [control]="form.controls.clienteNombre"
            >
              <input
                id="clienteNombre"
                type="text"
                class="input"
                [class.is-invalid]="isInvalid('clienteNombre')"
                formControlName="clienteNombre"
                placeholder="Ej. María Fernanda Salazar"
                autocomplete="name"
              />
            </app-form-field>

            <app-form-field
              label="Celular de contacto"
              forId="celular"
              [required]="true"
              [control]="form.controls.celular"
              hint="Te contactaremos para coordinar la entrega."
            >
              <input
                id="celular"
                type="tel"
                class="input"
                [class.is-invalid]="isInvalid('celular')"
                formControlName="celular"
                placeholder="Ej. 987 654 321"
                autocomplete="tel"
              />
            </app-form-field>

            <app-form-field
              label="Dirección de entrega"
              forId="direccion"
              [required]="true"
              [control]="form.controls.direccion"
            >
              <input
                id="direccion"
                type="text"
                class="input"
                [class.is-invalid]="isInvalid('direccion')"
                formControlName="direccion"
                placeholder="Ej. Av. Larco 450, Dpto. 302, Miraflores"
                autocomplete="street-address"
              />
            </app-form-field>

            <app-form-field
              label="Referencia de entrega (opcional)"
              forId="referencia"
              [control]="form.controls.referencia"
            >
              <input
                id="referencia"
                type="text"
                class="input"
                formControlName="referencia"
                placeholder="Ej. Frente al parque, edificio portón madera"
              />
            </app-form-field>

            <app-form-field
              label="Observaciones (opcional)"
              forId="observaciones"
              [control]="form.controls.observaciones"
            >
              <textarea
                id="observaciones"
                class="textarea"
                formControlName="observaciones"
                placeholder="Ej. Molido para prensa francesa, sin azúcar adicional..."
              ></textarea>
            </app-form-field>

            <button
              type="submit"
              class="btn btn--primary btn--lg btn--full"
              [disabled]="submitting()"
            >
              @if (submitting()) {
                <span>Registrando pedido...</span>
              } @else {
                <app-icon name="check-circle" [size]="18" />
                <span>Confirmar pedido</span>
              }
            </button>
          </form>

          <aside class="checkout-summary surface-card">
            <h2>Resumen del pedido</h2>

            <div class="summary-items">
              @for (item of cart.items(); track item.productoId) {
                <div class="summary-item">
                  <img [src]="item.imagenUrl" [alt]="item.nombre" appImageFallback />
                  <div class="summary-item__info">
                    <strong>{{ item.nombre }}</strong>
                    <span>{{ item.cantidad }} × S/ {{ item.precio.toFixed(2) }}</span>
                  </div>
                  <app-price-display [amount]="item.precio * item.cantidad" size="sm" />
                </div>
              }
            </div>

            <div class="summary-total">
              <span>Total a pagar (PEN)</span>
              <app-price-display [amount]="cart.totalAmount()" size="lg" />
            </div>

            <div class="summary-notice">
              <app-icon name="info" [size]="16" />
              <span>
                El monto final y el descuento de stock son calculados y validados de forma segura en nuestro servidor.
              </span>
            </div>
          </aside>
        </div>
      }
    </section>
  `,
  styles: `
    .checkout-page {
      padding-block: var(--space-8) var(--space-12);
    }

    .checkout-header {
      margin-bottom: var(--space-8);
      h1 { font-size: clamp(2rem, 3.5vw, 2.85rem); margin-block: var(--space-2); }
      p { color: var(--color-text-secondary); max-width: 620px; }
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-coffee);
      font-weight: 600;
      &:hover { color: var(--color-espresso); }
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      align-items: start;
      @media (min-width: 960px) {
        grid-template-columns: 1.3fr 0.9fr;
      }
    }

    .checkout-form {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      @media (min-width: 768px) { padding: var(--space-8); }
      h2 { font-size: var(--text-2xl); }
    }

    .checkout-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-sm);
      background: var(--color-danger-bg);
      color: var(--color-danger);
      font-size: var(--text-sm);
      border: 1px solid rgba(155, 59, 46, 0.25);
    }

    .checkout-summary {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-5));
      h2 { font-size: var(--text-2xl); }
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-height: 360px;
      overflow-y: auto;
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      img {
        width: 52px; height: 52px; border-radius: var(--radius-xs);
        object-fit: cover; flex-shrink: 0;
      }
      &__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        strong { font-size: var(--text-sm); color: var(--color-espresso); }
        span { font-size: var(--text-xs); color: var(--color-text-muted); }
      }
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 700;
    }

    .summary-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      padding: var(--space-3);
      border-radius: var(--radius-sm);
      background: var(--color-cream);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  `
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    clienteNombre: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(3), Validators.maxLength(150)]],
    celular: ['', [Validators.required, CustomValidators.peruPhone()]],
    direccion: ['', [Validators.required, CustomValidators.nonBlank(), Validators.minLength(6), Validators.maxLength(255)]],
    referencia: ['', [Validators.maxLength(255)]],
    observaciones: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    if (!this.cart.isEmpty()) {
      this.cart.revalidateStock().subscribe(res => {
        if (res.messages.length > 0) {
          res.messages.forEach(msg => this.toast.warning(msg, 'Inventario actualizado'));
        }
      });
    }
  }

  isInvalid(field: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  onSubmit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Por favor completa correctamente los campos obligatorios.');
      return;
    }

    if (this.cart.isEmpty()) {
      this.submitError.set('Tu carrito está vacío. Agrega productos antes de confirmar.');
      return;
    }

    this.submitting.set(true);

    const raw = this.form.getRawValue();
    const payload = {
      clienteNombre: raw.clienteNombre.trim(),
      celular: raw.celular.trim(),
      direccion: raw.direccion.trim(),
      referencia: raw.referencia.trim() || null,
      observaciones: raw.observaciones.trim() || null,
      items: this.cart.items().map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: createdOrder => {
        this.submitting.set(false);
        this.cart.clear();
        sessionStorage.setItem('cafe_barrio_last_order', JSON.stringify(createdOrder));
        this.toast.success(`Pedido ${createdOrder.codigo} registrado con éxito.`);
        this.router.navigate(['/pedido-confirmado'], { state: { order: createdOrder } });
      },
      error: (err: FriendlyHttpError) => {
        this.submitting.set(false);
        this.submitError.set(err.message);
        this.toast.error(err.message, 'No se pudo completar el pedido');
        if (err.status === 409) {
          // Si cambió el stock en el servidor, sincronizamos el carrito conservando los datos del formulario
          this.cart.revalidateStock().subscribe();
        }
      }
    });
  }

  goToCatalog(): void {
    this.router.navigate(['/tienda']);
  }
}
