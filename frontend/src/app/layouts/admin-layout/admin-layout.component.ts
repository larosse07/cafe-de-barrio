import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminHeaderComponent } from '../../shared/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-shell">
      <app-admin-sidebar
        [mobileOpen]="sidebarOpen()"
        (closeMobile)="sidebarOpen.set(false)"
        (logout)="onLogout()"
      />
      <div class="admin-workspace">
        <app-admin-header
          [pageTitle]="pageTitle()"
          [user]="auth.user()"
          (toggleSidebar)="sidebarOpen.set(true)"
        />
        <main class="admin-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .admin-shell {
      min-height: 100vh;
      background-color: var(--color-cream);
      display: flex;
    }
    .admin-workspace {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      @media (min-width: 1024px) {
        margin-left: var(--sidebar-width);
      }
    }
    .admin-content {
      flex: 1;
      padding: var(--space-5);
      @media (min-width: 768px) {
        padding: var(--space-8);
      }
    }
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly sidebarOpen = signal(false);
  readonly pageTitle = signal('Dashboard');

  constructor() {
    this.updateTitle();
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    let active = this.route.firstChild;
    while (active?.firstChild) {
      active = active.firstChild;
    }
    this.pageTitle.set(active?.snapshot?.data?.['title'] ?? 'Dashboard');
  }

  onLogout(): void {
    this.auth.logout(true).subscribe(() => {
      this.toast.info('Has cerrado sesión correctamente.');
    });
  }
}
