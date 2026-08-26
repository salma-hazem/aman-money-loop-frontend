import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import {
  OTP_PATTERN,
  backendErrorMessage,
  passwordStrengthValidator,
} from '../../../core/validators/account.validators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<'email' | 'otp' | 'newPassword'>('email');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submittedEmail = signal('');

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
  });
  readonly otpForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(OTP_PATTERN)]],
  });
  readonly passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), passwordStrengthValidator()]],
    confirmPassword: ['', Validators.required],
  });

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email } = this.emailForm.getRawValue();
    this.submittedEmail.set(email);
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('otp');
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(backendErrorMessage(error, 'The reset code could not be sent.'));
      },
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    // The backend validates the code together with the new password in one request.
    this.error.set(null);
    this.step.set('newPassword');
  }

  submitNewPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { code } = this.otpForm.getRawValue();
    this.auth.resetPassword(this.submittedEmail(), code, newPassword, confirmPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.error.set(backendErrorMessage(error, 'Reset failed. Please check the code and try again.'));
        this.loading.set(false);
      },
    });
  }
}
