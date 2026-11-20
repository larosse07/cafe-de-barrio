import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <footer class="footer">
      <div class="container footer__grid">
        <div class="footer__brand">
          <div class="footer__logo">
            <span class="footer__mark"><app-icon name="coffee" [size]="20" /></span>
            <strong>CAFÉ DE BARRIO</strong>
          </div>
          <p>
            Tostamos microlotes peruanos de altura en pequeños batches cada semana.
            Acompañamos tus mañanas con espresso de especialidad y pastelería horneada al alba.
          </p>
          <span class="footer__origin">Origen Perú · Precios en Soles (PEN)</span>
        </div>

        <div class="footer__col">
          <h4>Navegación</h4>
          <ul>
            <li><a routerLink="/">Inicio</a></li>
            <li><a routerLink="/tienda">Catálogo completo</a></li>
            <li><a routerLink="/carrito">Mi carrito</a></li>
            <li><a routerLink="/admin/login">Acceso administrativo</a></li>
          </ul>
        </div>

        <div class="footer__col">
          <h4>Nuestra Barra</h4>
          <ul class="footer__info">
            <li><app-icon name="map-pin" [size]="15" /> Av. Pedro de Osma 248, Barranco, Lima</li>
            <li><app-icon name="clock" [size]="15" /> Lun a Dom · 7:30 a.m. – 8:30 p.m.</li>
            <li><app-icon name="phone" [size]="15" /> +51 987 654 321</li>
          </ul>
        </div>

        <div class="footer__col">
          <h4>Compromiso Artesanal</h4>
          <p class="footer__note">
            Comercio directo con caficultores de Cajamarca, Chanchamayo, Cusco y Amazonas.
            Empaques reciclables con válvula desgasificadora.
          </p>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <span>© {{ currentYear }} Café de Barrio. Todos los derechos reservados.</span>
          <span>Hecho con café peruano de especialidad</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background-color: var(--color-espresso);
      color: var(--color-beige);
      margin-top: var(--space-16);

      &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-10);
        padding-block: var(--space-16) var(--space-12);

        @media (min-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 1024px) {
          grid-template-columns: 1.5fr 0.85fr 1.15fr 1fr;
        }
      }

      &__logo {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
        strong {
          font-family: var(--font-display);
          font-size: 1.45rem;
          color: var(--color-warm-white);
          letter-spacing: 0.05em;
        }
      }

      &__mark {
        width: 36px; height: 36px; border-radius: var(--radius-sm);
        background: var(--color-coffee); color: var(--color-warm-white);
        display: inline-flex; align-items: center; justify-content: center;
      }

      &__brand p {
        font-size: var(--text-sm);
        color: rgba(232, 216, 195, 0.82);
        line-height: 1.7;
        margin-bottom: var(--space-4);
      }

      &__origin {
        display: inline-block;
        padding: 0.3rem 0.75rem;
        border-radius: var(--radius-full);
        background: rgba(120, 129, 90, 0.25);
        color: var(--color-cream);
        font-size: var(--text-xs);
        font-weight: 600;
      }

      &__col h4 {
        font-family: var(--font-display);
        font-size: 1.25rem;
        color: var(--color-warm-white);
        margin-bottom: var(--space-4);
      }

      &__col ul {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        font-size: var(--text-sm);
      }

      &__col a {
        color: rgba(232, 216, 195, 0.84);
        transition: color var(--transition-fast);
        &:hover { color: var(--color-warm-white); }
      }

      &__info li {
        display: flex;
        align-items: flex-start;
        gap: var(--space-2);
        color: rgba(232, 216, 195, 0.84);
      }

      &__note {
        font-size: var(--text-sm);
        color: rgba(232, 216, 195, 0.8);
        line-height: 1.65;
      }

      &__bottom {
        border-top: 1px solid rgba(232, 216, 195, 0.16);
        padding-block: var(--space-5);
        font-size: var(--text-xs);
        color: rgba(232, 216, 195, 0.7);
      }

      &__bottom-inner {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        align-items: center;
        text-align: center;
        @media (min-width: 768px) {
          flex-direction: row;
          justify-content: space-between;
        }
      }
    }
  `
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
