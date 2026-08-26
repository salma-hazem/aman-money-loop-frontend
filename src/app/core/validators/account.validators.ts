import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const EGYPTIAN_PHONE_PATTERN = /^01[0125][0-9]{8}$/;
export const NATIONAL_ID_PATTERN = /^\d{14}$/;
export const OTP_PATTERN = /^\d{6}$/;

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (!/[a-z]/.test(value)) errors['requiresLowercase'] = true;
    if (!/[A-Z]/.test(value)) errors['requiresUppercase'] = true;
    if (!/[0-9]/.test(value)) errors['requiresDigit'] = true;
    if (!/[^a-zA-Z0-9]/.test(value)) errors['requiresSpecialCharacter'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}

export function backendErrorMessage(error: any, fallback: string): string {
  const errors = error?.error?.errors;
  if (errors) {
    const messages = Object.values(errors).flat() as string[];
    if (messages.length) return messages.join(' ');
  }
  return error?.error?.detail ?? error?.error?.message ?? fallback;
}

