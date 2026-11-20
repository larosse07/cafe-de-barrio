import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static peruPhone(): ValidatorFn {
    const regex = /^[0-9+\-\s]{9,20}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();
      if (!value) return null;
      return regex.test(value) ? null : { invalidPhone: true };
    };
  }

  static imageUrl(): ValidatorFn {
    const regex = /^(https?:\/\/|\/).+/i;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();
      if (!value) return null;
      return regex.test(value) ? null : { invalidImageUrl: true };
    };
  }

  static nonBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value === 'string' && value.trim().length === 0) {
        return { blank: true };
      }
      return null;
    };
  }
}
