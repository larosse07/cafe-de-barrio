import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Categoria, CategoriaRequest } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  getCategories(search?: string, incluirInactivos = false): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/categorias', {
      search,
      incluirInactivos: incluirInactivos ? true : undefined
    });
  }

  getCategoryById(id: number): Observable<Categoria> {
    return this.api.get<Categoria>(`/categorias/${id}`);
  }

  createCategory(payload: CategoriaRequest): Observable<Categoria> {
    return this.api.post<Categoria>('/categorias', payload);
  }

  updateCategory(id: number, payload: CategoriaRequest): Observable<Categoria> {
    return this.api.put<Categoria>(`/categorias/${id}`, payload);
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/categorias/${id}`);
  }
}
