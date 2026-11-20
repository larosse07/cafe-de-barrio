import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserInfo } from '../../../core/models';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <header class="admin-header">
      <div class="admin-header__left">
        <button
          type="button"
          class="admin-header__menu-btn"
          (click)="toggleSidebar.emit()"
          aria-label="Abrir navegación"
        >
          <app-icon name="menu" [size]="20" />
        </button>

        <div class="admin-header__breadcrumbs">
          <a routerLink="/admin/dashboard">Admin</a>
          <span aria-hidden="true">/</span>
          <strong>{{ pageTitle }}</strong>
        </div>
      </div>

      @if (user) {
        <div class="admin-header__profile">
          <div class="admin-header__avatar" aria-hidden="true">
            {{ user.nombre.charAt(0).toUpperCase() }}
          </div>
          <div class="admin-header__meta">
            <strong>{{ user.nombre }}</strong>
            <span>{{ user.email }}</span>
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .admin-header {
      height: 68px;
      background-color: var(--color-warm-white);
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--space-5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);

      &__left {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      &__menu-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px; height: 38px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-border-strong);
        background: var(--color-cream);
        color: var(--color-espresso);
        @media (min-width: 1024px) { display: none; }
      }

      &__breadcrumbs {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        a:hover { color: var(--color-espresso); }
        strong { color: var(--color-espresso); font-weight: 600; }
      }

      &__profile {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      &__avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: var(--color-espresso); color: var(--color-cream);
        display: inline-flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: var(--text-sm);
      }

      &__meta {
        display: none;
        flex-direction: column;
        line-height: 1.2;
        @media (min-width: 640px) { display: flex; }
        strong { font-size: var(--text-sm); color: var(--color-espresso); }
        span { font-size: var(--text-xs); color: var(--color-text-muted); }
      }
    }
  `
})
export class AdminHeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() user: UserInfo | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();
}
