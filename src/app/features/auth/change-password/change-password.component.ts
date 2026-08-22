import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

function passwordStrengthValidator(): ValidatorFn {
  return (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value: string =
      control.value ?? '';

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (!/[a-z]/.test(value)) {
      errors['requiresLowercase'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['requiresUppercase'] = true;
    }

    if (!/[0-9]/.test(value)) {
      errors['requiresDigit'] = true;
    }

    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors['requiresSpecialCharacter'] =
        true;
    }

    return Object.keys(errors).length
      ? errors
      : null;
  };
}
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],

    newPassword: [
    '',
    [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        passwordStrengthValidator(),
    ],
    ],

    confirmPassword: [
      '',
      Validators.required,
    ],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.error.set(
        'New password and confirmation do not match.'
      );
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .changePassword(
        currentPassword,
        newPassword
      )
      .subscribe({
        next: () => {
          this.auth.markPasswordChanged();

          this.router.navigate([
            '/console',
          ]);
        },

        error: (err) => {
            const backendErrors =
                err?.error?.errors;

            if (backendErrors) {
                const messages =
                Object.values(backendErrors)
                    .flat() as string[];

                this.error.set(
                messages.join(' ')
                );
            } else {
                this.error.set(
                err?.error?.detail ??
                    'Password could not be changed. Please try again.'
                );
            }

            this.loading.set(false);
            },
      });
  }
}