import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Pedido, Producto } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  let cartService: CartService;
  let orderServiceMock: { createOrder: ReturnType<typeof vi.fn> };
  let productServiceMock: { getProductById: ReturnType<typeof vi.fn> };

  const product: Producto = {
    id: 1,
    nombre: 'Flat White Artesanal',
    descripcion: 'Doble ristretto con microespuma.',
    precio: 14.5,
    stock: 10,
    imagenUrl: 'https://example.com/fw.jpg',
    activo: true,
    disponible: true,
    categoriaId: 2,
    categoriaNombre: 'Bebidas de Barra',
    fechaCreacion: '2026-11-20T10:00:00',
    fechaActualizacion: '2026-11-20T10:00:00'
  };

  beforeEach(async () => {
    localStorage.clear();
    orderServiceMock = { createOrder: vi.fn() };
    productServiceMock = { getProductById: vi.fn().mockReturnValue(of(product)) };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        CartService,
        ToastService,
        { provide: OrderService, useValue: orderServiceMock },
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    cartService = TestBed.inject(CartService);
    cartService.addItem(product, 2);
  });

  it('should prevent submission when required fields are invalid', () => {
    const fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    expect(orderServiceMock.createOrder).not.toHaveBeenCalled();
    expect(cartService.totalItems()).toBe(2);
  });

  it('should keep cart and form data intact when backend returns an error', () => {
    orderServiceMock.createOrder.mockReturnValue(
      throwError(() => ({ status: 409, message: 'Stock insuficiente' }))
    );

    const fixture = TestBed.createComponent(CheckoutComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.form.setValue({
      clienteNombre: 'Andrea Torres',
      celular: '987654321',
      direccion: 'Av. Benavides 1200, Miraflores',
      referencia: '',
      observaciones: ''
    });

    comp.onSubmit();

    expect(comp.submitError()).toBe('Stock insuficiente');
    expect(comp.form.controls.clienteNombre.value).toBe('Andrea Torres');
    expect(cartService.isEmpty()).toBe(false);
  });

  it('should clear cart and navigate to confirmation only when order succeeds', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const mockOrder: Pedido = {
      id: 9,
      codigo: 'CB-20261120-XYZ12',
      clienteNombre: 'Andrea Torres',
      celular: '987654321',
      direccion: 'Av. Benavides 1200, Miraflores',
      referencia: null,
      observaciones: null,
      fecha: '2026-11-20T18:00:00',
      estado: 'PENDIENTE',
      total: 29.0,
      stockDevuelto: false,
      detalles: [],
      historialEstados: []
    };
    orderServiceMock.createOrder.mockReturnValue(of(mockOrder));

    const fixture = TestBed.createComponent(CheckoutComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.form.setValue({
      clienteNombre: 'Andrea Torres',
      celular: '987654321',
      direccion: 'Av. Benavides 1200, Miraflores',
      referencia: '',
      observaciones: ''
    });

    comp.onSubmit();

    expect(cartService.isEmpty()).toBe(true);
    expect(navSpy).toHaveBeenCalledWith(['/pedido-confirmado'], { state: { order: mockOrder } });
  });
});
