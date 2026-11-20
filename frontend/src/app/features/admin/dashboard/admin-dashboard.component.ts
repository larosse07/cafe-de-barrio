import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { DashboardResumen, PedidosEstadistica, VentasPeriodo } from '../../../core/models';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';
import { PenCurrencyPipe } from '../../../shared/pipes/pen-currency.pipe';

type Periodo = '7d' | '30d' | '90d' | 'all';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    AppIconComponent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    PenCurrencyPipe,
    OrderStatusPipe
  ],
  template: `
    <div class="dashboard">
      <div class="dash-head">
        <div>
          <span class="eyebrow">Resumen Operativo</span>
          <h1>Dashboard de Café de Barrio</h1>
          <p>Métricas reales en tiempo real sincronizadas con MySQL.</p>
        </div>

        <div class="period-tabs" role="tablist" aria-label="Filtrar periodo">
          @for (p of periodos; track p.value) {
            <button
              type="button"
              class="period-tab"
              [class.is-active]="periodo() === p.value"
              (click)="selectPeriodo(p.value)"
            >
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-skeleton-loader variant="block" [count]="3" [height]="120" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="loadAll()" />
      } @else if (resumen(); as r) {
        <!-- KPI CARDS -->
        <div class="kpi-grid">
          <div class="kpi-card surface-card">
            <div class="kpi-card__head">
              <span>Ventas registradas</span>
              <span class="kpi-icon kpi-icon--olive"><app-icon name="trending-up" [size]="18" /></span>
            </div>
            <strong class="kpi-card__val">{{ r.ventasRegistradas | penCurrency }}</strong>
            <span class="kpi-card__sub">Excluye pedidos cancelados</span>
          </div>

          <div class="kpi-card surface-card">
            <div class="kpi-card__head">
              <span>Total de pedidos</span>
              <span class="kpi-icon"><app-icon name="clipboard-list" [size]="18" /></span>
            </div>
            <strong class="kpi-card__val">{{ r.totalPedidos }}</strong>
            <span class="kpi-card__sub">
              {{ r.pedidosPendientes }} pendientes · {{ r.pedidosEnPreparacion }} en preparación
            </span>
          </div>

          <div class="kpi-card surface-card">
            <div class="kpi-card__head">
              <span>Pedidos entregados</span>
              <span class="kpi-icon kpi-icon--success"><app-icon name="check-circle" [size]="18" /></span>
            </div>
            <strong class="kpi-card__val">{{ r.pedidosEntregados }}</strong>
            <span class="kpi-card__sub">{{ r.pedidosCancelados }} cancelados</span>
          </div>

          <div class="kpi-card surface-card">
            <div class="kpi-card__head">
              <span>Catálogo e inventario</span>
              <span class="kpi-icon kpi-icon--warn"><app-icon name="package" [size]="18" /></span>
            </div>
            <strong class="kpi-card__val">{{ r.productosActivos }} / {{ r.totalProductos }}</strong>
            <span class="kpi-card__sub">
              Activos · <strong>{{ r.stockBajo }}</strong> con stock bajo (≤ 10)
            </span>
          </div>
        </div>

        <!-- STATUS STRIP -->
        <div class="mini-stats">
          <a routerLink="/admin/pedidos" [queryParams]="{ estado: 'PENDIENTE' }" class="mini-stat surface-card">
            <span>Pendientes</span>
            <strong class="badge badge--warning">{{ r.pedidosPendientes }}</strong>
          </a>
          <a routerLink="/admin/pedidos" [queryParams]="{ estado: 'EN_PREPARACION' }" class="mini-stat surface-card">
            <span>En preparación</span>
            <strong class="badge badge--info">{{ r.pedidosEnPreparacion }}</strong>
          </a>
          <a routerLink="/admin/pedidos" [queryParams]="{ estado: 'ENTREGADO' }" class="mini-stat surface-card">
            <span>Entregados</span>
            <strong class="badge badge--success">{{ r.pedidosEntregados }}</strong>
          </a>
          <a routerLink="/admin/productos" class="mini-stat surface-card">
            <span>Stock bajo</span>
            <strong class="badge badge--danger">{{ r.stockBajo }}</strong>
          </a>
        </div>

        <!-- CHARTS GRID -->
        <div class="charts-grid">
          <!-- GRÁFICO DE VENTAS -->
          <div class="chart-card surface-card">
            <div class="chart-card__head">
              <div>
                <h3>Evolución de ventas ({{ periodoLabel() }})</h3>
                @if (ventas(); as v) {
                  <p>
                    Total periodo: <strong>{{ v.totalVentas | penCurrency }}</strong> ·
                    Ticket promedio: <strong>{{ v.ticketPromedio | penCurrency }}</strong>
                  </p>
                }
              </div>
            </div>

            @if (salesBars().length === 0) {
              <div class="chart-empty">Aún no se registran ventas en este periodo.</div>
            } @else {
              <div class="bar-chart" role="img" aria-label="Gráfico de ventas por fecha">
                @for (bar of salesBars(); track bar.fecha) {
                  <div class="bar-col" [title]="bar.fecha + ': S/ ' + bar.monto.toFixed(2) + ' (' + bar.pedidos + ' pedidos)'">
                    <div class="bar-track">
                      <div class="bar-fill" [style.height.%]="bar.percent"></div>
                    </div>
                    <span class="bar-label">{{ bar.shortLabel }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- GRÁFICO DE PEDIDOS POR ESTADO -->
          <div class="chart-card surface-card">
            <div class="chart-card__head">
              <div>
                <h3>Distribución de pedidos ({{ periodoLabel() }})</h3>
                @if (pedidosStats(); as ps) {
                  <p>Total en periodo: <strong>{{ ps.totalPedidos }}</strong> pedidos</p>
                }
              </div>
            </div>

            @if (statusRows().length === 0) {
              <div class="chart-empty">No hay pedidos registrados en este periodo.</div>
            } @else {
              <div class="status-bars">
                @for (row of statusRows(); track row.estado) {
                  <div class="status-row">
                    <div class="status-row__top">
                      <span>{{ row.estado | orderStatus }}</span>
                      <strong>{{ row.cantidad }} ({{ row.percent }}%)</strong>
                    </div>
                    <div class="status-track">
                      <div
                        class="status-fill"
                        [class]="'status-fill status-fill--' + row.estado.toLowerCase()"
                        [style.width.%]="row.percent"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .dash-head {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      @media (min-width: 768px) {
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
      }
      h1 { font-size: clamp(1.75rem, 3vw, 2.4rem); margin-top: 2px; }
      p { color: var(--color-text-secondary); font-size: var(--text-sm); }
    }

    .period-tabs {
      display: inline-flex;
      background: var(--color-warm-white);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      padding: 3px;
      gap: 3px;
      align-self: flex-start;
    }

    .period-tab {
      border: none;
      background: transparent;
      padding: 0.42rem 0.85rem;
      border-radius: 6px;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
      &.is-active {
        background: var(--color-espresso);
        color: var(--color-warm-white);
      }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
      @media (min-width: 600px) { grid-template-columns: repeat(2, 1fr); }
      @media (min-width: 1200px) { grid-template-columns: repeat(4, 1fr); }
    }

    .kpi-card {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: var(--text-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted);
      }
      &__val {
        font-family: var(--font-display);
        font-size: 2.15rem;
        line-height: 1.1;
        color: var(--color-espresso);
      }
      &__sub { font-size: var(--text-xs); color: var(--color-text-secondary); }
    }

    .kpi-icon {
      width: 34px; height: 34px; border-radius: var(--radius-sm);
      background: var(--color-cream); color: var(--color-coffee);
      display: inline-flex; align-items: center; justify-content: center;
      &--olive { background: var(--color-olive-soft); color: var(--color-olive-dark); }
      &--success { background: var(--color-success-bg); color: var(--color-success); }
      &--warn { background: var(--color-warning-bg); color: var(--color-warning); }
    }

    .mini-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
      @media (min-width: 768px) { grid-template-columns: repeat(4, 1fr); }
    }

    .mini-stat {
      padding: var(--space-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: border-color var(--transition-fast);
      &:hover { border-color: var(--color-coffee); }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5);
      @media (min-width: 1024px) { grid-template-columns: 1.35fr 0.85fr; }
    }

    .chart-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      &__head {
        h3 { font-size: var(--text-xl); }
        p { font-size: var(--text-xs); color: var(--color-text-secondary); margin-top: 4px; }
      }
    }

    .chart-empty {
      padding: var(--space-10) var(--space-4);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      background: var(--color-cream);
      border-radius: var(--radius-sm);
    }

    .bar-chart {
      height: 220px;
      display: flex;
      align-items: flex-end;
      gap: 6px;
      padding-top: var(--space-3);
      overflow-x: auto;
    }

    .bar-col {
      flex: 1;
      min-width: 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .bar-track {
      flex: 1;
      width: 100%;
      max-width: 34px;
      background: var(--color-cream);
      border-radius: 6px 6px 2px 2px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }

    .bar-fill {
      width: 100%;
      min-height: 3px;
      background: linear-gradient(180deg, var(--color-olive) 0%, var(--color-espresso) 100%);
      border-radius: 6px 6px 0 0;
      transition: height var(--transition-base);
    }

    .bar-label {
      font-size: 0.68rem;
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    .status-bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .status-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      &__top {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-sm);
        span { color: var(--color-text-secondary); }
        strong { color: var(--color-espresso); font-size: var(--text-xs); }
      }
    }

    .status-track {
      height: 10px;
      background: var(--color-cream);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .status-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width var(--transition-base);
      &--pendiente { background: var(--color-warning); }
      &--en_preparacion { background: var(--color-info); }
      &--entregado { background: var(--color-success); }
      &--cancelado { background: var(--color-danger); }
    }
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly periodos: { value: Periodo; label: string }[] = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: 'all', label: 'Todo' }
  ];

  readonly periodo = signal<Periodo>('7d');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly resumen = signal<DashboardResumen | null>(null);
  readonly ventas = signal<VentasPeriodo | null>(null);
  readonly pedidosStats = signal<PedidosEstadistica | null>(null);

  readonly periodoLabel = computed(
    () => this.periodos.find(p => p.value === this.periodo())?.label ?? '30 días'
  );

  readonly salesBars = computed(() => {
    const serie = this.ventas()?.serie ?? [];
    if (serie.length === 0) return [];
    const sliced = serie.slice(-14);
    const maxVal = Math.max(...sliced.map(s => Number(s.monto)), 1);
    return sliced.map(s => ({
      fecha: s.fecha,
      monto: Number(s.monto),
      pedidos: s.pedidos,
      shortLabel: s.fecha.slice(5),
      percent: Number(s.monto) > 0 ? Math.max(8, Math.round((Number(s.monto) / maxVal) * 100)) : 2
    }));
  });

  readonly statusRows = computed(() => {
    const stats = this.pedidosStats();
    if (!stats) return [];
    const total = Math.max(stats.totalPedidos, 1);
    return stats.porEstado.map(item => ({
      estado: item.estado,
      cantidad: item.cantidad,
      percent: stats.totalPedidos > 0 ? Math.round((item.cantidad / total) * 100) : 0
    }));
  });

  ngOnInit(): void {
    this.loadAll();
  }

  selectPeriodo(p: Periodo): void {
    this.periodo.set(p);
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    const p = this.periodo();

    forkJoin({
      resumen: this.dashboardService.getSummary(),
      ventas: this.dashboardService.getSales(p),
      pedidos: this.dashboardService.getOrdersStats(p)
    }).subscribe({
      next: ({ resumen, ventas, pedidos }) => {
        this.resumen.set(resumen);
        this.ventas.set(ventas);
        this.pedidosStats.set(pedidos);
        this.loading.set(false);
      },
      error: (err: FriendlyHttpError) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
