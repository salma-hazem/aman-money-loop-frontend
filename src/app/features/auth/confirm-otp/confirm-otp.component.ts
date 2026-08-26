import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/services/auth.service';
import { OTP_PATTERN, backendErrorMessage } from '../../../core/validators/account.validators';

@Component({
  selector: 'app-confirm-otp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './confirm-otp.component.html',
  styleUrl: './confirm-otp.component.scss',
})
export class ConfirmOtpComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  resending = signal(false);

  readonly userId =
    sessionStorage.getItem('registration_user_id');

  form = this.fb.nonNullable.group({
    otp: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(OTP_PATTERN),
      ],
    ],
  });

  submit(): void {
    if (!this.userId) {
      this.error.set(
        'Registration session was not found. Please register again.'
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .confirmOtp(
        this.userId,
        this.form.getRawValue().otp
      )
      .subscribe({
        next: () => {
          sessionStorage.removeItem(
            'registration_user_id'
          );

          this.success.set(
            'Email confirmed successfully. You can now sign in using your password.'
          );

          this.loading.set(false);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (err) => {
          this.error.set(
            err?.error?.detail ??
              'OTP confirmation failed. Please check the code and try again.'
          );

          this.loading.set(false);
        },
      });
  }

  resend(): void {
    if (!this.userId || this.resending()) return;
    this.resending.set(true);
    this.error.set(null);
    this.success.set(null);
    this.auth.resendRegistrationOtp(this.userId).subscribe({
      next: () => {
        this.resending.set(false);
        this.success.set('A new verification code has been sent to your email.');
      },
      error: (error) => {
        this.resending.set(false);
        this.error.set(backendErrorMessage(error, 'The verification code could not be resent.'));
      },
    });
  }
}
