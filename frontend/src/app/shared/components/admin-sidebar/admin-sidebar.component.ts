import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIconComponent, IconName } from '../icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    @if (mobileOpen) {
      <div class="sidebar-backdrop" (click)="closeMobile.emit()"></div>
    }
    <aside class="sidebar" [class.is-open]="mobileOpen" aria-label="Navegación administrativa">
      <div class="sidebar__top">
        <a routerLink="/admin/dashboard" class="sidebar__brand" (click)="closeMobile.emit()">
          <span class="sidebar__mark"><app-icon name="coffee" [size]="18" /></span>
          <div>
            <strong>CAFÉ DE BARRIO</strong>
            <span>Panel Administrativo</span>
          </div>
        </a>
        <button type="button" class="sidebar__close" (click)="closeMobile.emit()" aria-label="Cerrar menú">
          <app-icon name="x" [size]="18" />
        </button>
      </div>

      <nav class="sidebar__nav">
        <span class="sidebar__section">Gestión</span>
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="is-active"
            class="sidebar__link"
            (click)="closeMobile.emit()"
          >
            <app-icon [name]="item.icon" [size]="18" />
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar__footer">
        <a routerLink="/" class="sidebar__link sidebar__link--store">
          <app-icon name="store" [size]="18" />
          <span>Ver tienda pública</span>
        </a>
        <button type="button" class="sidebar__link sidebar__link--logout" (click)="logout.emit()">
          <app-icon name="log-out" [size]="18" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: `
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(38, 24, 18, 0.52);
      z-index: calc(var(--z-drawer) - 1);
      @media (min-width: 1024px) { display: none; }
    }
    .sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      width: var(--sidebar-width);
      background-color: var(--color-espresso-900);
      color: var(--color-beige);
      display: flex;
      flex-direction: column;
      z-index: var(--z-drawer);
      transform: translateX(-100%);
      transition: transform var(--transition-base);
      border-right: 1px solid rgba(232, 216, 195, 0.1);

      &.is-open { transform: translateX(0); }

      @media (min-width: 1024px) {
        transform: translateX(0);
      }

      &__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-5);
        border-bottom: 1px solid rgba(232, 216, 195, 0.12);
      }

      &__brand {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        strong {
          display: block;
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--color-warm-white);
          letter-spacing: 0.04em;
        }
        span {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-olive);
          font-weight: 600;
        }
      }

      &__mark {
        width: 36px; height: 36px; border-radius: var(--radius-sm);
        background: var(--color-coffee); color: var(--color-warm-white);
        display: inline-flex; align-items: center; justify-content: center;
      }

      &__close {
        background: transparent; border: none; color: var(--color-beige); padding: 6px;
        @media (min-width: 1024px) { display: none; }
      }

      &__nav {
        flex: 1;
        padding: var(--space-5) var(--space-3);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      &__section {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(232, 216, 195, 0.5);
        padding: 0 var(--space-3) var(--space-2);
        font-weight: 700;
      }

      &__link {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: 0.75rem var(--space-3);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        font-weight: 500;
        color: rgba(232, 216, 195, 0.85);
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        transition: all var(--transition-fast);

        &:hover {
          background-color: rgba(255, 252, 247, 0.08);
          color: var(--color-warm-white);
        }

        &.is-active {
          background-color: var(--color-olive);
          color: var(--color-warm-white);
          font-weight: 600;
        }

        &--logout:hover {
          background-color: rgba(155, 59, 46, 0.28);
          color: #ffd7d2;
        }
      }

      &__footer {
        padding: var(--space-4) var(--space-3);
        border-top: 1px solid rgba(232, 216, 195, 0.12);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
    }
  `
})
export class AdminSidebarComponent {
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
    { label: 'Productos', route: '/admin/productos', icon: 'package' },
    { label: 'Categorías', route: '/admin/categorias', icon: 'tag' },
    { label: 'Pedidos', route: '/admin/pedidos', icon: 'clipboard-list' }
  ];
}
