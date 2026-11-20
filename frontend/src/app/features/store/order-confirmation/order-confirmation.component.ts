import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Pedido } from '../../../core/models';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, DatePipe, AppIconComponent, PriceDisplayComponent, OrderStatusPipe],
  template: `
    <section class="container confirm-page">
      @if (order(); as ord) {
        <div class="confirm-card surface-card">
          <div class="confirm-card__badge">
            <app-icon name="check-circle" [size]="34" />
          </div>

          <span class="eyebrow">Pedido Registrado</span>
          <h1>¡Gracias por tu pedido, {{ ord.clienteNombre }}!</h1>
          <p class="confirm-card__lead">
            Hemos recibido tu solicitud en Café de Barrio. Conserva el siguiente código para cualquier consulta.
          </p>

          <div class="confirm-code">
            <span>Código de pedido</span>
            <strong>{{ ord.codigo }}</strong>
          </div>

          <div class="confirm-meta">
            <div>
              <span>Estado</span>
              <strong class="badge badge--warning">{{ ord.estado | orderStatus }}</strong>
            </div>
            <div>
              <span>Fecha</span>
              <strong>{{ ord.fecha | date: 'dd/MM/yyyy HH:mm' }}</strong>
            </div>
            <div>
              <span>Celular</span>
              <strong>{{ ord.celular }}</strong>
            </div>
            <div>
              <span>Dirección</span>
              <strong>{{ ord.direccion }}</strong>
            </div>
          </div>

          <div class="confirm-items">
            <h3>Detalle de productos</h3>
            @for (item of ord.detalles; track item.id) {
              <div class="confirm-item">
                <div>
                  <strong>{{ item.productoNombre }}</strong>
                  <span>{{ item.cantidad }} × S/ {{ (+item.precioUnitario).toFixed(2) }}</span>
                </div>
                <app-price-display [amount]="item.subtotal" size="sm" />
              </div>
            }
            <div class="confirm-total">
              <span>Total registrado</span>
              <app-price-display [amount]="ord.total" size="lg" />
            </div>
          </div>

          <div class="confirm-actions">
            <a routerLink="/tienda" class="btn btn--primary btn--lg">Seguir explorando el catálogo</a>
            <a routerLink="/" class="btn btn--secondary btn--lg">Volver al inicio</a>
          </div>
        </div>
      } @else {
        <div class="confirm-card surface-card">
          <h1>No hay un pedido reciente en pantalla</h1>
          <p class="confirm-card__lead">Explora nuestra tienda para realizar un nuevo pedido de café artesanal.</p>
          <a routerLink="/tienda" class="btn btn--primary btn--lg">Ir a la tienda</a>
        </div>
      }
    </section>
  `,
  styles: `
    .confirm-page {
      padding-block: var(--space-12);
      display: flex;
      justify-content: center;
    }

    .confirm-card {
      width: 100%;
      max-width: 680px;
      padding: var(--space-8);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-5);

      @media (min-width: 768px) { padding: var(--space-12); }

      &__badge {
        width: 68px; height: 68px; border-radius: 50%;
        background: var(--color-success-bg); color: var(--color-success);
        display: inline-flex; align-items: center; justify-content: center;
      }

      h1 { font-size: clamp(1.8rem, 3.2vw, 2.5rem); }
      &__lead { color: var(--color-text-secondary); max-width: 500px; }
    }

    .confirm-code {
      background: var(--color-cream);
      border: 1px dashed var(--color-border-strong);
      border-radius: var(--radius-md);
      padding: var(--space-4) var(--space-8);
      display: flex;
      flex-direction: column;
      gap: 4px;
      span { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); }
      strong { font-size: var(--text-2xl); letter-spacing: 0.08em; color: var(--color-espresso); font-family: monospace; }
    }

    .confirm-meta {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
      text-align: left;
      padding: var(--space-5);
      background: var(--color-cream);
      border-radius: var(--radius-md);
      @media (min-width: 576px) { grid-template-columns: repeat(2, 1fr); }
      div {
        display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
        span { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; }
        strong { font-size: var(--text-sm); color: var(--color-espresso); }
      }
    }

    .confirm-items {
      width: 100%;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      h3 { font-size: var(--text-xl); margin-bottom: var(--space-1); }
    }

    .confirm-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
      div {
        display: flex; flex-direction: column;
        strong { font-size: var(--text-sm); }
        span { font-size: var(--text-xs); color: var(--color-text-muted); }
      }
    }

    .confirm-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-top: var(--space-2);
      font-weight: 700;
    }

    .confirm-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }
  `
})
export class OrderConfirmationComponent implements OnInit {
  private readonly router = inject(Router);
  readonly order = signal<Pedido | null>(null);

  ngOnInit(): void {
    const navOrder = history.state?.order as Pedido | undefined;
    if (navOrder?.codigo) {
      this.order.set(navOrder);
      return;
    }

    const stored = sessionStorage.getItem('cafe_barrio_last_order');
    if (stored) {
      try {
        this.order.set(JSON.parse(stored) as Pedido);
      } catch {
        this.order.set(null);
      }
    }
  }
}
