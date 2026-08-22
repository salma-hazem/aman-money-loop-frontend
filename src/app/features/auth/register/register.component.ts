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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nationalId: ['', Validators.required],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],

    phoneNumber: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .register(this.form.getRawValue())
      .subscribe({
        next: (userId) => {
          sessionStorage.setItem(
            'registration_user_id',
            userId
          );

          this.router.navigate([
            '/confirm-otp',
          ]);
        },

        error: (err) => {
          this.error.set(
            err?.error?.detail ??
              'Registration failed. Please try again.'
          );

          this.loading.set(false);
        },
      });
  }
}