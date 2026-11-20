import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="form-field">
      @if (label) {
        <label [attr.for]="forId" class="form-field__label">
          {{ label }}
          @if (required) {
            <span class="form-field__req" aria-hidden="true">*</span>
          }
        </label>
      }
      <ng-content />
      @if (errorMessage) {
        <span class="form-field__error" role="alert">{{ errorMessage }}</span>
      } @else if (hint) {
        <span class="form-field__hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: `
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      &__label {
        font-size: var(--text-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
      }
      &__req { color: var(--color-danger); margin-left: 2px; }
      &__error { font-size: var(--text-xs); color: var(--color-danger); font-weight: 500; }
      &__hint { font-size: var(--text-xs); color: var(--color-text-muted); }
    }
  `
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() forId = '';
  @Input() required = false;
  @Input() hint = '';
  @Input() control: AbstractControl | null = null;
  @Input() customError = '';

  get errorMessage(): string {
    if (this.customError) return this.customError;
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors || (!ctrl.touched && !ctrl.dirty)) return '';

    if (ctrl.errors['required'] || ctrl.errors['blank']) return 'Este campo es obligatorio.';
    if (ctrl.errors['email']) return 'Ingresa un correo electrónico válido.';
    if (ctrl.errors['minlength']) {
      return `Debe tener al menos ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    }
    if (ctrl.errors['maxlength']) {
      return `No debe superar ${ctrl.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (ctrl.errors['min']) {
      return `El valor mínimo permitido es ${ctrl.errors['min'].min}.`;
    }
    if (ctrl.errors['invalidPhone']) return 'Ingresa un celular válido (mínimo 9 dígitos).';
    if (ctrl.errors['invalidImageUrl']) return 'Ingresa una URL válida que inicie con http://, https:// o /.';
    return 'El valor ingresado no es válido.';
  }
}
