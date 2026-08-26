import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import {
  EGYPTIAN_PHONE_PATTERN,
  NATIONAL_ID_PATTERN,
  backendErrorMessage,
  passwordStrengthValidator,
} from '../../../core/validators/account.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    nationalId: ['', [Validators.required, Validators.pattern(NATIONAL_ID_PATTERN)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), passwordStrengthValidator()]],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.error.set('Password and confirmation do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.auth.register(value).subscribe({
      next: (userId) => {
        sessionStorage.setItem('registration_user_id', userId);
        this.router.navigate(['/confirm-otp']);
      },
      error: (error) => {
        this.error.set(backendErrorMessage(error, 'Registration failed. Please try again.'));
        this.loading.set(false);
      },
    });
  }
}
