import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearPedidoRequest, EstadoPedido, PageResponse, Pedido, PedidoQuery } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  createOrder(payload: CrearPedidoRequest): Observable<Pedido> {
    return this.api.post<Pedido>('/pedidos', payload);
  }

  getOrders(query: PedidoQuery = {}): Observable<PageResponse<Pedido>> {
    return this.api.get<PageResponse<Pedido>>('/pedidos', {
      estado: query.estado || undefined,
      fechaDesde: query.fechaDesde || undefined,
      fechaHasta: query.fechaHasta || undefined,
      search: query.search || undefined,
      page: query.page ?? 0,
      size: query.size ?? 10
    });
  }

  getOrderById(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`/pedidos/${id}`);
  }

  updateOrderStatus(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  }
}
