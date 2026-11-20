import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResumen, PedidosEstadistica, VentasPeriodo } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardResumen> {
    return this.api.get<DashboardResumen>('/dashboard/resumen');
  }

  getSales(periodo: '7d' | '30d' | '90d' | 'all' = '30d'): Observable<VentasPeriodo> {
    return this.api.get<VentasPeriodo>('/dashboard/ventas', { periodo });
  }

  getOrdersStats(periodo: '7d' | '30d' | '90d' | 'all' = '30d'): Observable<PedidosEstadistica> {
    return this.api.get<PedidosEstadistica>('/dashboard/pedidos', { periodo });
  }
}
