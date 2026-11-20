import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { StoreLayoutComponent } from './layouts/store-layout/store-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/store/home/home.component').then(m => m.HomeComponent),
        title: 'Café de Barrio — Café de Especialidad Artesanal'
      },
      {
        path: 'tienda',
        loadComponent: () => import('./features/store/catalog/catalog.component').then(m => m.CatalogComponent),
        title: 'Catálogo — Café de Barrio'
      },
      {
        path: 'producto/:id',
        loadComponent: () =>
          import('./features/store/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Detalle de Producto — Café de Barrio'
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/store/cart/cart.component').then(m => m.CartComponent),
        title: 'Carrito — Café de Barrio'
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/store/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Finalizar Pedido — Café de Barrio'
      },
      {
        path: 'pedido-confirmado',
        loadComponent: () =>
          import('./features/store/order-confirmation/order-confirmation.component').then(
            m => m.OrderConfirmationComponent
          ),
        title: 'Pedido Confirmado — Café de Barrio'
      }
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Acceso Administrativo — Café de Barrio'
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        data: { title: 'Dashboard' },
        title: 'Dashboard — Admin Café de Barrio'
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent),
        data: { title: 'Productos' },
        title: 'Productos — Admin Café de Barrio'
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
        data: { title: 'Categorías' },
        title: 'Categorías — Admin Café de Barrio'
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        data: { title: 'Pedidos' },
        title: 'Pedidos — Admin Café de Barrio'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
