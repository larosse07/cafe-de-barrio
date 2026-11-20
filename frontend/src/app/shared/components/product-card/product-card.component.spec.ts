import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Producto } from '../../../core/models';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  const sample: Producto = {
    id: 4,
    nombre: 'Croissant de Mantequilla',
    descripcion: 'Hojaldre fermentado 48 horas.',
    precio: 12.0,
    stock: 0,
    imagenUrl: 'https://example.com/croissant.jpg',
    activo: true,
    disponible: false,
    categoriaId: 3,
    categoriaNombre: 'Pastelería Artesanal',
    fechaCreacion: '2026-11-20T10:00:00',
    fechaActualizacion: '2026-11-20T10:00:00'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should display PEN price and disable add button when out of stock', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentInstance.product = sample;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('S/ 12.00');
    expect(text).toContain('Agotado');

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should emit addToCart when product is available', () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    const available = { ...sample, stock: 5, disponible: true };
    fixture.componentInstance.product = available;
    const emitSpy = vi.spyOn(fixture.componentInstance.addToCart, 'emit');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(emitSpy).toHaveBeenCalledWith(available);
  });
});
