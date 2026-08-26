import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { backendErrorMessage, passwordStrengthValidator } from '../../../core/validators/account.validators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly mustChangePassword = this.auth.currentUser()?.mustChangePassword ?? false;

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), passwordStrengthValidator()]],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      this.error.set('The new password must be different from the current password.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.auth.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.auth.markPasswordChanged();
        this.router.navigate(['/console/profile']);
      },
      error: (error) => {
        this.error.set(backendErrorMessage(error, 'Password could not be changed. Please try again.'));
        this.loading.set(false);
      },
    });
  }
}
