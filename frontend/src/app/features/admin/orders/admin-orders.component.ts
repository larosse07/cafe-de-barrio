import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ORDER_ALLOWED_TRANSITIONS } from '../../../core/constants/app.constants';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { EstadoPedido, PageResponse, Pedido } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    SearchBarComponent,
    DataTableComponent,
    PaginationComponent,
    PriceDisplayComponent,
    ConfirmDialogComponent,
    ErrorStateComponent,
    LoadingSpinnerComponent,
    AppIconComponent,
    OrderStatusPipe
  ],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <div>
          <span class="eyebrow">Atención y Despacho</span>
          <h1>Gestión de pedidos</h1>
        </div>
        <button type="button" class="btn btn--secondary" (click)="loadOrders()">
          <app-icon name="refresh" [size]="15" />
          Actualizar
        </button>
      </div>

      <!-- FILTROS -->
      <div class="toolbar surface-card">
        <div class="toolbar__search">
          <app-search-bar
            placeholder="Buscar por código, cliente o celular..."
            [value]="searchTerm()"
            (searchChange)="onSearch($event)"
          />
        </div>

        <select
          class="select toolbar__select"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilter($event)"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <input
          type="date"
          class="input toolbar__date"
          [ngModel]="fechaDesde()"
          (ngModelChange)="onDateDesde($event)"
          aria-label="Fecha desde"
        />

        <input
          type="date"
          class="input toolbar__date"
          [ngModel]="fechaHasta()"
          (ngModelChange)="onDateHasta($event)"
          aria-label="Fecha hasta"
        />

        @if (statusFilter() || fechaDesde() || fechaHasta() || searchTerm()) {
          <button type="button" class="btn btn--ghost btn--sm" (click)="clearFilters()">
            Limpiar
          </button>
        }
      </div>

      @if (error()) {
        <app-error-state [message]="error()!" (retry)="loadOrders()" />
      } @else {
        <app-data-table
          [columns]="['Código', 'Cliente', 'Celular', 'Dirección', 'Fecha', 'Productos', 'Total', 'Estado', 'Acciones']"
          [loading]="loading()"
          [empty]="!loading() && (pageData()?.content?.length ?? 0) === 0"
          emptyTitle="No hay pedidos"
          emptyDescription="Cuando los clientes confirmen pedidos desde la tienda aparecerán aquí."
        >
          @for (order of pageData()?.content ?? []; track order.id) {
            <tr>
              <td><code class="order-code">{{ order.codigo }}</code></td>
              <td><strong>{{ order.clienteNombre }}</strong></td>
              <td>{{ order.celular }}</td>
              <td class="addr-col">{{ order.direccion }}</td>
              <td class="nowrap">{{ order.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ order.detalles.length }} ítem(s)</td>
              <td><app-price-display [amount]="order.total" size="sm" /></td>
              <td>
                <span class="badge" [class]="badgeClass(order.estado)">
                  {{ order.estado | orderStatus }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn btn--secondary btn--sm" (click)="openDetail(order.id)">
                    <app-icon name="eye" [size]="14" />
                    Detalle
                  </button>
                  @for (next of allowedNext(order.estado); track next) {
                    <button
                      type="button"
                      class="btn btn--sm"
                      [class.btn--primary]="next !== 'CANCELADO'"
                      [class.btn--ghost]="next === 'CANCELADO'"
                      [class.row-actions__danger]="next === 'CANCELADO'"
                      [disabled]="updatingId() === order.id"
                      (click)="requestStatusChange(order, next)"
                    >
                      {{ actionLabel(next) }}
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

    <!-- MODAL DETALLE DEL PEDIDO -->
    @if (detailModalOpen()) {
      <div class="modal-backdrop" (click)="closeDetailBackdrop($event)">
        <div class="modal-panel modal-panel--lg" role="dialog" aria-modal="true">
          <div class="modal-panel__header">
            <h3>Detalle del pedido {{ selectedOrder()?.codigo }}</h3>
            <button type="button" class="btn btn--ghost btn--icon" (click)="detailModalOpen.set(false)" aria-label="Cerrar">
              <app-icon name="x" [size]="18" />
            </button>
          </div>

          <div class="modal-panel__body">
            @if (detailLoading()) {
              <app-loading-spinner label="Cargando detalle e historial..." />
            } @else if (selectedOrder(); as ord) {
              <div class="order-detail">
                <div class="order-detail__info">
                  <div><span>Cliente</span><strong>{{ ord.clienteNombre }}</strong></div>
                  <div><span>Celular</span><strong>{{ ord.celular }}</strong></div>
                  <div><span>Fecha</span><strong>{{ ord.fecha | date: 'dd/MM/yyyy HH:mm' }}</strong></div>
                  <div>
                    <span>Estado actual</span>
                    <span class="badge" [class]="badgeClass(ord.estado)">{{ ord.estado | orderStatus }}</span>
                  </div>
                  <div class="span-2"><span>Dirección</span><strong>{{ ord.direccion }}</strong></div>
                  @if (ord.referencia) {
                    <div class="span-2"><span>Referencia</span><strong>{{ ord.referencia }}</strong></div>
                  }
                  @if (ord.observaciones) {
                    <div class="span-2"><span>Observaciones</span><strong>{{ ord.observaciones }}</strong></div>
                  }
                </div>

                <div class="order-detail__block">
                  <h4>Productos (precios históricos registrados)</h4>
                  @for (item of ord.detalles; track item.id) {
                    <div class="detail-item">
                      <div>
                        <strong>{{ item.productoNombre }}</strong>
                        <span>{{ item.cantidad }} × S/ {{ (+item.precioUnitario).toFixed(2) }}</span>
                      </div>
                      <app-price-display [amount]="item.subtotal" size="sm" />
                    </div>
                  }
                  <div class="detail-total">
                    <span>Total del pedido</span>
                    <app-price-display [amount]="ord.total" size="lg" />
                  </div>
                </div>

                @if (ord.historialEstados.length > 0) {
                  <div class="order-detail__block">
                    <h4>Historial de estados</h4>
                    <ul class="timeline">
                      @for (h of ord.historialEstados; track h.id) {
                        <li>
                          <span class="timeline__dot"></span>
                          <div>
                            <strong>
                              @if (h.estadoAnterior) {
                                {{ h.estadoAnterior | orderStatus }} → {{ h.estadoNuevo | orderStatus }}
                              } @else {
                                Registrado como {{ h.estadoNuevo | orderStatus }}
                              }
                            </strong>
                            <span>{{ h.fechaCambio | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
                          </div>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>

          @if (selectedOrder(); as ord) {
            <div class="modal-panel__footer">
              @for (next of allowedNext(ord.estado); track next) {
                <button
                  type="button"
                  class="btn btn--sm"
                  [class.btn--primary]="next !== 'CANCELADO'"
                  [class.btn--danger]="next === 'CANCELADO'"
                  [disabled]="updatingId() === ord.id"
                  (click)="requestStatusChange(ord, next)"
                >
                  {{ actionLabel(next) }}
                </button>
              }
              <button type="button" class="btn btn--secondary btn--sm" (click)="detailModalOpen.set(false)">
                Cerrar
              </button>
            </div>
          }
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="!!pendingCancelOrder()"
      title="Cancelar pedido y devolver stock"
      [message]="'¿Confirmas cancelar el pedido ' + (pendingCancelOrder()?.codigo ?? '') + '? El inventario de todos los productos incluidos se restaurará automáticamente una sola vez.'"
      confirmLabel="Sí, cancelar pedido"
      [danger]="true"
      [loading]="!!updatingId()"
      (confirm)="confirmCancel()"
      (cancel)="pendingCancelOrder.set(null)"
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
      &__select { width: auto; min-width: 170px; }
      &__date { width: auto; min-width: 150px; }
    }
    .order-code {
      font-family: monospace; font-weight: 700; font-size: var(--text-xs);
      background: var(--color-cream); padding: 3px 7px; border-radius: 4px;
    }
    .addr-col { max-width: 210px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nowrap { white-space: nowrap; }
    .row-actions {
      display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;
      &__danger { color: var(--color-danger); }
    }
    .order-detail { display: flex; flex-direction: column; gap: var(--space-6); }
    .order-detail__info {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-4); background: var(--color-cream); padding: var(--space-4); border-radius: var(--radius-md);
      div { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
      span { font-size: var(--text-xs); text-transform: uppercase; color: var(--color-text-muted); }
      strong { font-size: var(--text-sm); color: var(--color-espresso); }
      .span-2 { grid-column: 1 / -1; }
    }
    .order-detail__block {
      display: flex; flex-direction: column; gap: var(--space-3);
      h4 { font-size: var(--text-xl); }
    }
    .detail-item {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border);
      div { display: flex; flex-direction: column; }
      strong { font-size: var(--text-sm); }
      span { font-size: var(--text-xs); color: var(--color-text-muted); }
    }
    .detail-total { display: flex; justify-content: space-between; align-items: baseline; font-weight: 700; padding-top: var(--space-2); }
    .timeline {
      display: flex; flex-direction: column; gap: var(--space-3);
      li { display: flex; align-items: flex-start; gap: var(--space-3); }
      &__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-olive); margin-top: 6px; flex-shrink: 0; }
      div { display: flex; flex-direction: column; }
      strong { font-size: var(--text-sm); color: var(--color-espresso); }
      span { font-size: var(--text-xs); color: var(--color-text-muted); }
    }
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly pageData = signal<PageResponse<Pedido> | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<EstadoPedido | ''>('');
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly page = signal(0);

  readonly detailModalOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly selectedOrder = signal<Pedido | null>(null);

  readonly updatingId = signal<number | null>(null);
  readonly pendingCancelOrder = signal<Pedido | null>(null);

  ngOnInit(): void {
    const estadoParam = this.route.snapshot.queryParamMap.get('estado') as EstadoPedido | null;
    if (estadoParam) {
      this.statusFilter.set(estadoParam);
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .getOrders({
        estado: this.statusFilter() || null,
        fechaDesde: this.fechaDesde() || null,
        fechaHasta: this.fechaHasta() || null,
        search: this.searchTerm().trim() || null,
        page: this.page(),
        size: 10
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
    this.loadOrders();
  }

  onStatusFilter(status: EstadoPedido | ''): void {
    this.statusFilter.set(status);
    this.page.set(0);
    this.loadOrders();
  }

  onDateDesde(date: string): void {
    this.fechaDesde.set(date);
    this.page.set(0);
    this.loadOrders();
  }

  onDateHasta(date: string): void {
    this.fechaHasta.set(date);
    this.page.set(0);
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.page.set(0);
    this.loadOrders();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.loadOrders();
  }

  openDetail(id: number): void {
    this.detailModalOpen.set(true);
    this.detailLoading.set(true);
    this.selectedOrder.set(null);

    this.orderService.getOrderById(id).subscribe({
      next: order => {
        this.selectedOrder.set(order);
        this.detailLoading.set(false);
      },
      error: (err: FriendlyHttpError) => {
        this.detailLoading.set(false);
        this.detailModalOpen.set(false);
        this.toast.error(err.message);
      }
    });
  }

  closeDetailBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.detailModalOpen.set(false);
    }
  }

  allowedNext(estado: EstadoPedido): EstadoPedido[] {
    return (ORDER_ALLOWED_TRANSITIONS[estado] ?? []) as EstadoPedido[];
  }

  actionLabel(next: EstadoPedido): string {
    switch (next) {
      case 'EN_PREPARACION':
        return 'Preparar';
      case 'ENTREGADO':
        return 'Marcar entregado';
      case 'CANCELADO':
        return 'Cancelar';
      default:
        return next;
    }
  }

  badgeClass(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge--warning';
      case 'EN_PREPARACION':
        return 'badge--info';
      case 'ENTREGADO':
        return 'badge--success';
      case 'CANCELADO':
        return 'badge--danger';
    }
  }

  requestStatusChange(order: Pedido, next: EstadoPedido): void {
    if (next === 'CANCELADO') {
      this.pendingCancelOrder.set(order);
      return;
    }
    this.executeStatusChange(order.id, next);
  }

  confirmCancel(): void {
    const ord = this.pendingCancelOrder();
    if (!ord) return;
    this.executeStatusChange(ord.id, 'CANCELADO');
  }

  private executeStatusChange(id: number, next: EstadoPedido): void {
    this.updatingId.set(id);
    this.orderService.updateOrderStatus(id, next).subscribe({
      next: updated => {
        this.updatingId.set(null);
        this.pendingCancelOrder.set(null);
        if (this.selectedOrder()?.id === updated.id) {
          this.selectedOrder.set(updated);
        }
        this.toast.success(`Pedido ${updated.codigo} actualizado a ${updated.estado.replace('_', ' ')}.`);
        this.loadOrders();
      },
      error: (err: FriendlyHttpError) => {
        this.updatingId.set(null);
        this.pendingCancelOrder.set(null);
        this.toast.error(err.message);
      }
    });
  }
}
