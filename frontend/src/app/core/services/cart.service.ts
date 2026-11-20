import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
import { CartItem, Producto } from '../models';
import { ProductService } from './product.service';
import { ToastService } from './toast.service';

export interface StockValidationResult {
  valid: boolean;
  messages: string[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly totalItems = computed(() => this._items().reduce((acc, item) => acc + item.cantidad, 0));
  readonly totalAmount = computed(() =>
    this._items().reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0)
  );
  readonly isEmpty = computed(() => this._items().length === 0);

  addItem(product: Producto, quantity = 1): boolean {
    if (!product.activo || product.stock <= 0) {
      this.toast.warning(`"${product.nombre}" no cuenta con stock disponible en este momento.`);
      return false;
    }

    const safeQty = Math.max(1, Math.floor(quantity));
    const current = this._items();
    const existing = current.find(i => i.productoId === product.id);
    const desiredQty = (existing?.cantidad ?? 0) + safeQty;

    if (desiredQty > product.stock) {
      this.toast.warning(
        `Solo quedan ${product.stock} unidad(es) disponibles de "${product.nombre}".`
      );
      return false;
    }

    if (existing) {
      this._items.set(
        current.map(item =>
          item.productoId === product.id
            ? {
                ...item,
                precio: Number(product.precio),
                stockDisponible: product.stock,
                cantidad: desiredQty
              }
            : item
        )
      );
    } else {
      this._items.set([
        ...current,
        {
          productoId: product.id,
          nombre: product.nombre,
          precio: Number(product.precio),
          imagenUrl: product.imagenUrl,
          categoriaNombre: product.categoriaNombre,
          stockDisponible: product.stock,
          cantidad: safeQty
        }
      ]);
    }

    this.saveToStorage();
    this.toast.success(`Se agregó "${product.nombre}" al carrito.`);
    return true;
  }

  updateQuantity(productoId: number, newQuantity: number): void {
    const item = this._items().find(i => i.productoId === productoId);
    if (!item) return;

    if (newQuantity <= 0) {
      this.removeItem(productoId);
      return;
    }

    if (newQuantity > item.stockDisponible) {
      this.toast.warning(`Stock máximo disponible para "${item.nombre}": ${item.stockDisponible}.`);
      this._items.update(list =>
        list.map(i => (i.productoId === productoId ? { ...i, cantidad: item.stockDisponible } : i))
      );
    } else {
      this._items.update(list =>
        list.map(i => (i.productoId === productoId ? { ...i, cantidad: Math.floor(newQuantity) } : i))
      );
    }
    this.saveToStorage();
  }

  increment(productoId: number): void {
    const item = this._items().find(i => i.productoId === productoId);
    if (item) {
      this.updateQuantity(productoId, item.cantidad + 1);
    }
  }

  decrement(productoId: number): void {
    const item = this._items().find(i => i.productoId === productoId);
    if (item) {
      this.updateQuantity(productoId, item.cantidad - 1);
    }
  }

  removeItem(productoId: number): void {
    this._items.update(list => list.filter(i => i.productoId !== productoId));
    this.saveToStorage();
  }

  clear(): void {
    this._items.set([]);
    this.saveToStorage();
  }

  /**
   * Revalida stock, disponibilidad y precios reales contra Spring Boot antes de finalizar compra.
   */
  revalidateStock(): Observable<StockValidationResult> {
    const current = this._items();
    if (current.length === 0) {
      return of({ valid: false, messages: ['Tu carrito está vacío.'] });
    }

    const checks = current.map(item =>
      this.productService.getProductById(item.productoId).pipe(
        map(product => ({ item, product, error: false })),
        catchError(() => of({ item, product: null as Producto | null, error: true }))
      )
    );

    return forkJoin(checks).pipe(
      map(results => {
        const messages: string[] = [];
        const updatedItems: CartItem[] = [];

        for (const res of results) {
          if (res.error || !res.product || !res.product.activo) {
            messages.push(`"${res.item.nombre}" ya no está disponible y fue retirado del carrito.`);
            continue;
          }

          if (res.product.stock <= 0) {
            messages.push(`"${res.product.nombre}" se quedó sin stock y fue retirado del carrito.`);
            continue;
          }

          const adjustedQty = Math.min(res.item.cantidad, res.product.stock);
          if (adjustedQty < res.item.cantidad) {
            messages.push(
              `Ajustamos "${res.product.nombre}" a ${adjustedQty} unidad(es) según el stock actual.`
            );
          }

          updatedItems.push({
            productoId: res.product.id,
            nombre: res.product.nombre,
            precio: Number(res.product.precio),
            imagenUrl: res.product.imagenUrl,
            categoriaNombre: res.product.categoriaNombre,
            stockDisponible: res.product.stock,
            cantidad: adjustedQty
          });
        }

        this._items.set(updatedItems);
        this.saveToStorage();

        return {
          valid: messages.length === 0 && updatedItems.length > 0,
          messages
        };
      })
    );
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(APP_CONSTANTS.CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(APP_CONSTANTS.CART_STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      // Ignorar si almacenamiento no está disponible
    }
  }
}
