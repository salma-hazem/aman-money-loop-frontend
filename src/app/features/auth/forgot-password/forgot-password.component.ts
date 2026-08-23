import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, StepsModule, RouterLink],  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal<'email' | 'otp' | 'newPassword'>('email');
  loading = signal(false);
  error = signal<string | null>(null);
  submittedEmail = signal('');

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  otpForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
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
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      },
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    // الكود مش بيتأكد هنا لوحده، هيتأكد مع الباسورد الجديد في نفس الطلب
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

    this.auth.resetPassword(this.submittedEmail(), code, newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Reset failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}