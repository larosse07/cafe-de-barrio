import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <header class="navbar">
      <div class="container navbar__inner">
        <a routerLink="/" class="navbar__brand" (click)="closeMenu()">
          <span class="navbar__logo-mark">
            <app-icon name="coffee" [size]="20" />
          </span>
          <div class="navbar__brand-text">
            <strong>CAFÉ DE BARRIO</strong>
            <span>Tostaduría & Barra</span>
          </div>
        </a>

        <nav class="navbar__links" aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/tienda" routerLinkActive="is-active">Tienda</a>
          <a routerLink="/" fragment="categorias">Categorías</a>
          <a routerLink="/" fragment="nosotros">Nosotros</a>
        </nav>

        <div class="navbar__actions">
          <a routerLink="/carrito" class="navbar__cart" aria-label="Ver carrito de compras">
            <app-icon name="shopping-bag" [size]="20" />
            <span class="navbar__cart-label">Carrito</span>
            @if (cart.totalItems() > 0) {
              <span class="navbar__badge">{{ cart.totalItems() }}</span>
            }
          </a>

          <a
            [routerLink]="auth.isAuthenticated() ? '/admin/dashboard' : '/admin/login'"
            class="navbar__admin-btn"
            title="Panel Administrativo"
          >
            <app-icon name="shield" [size]="16" />
            <span>{{ auth.isAuthenticated() ? 'Panel' : 'Admin' }}</span>
          </a>

          <button
            type="button"
            class="navbar__toggle"
            (click)="toggleMenu()"
            [attr.aria-expanded]="mobileOpen()"
            aria-label="Abrir menú"
          >
            <app-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="navbar__mobile" role="navigation" aria-label="Menú móvil">
          <div class="container navbar__mobile-links">
            <a routerLink="/" (click)="closeMenu()">Inicio</a>
            <a routerLink="/tienda" (click)="closeMenu()">Tienda</a>
            <a routerLink="/" fragment="categorias" (click)="closeMenu()">Categorías</a>
            <a routerLink="/" fragment="nosotros" (click)="closeMenu()">Nosotros</a>
            <a routerLink="/carrito" (click)="closeMenu()">
              Carrito ({{ cart.totalItems() }})
            </a>
            <a
              [routerLink]="auth.isAuthenticated() ? '/admin/dashboard' : '/admin/login'"
              class="navbar__mobile-admin"
              (click)="closeMenu()"
            >
              <app-icon name="shield" [size]="16" />
              {{ auth.isAuthenticated() ? 'Ir al Panel Administrativo' : 'Acceso Administrativo' }}
            </a>
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .navbar {
      position: sticky;
      top: 0;
      z-index: var(--z-navbar);
      background-color: rgba(255, 252, 247, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);

      &__inner {
        height: var(--navbar-height);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
      }

      &__brand {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
      }

      &__logo-mark {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        background-color: var(--color-espresso);
        color: var(--color-cream);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &__brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
        strong {
          font-family: var(--font-display);
          font-size: 1.25rem;
          letter-spacing: 0.04em;
          color: var(--color-espresso);
        }
        span {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--color-olive-dark);
          font-weight: 600;
        }
      }

      &__links {
        display: none;
        align-items: center;
        gap: var(--space-7, 1.75rem);

        @media (min-width: 900px) {
          display: flex;
        }

        a {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
          position: relative;
          padding-block: var(--space-1);
          transition: color var(--transition-fast);

          &:hover, &.is-active {
            color: var(--color-espresso);
          }

          &.is-active::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -4px;
            height: 2px;
            background-color: var(--color-olive);
            border-radius: 2px;
          }
        }
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      &__cart {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 0.55rem 0.9rem;
        border-radius: var(--radius-full);
        background-color: var(--color-cream);
        border: 1px solid var(--color-border-strong);
        color: var(--color-espresso);
        font-size: var(--text-sm);
        font-weight: 600;
        transition: all var(--transition-fast);

        &:hover {
          background-color: var(--color-beige);
        }
      }

      &__cart-label {
        display: none;
        @media (min-width: 576px) { display: inline; }
      }

      &__badge {
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        border-radius: var(--radius-full);
        background-color: var(--color-olive);
        color: var(--color-warm-white);
        font-size: 0.72rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      &__admin-btn {
        display: none;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-text-secondary);
        border: 1px solid transparent;
        transition: all var(--transition-fast);

        @media (min-width: 900px) {
          display: inline-flex;
        }

        &:hover {
          background-color: var(--color-cream);
          border-color: var(--color-border);
          color: var(--color-espresso);
        }
      }

      &__toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-strong);
        background: var(--color-warm-white);
        color: var(--color-espresso);

        @media (min-width: 900px) {
          display: none;
        }
      }

      &__mobile {
        border-top: 1px solid var(--color-border);
        background-color: var(--color-warm-white);
        animation: fadeIn 180ms ease-out;

        @media (min-width: 900px) {
          display: none;
        }
      }

      &__mobile-links {
        display: flex;
        flex-direction: column;
        padding-block: var(--space-4);
        gap: var(--space-1);

        a {
          padding: 0.75rem var(--space-3);
          border-radius: var(--radius-sm);
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--color-espresso);
          &:hover { background-color: var(--color-cream); }
        }
      }

      &__mobile-admin {
        margin-top: var(--space-2);
        border-top: 1px solid var(--color-border);
        display: flex !important;
        align-items: center;
        gap: var(--space-2);
        color: var(--color-coffee) !important;
      }
    }
  `
})
export class NavbarComponent {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  readonly mobileOpen = signal(false);

  toggleMenu(): void {
    this.mobileOpen.update(v => !v);
  }

  closeMenu(): void {
    this.mobileOpen.set(false);
  }
}
