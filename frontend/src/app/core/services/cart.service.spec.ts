import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Producto } from '../models';
import { CartService } from './cart.service';
import { ProductService } from './product.service';
import { ToastService } from './toast.service';

describe('CartService', () => {
  let service: CartService;
  let productServiceMock: { getProductById: ReturnType<typeof vi.fn> };

  const sampleProduct: Producto = {
    id: 1,
    nombre: 'Cajamarca Origen 250g',
    descripcion: 'Café lavado de altura',
    precio: 38.0,
    stock: 3,
    imagenUrl: 'https://example.com/cafe.jpg',
    activo: true,
    disponible: true,
    categoriaId: 1,
    categoriaNombre: 'Café de Especialidad',
    fechaCreacion: '2026-11-20T10:00:00',
    fechaActualizacion: '2026-11-20T10:00:00'
  };

  beforeEach(() => {
    localStorage.clear();
    productServiceMock = {
      getProductById: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CartService,
        ToastService,
        { provide: ProductService, useValue: productServiceMock }
      ]
    });

    service = TestBed.inject(CartService);
  });

  it('should add item, calculate totals and persist in localStorage', () => {
    const added = service.addItem(sampleProduct, 2);
    expect(added).toBe(true);
    expect(service.totalItems()).toBe(2);
    expect(service.totalAmount()).toBe(76);
    expect(localStorage.getItem('cafe_barrio_cart_v1')).toContain('Cajamarca Origen 250g');
  });

  it('should not allow exceeding available stock', () => {
    expect(service.addItem(sampleProduct, 2)).toBe(true);
    expect(service.addItem(sampleProduct, 2)).toBe(false);
    expect(service.totalItems()).toBe(2);
  });

  it('should increment, decrement and remove items cleanly', () => {
    service.addItem(sampleProduct, 1);
    service.increment(1);
    expect(service.totalItems()).toBe(2);
    service.decrement(1);
    expect(service.totalItems()).toBe(1);
    service.decrement(1);
    expect(service.isEmpty()).toBe(true);
  });

  it('should revalidate stock against backend and adjust quantity when stock drops', () => {
    service.addItem(sampleProduct, 3);
    productServiceMock.getProductById.mockReturnValue(
      of({ ...sampleProduct, stock: 1, precio: 40.0 })
    );

    let resultValid = true;
    let messages: string[] = [];
    service.revalidateStock().subscribe(res => {
      resultValid = res.valid;
      messages = res.messages;
    });

    expect(resultValid).toBe(false);
    expect(messages.length).toBe(1);
    expect(service.totalItems()).toBe(1);
    expect(service.totalAmount()).toBe(40);
  });
});
