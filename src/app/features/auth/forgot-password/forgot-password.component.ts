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
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<'email' | 'otp' | 'newPassword'>('email');

  readonly loading = signal(false);
  readonly resending = signal(false);

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly submittedEmail = signal('');

  readonly emailForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(128),
      ],
    ],
  });

  readonly otpForm = this.fb.nonNullable.group({
    code: [
      '',
      [
        Validators.required,
        Validators.pattern(OTP_PATTERN),
      ],
    ],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        passwordStrengthValidator(),
      ],
    ],
    confirmPassword: ['', Validators.required],
  });

  // Step 1:
  // Send the initial reset-password verification code.
  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { email } = this.emailForm.getRawValue();

    this.submittedEmail.set(email);

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);

        this.success.set(
          'A verification code has been sent to your email.'
        );

        this.step.set('otp');
      },
      error: (error) => {
        this.loading.set(false);

        this.error.set(
          backendErrorMessage(
            error,
            'The reset code could not be sent.'
          )
        );
      },
    });
  }

  // Resend a new reset-password verification code.
  resendResetCode(): void {
    const email = this.submittedEmail();

    if (!email || this.resending()) {
      return;
    }

    this.resending.set(true);
    this.error.set(null);
    this.success.set(null);

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.resending.set(false);

        this.otpForm.reset();

        this.success.set(
          'A new verification code has been sent to your email.'
        );
      },
      error: (error) => {
        this.resending.set(false);

        this.error.set(
          backendErrorMessage(
            error,
            'The verification code could not be resent.'
          )
        );
      },
    });
  }

  // Step 2:
  // The backend validates the OTP together with the new password
  // in the final reset-password request.
  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.success.set(null);

    this.step.set('newPassword');
  }

  // Step 3:
  // Submit the OTP and the new password to the backend.
  submitNewPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } =
      this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { code } = this.otpForm.getRawValue();

    this.auth
      .resetPassword(
        this.submittedEmail(),
        code,
        newPassword,
        confirmPassword
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading.set(false);

          this.error.set(
            backendErrorMessage(
              error,
              'Reset failed. Please check the code and try again.'
            )
          );
        },
      });
  }
}
