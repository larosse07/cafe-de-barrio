import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="store-shell">
      <app-navbar />
      <main class="store-main">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: `
    .store-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .store-main {
      flex: 1;
    }
  `
})
export class StoreLayoutComponent {}
