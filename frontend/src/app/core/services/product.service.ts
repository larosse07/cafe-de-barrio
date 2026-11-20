import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PageResponse, Producto, ProductoQuery, ProductoRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(query: ProductoQuery = {}): Observable<PageResponse<Producto>> {
    return this.api.get<PageResponse<Producto>>('/productos', {
      categoria: query.categoria,
      disponible: query.disponible,
      search: query.search,
      incluirInactivos: query.incluirInactivos ? true : undefined,
      page: query.page ?? 0,
      size: query.size ?? 12,
      sortBy: query.sortBy ?? 'fechaCreacion',
      sortDir: query.sortDir ?? 'desc'
    });
  }

  getProductById(id: number): Observable<Producto> {
    return this.api.get<Producto>(`/productos/${id}`);
  }

  createProduct(payload: ProductoRequest): Observable<Producto> {
    return this.api.post<Producto>('/productos', payload);
  }

  updateProduct(id: number, payload: ProductoRequest): Observable<Producto> {
    return this.api.put<Producto>(`/productos/${id}`, payload);
  }

  deactivateProduct(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/productos/${id}`);
  }
}
