import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FriendlyHttpError } from '../../../core/interceptors/error.interceptor';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AppIconComponent } from '../../../shared/components/icon/icon.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, AppIconComponent, ImageFallbackDirective],
  template: `
    <div class="login-shell">
      <div class="login-visual">
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=85"
          alt="Barra administrativa de Café de Barrio"
          appImageFallback
        />
        <div class="login-visual__scrim"></div>
        <div class="login-visual__content">
          <div class="login-visual__brand">
            <span class="login-visual__mark"><app-icon name="coffee" [size]="20" /></span>
            <strong>CAFÉ DE BARRIO</strong>
          </div>
          <h2>Gestión artesanal, control en tiempo real</h2>
          <p>Administra tu catálogo de orígenes, controla el inventario y gestiona cada pedido desde un solo lugar.</p>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-box">
          <a routerLink="/" class="login-back">
            <app-icon name="arrow-left" [size]="15" />
            Volver a la tienda
          </a>

          <div class="login-box__head">
            <span class="eyebrow">Acceso Administrativo</span>
            <h1>Iniciar sesión</h1>
            <p>Ingresa tus credenciales de administrador para acceder al panel de gestión.</p>
          </div>

          @if (errorMessage()) {
            <div class="login-alert" role="alert">
              <app-icon name="alert-circle" [size]="18" />
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <app-form-field
              label="Correo electrónico"
              forId="admin-email"
              [required]="true"
              [control]="form.controls.email"
            >
              <input
                id="admin-email"
                type="email"
                class="input"
                [class.is-invalid]="isInvalid('email')"
                formControlName="email"
                placeholder="admin@cafedebarrio.local"
                autocomplete="username"
              />
            </app-form-field>

            <app-form-field
              label="Contraseña"
              forId="admin-password"
              [required]="true"
              [control]="form.controls.password"
            >
              <input
                id="admin-password"
                type="password"
                class="input"
                [class.is-invalid]="isInvalid('password')"
                formControlName="password"
                placeholder="••••••••••••"
                autocomplete="current-password"
              />
            </app-form-field>

            <button
              type="submit"
              class="btn btn--primary btn--lg btn--full"
              [disabled]="submitting()"
            >
              <app-icon name="lock" [size]="17" />
              <span>{{ submitting() ? 'Verificando acceso...' : 'Ingresar al panel' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr;
      background: var(--color-warm-white);
      @media (min-width: 960px) {
        grid-template-columns: 1.05fr 0.95fr;
      }
    }

    .login-visual {
      display: none;
      position: relative;
      overflow: hidden;
      background: var(--color-espresso-900);
      @media (min-width: 960px) { display: flex; align-items: flex-end; }
      img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      &__scrim {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(38, 24, 18, 0.35) 0%, rgba(38, 24, 18, 0.9) 100%);
      }
      &__content {
        position: relative; z-index: 1; padding: var(--space-12);
        color: var(--color-warm-white); max-width: 520px;
        h2 { color: var(--color-warm-white); font-size: var(--text-3xl); margin-block: var(--space-5) var(--space-3); }
        p { color: rgba(255, 252, 247, 0.82); }
      }
      &__brand {
        display: inline-flex; align-items: center; gap: var(--space-3);
        strong { font-family: var(--font-display); font-size: 1.35rem; letter-spacing: 0.06em; }
      }
      &__mark {
        width: 40px; height: 40px; border-radius: var(--radius-sm);
        background: var(--color-olive); display: inline-flex; align-items: center; justify-content: center;
      }
    }

    .login-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
    }

    .login-box {
      width: 100%;
      max-width: 430px;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      &__head {
        h1 { font-size: var(--text-3xl); margin-block: var(--space-1) var(--space-2); }
        p { color: var(--color-text-secondary); font-size: var(--text-sm); }
      }
    }

    .login-back {
      display: inline-flex; align-items: center; gap: var(--space-2);
      font-size: var(--text-xs); font-weight: 600; color: var(--color-coffee);
      &:hover { color: var(--color-espresso); }
    }

    .login-alert {
      display: flex; align-items: flex-start; gap: var(--space-3);
      padding: var(--space-4); border-radius: var(--radius-sm);
      background: var(--color-danger-bg); color: var(--color-danger);
      font-size: var(--text-sm); border: 1px solid rgba(155, 59, 46, 0.25);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }
  `
})
export class AdminLoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated() && this.auth.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  isInvalid(field: 'email' | 'password'): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: res => {
        this.submitting.set(false);
        this.toast.success(`Bienvenido, ${res.user.nombre}.`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: FriendlyHttpError) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }
}
