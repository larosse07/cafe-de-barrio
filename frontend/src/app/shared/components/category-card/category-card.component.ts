import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../../core/models';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';
import { AppIconComponent } from '../icon/icon.component';

const CATEGORY_PHOTOS: Record<string, string> = {
  'café de especialidad': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=85',
  'bebidas de barra': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85',
  'pastelería artesanal': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85',
  'métodos y accesorios': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=85'
};

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink, ImageFallbackDirective, AppIconComponent],
  template: `
    <a [routerLink]="['/tienda']" [queryParams]="{ categoria: category.id }" class="cat-card">
      <div class="cat-card__media">
        <img [src]="imageUrl" [alt]="category.nombre" appImageFallback loading="lazy" />
        <div class="cat-card__overlay"></div>
      </div>
      <div class="cat-card__content">
        <span class="cat-card__count">{{ category.cantidadProductos }} productos</span>
        <h3>{{ category.nombre }}</h3>
        <p>{{ category.descripcion }}</p>
        <span class="cat-card__cta">
          Explorar selección
          <app-icon name="arrow-right" [size]="15" />
        </span>
      </div>
    </a>
  `,
  styles: `
    .cat-card {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 310px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background-color: var(--color-espresso);
      color: var(--color-warm-white);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
        .cat-card__media img { transform: scale(1.06); }
        .cat-card__cta app-icon { transform: translateX(4px); }
      }
      &__media {
        position: absolute;
        inset: 0;
        img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--transition-slow);
        }
      }
      &__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(38, 24, 18, 0.12) 0%, rgba(38, 24, 18, 0.86) 86%);
      }
      &__content {
        position: relative;
        z-index: 1;
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      &__count {
        font-size: var(--text-xs);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--color-beige);
        font-weight: 600;
      }
      h3 {
        color: var(--color-warm-white);
        font-size: var(--text-2xl);
      }
      p {
        color: rgba(255, 252, 247, 0.84);
        font-size: var(--text-sm);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      &__cta {
        margin-top: var(--space-2);
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-beige);
        app-icon { transition: transform var(--transition-fast); }
      }
    }
  `
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Categoria;

  get imageUrl(): string {
    const key = this.category.nombre.trim().toLowerCase();
    return (
      CATEGORY_PHOTOS[key] ??
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=85'
    );
  }
}
