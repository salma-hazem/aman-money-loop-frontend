import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { MembershipApplicationService } from '../services/membership-application.service';
import { ListingSummary } from '../models/membership-application.model';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.scss',
})
export class ApplyComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private membershipApplicationService = inject(MembershipApplicationService);
  private profileService = inject(ProfileService);

  listingId = '';

  // Only present if the previous page (marketplace / circle details) passed
  // it via router state — there's no listings endpoint yet to fetch this.
  listingSummary: ListingSummary | null = null;

  isLoggedIn = this.auth.isLoggedIn;

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01\d{9}$/)]],
    nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    confirmAccurate: [false, [Validators.requiredTrue]],
  });

  constructor() {
    this.listingId = this.route.snapshot.paramMap.get('listingId') ?? '';

    const state = this.router.getCurrentNavigation()?.extras.state
      ?? history.state;

    if (state?.['listingSummary']) {
      this.listingSummary = state['listingSummary'] as ListingSummary;
    }

    const currentUser = this.auth.currentUser();

    if (currentUser) {
      this.profileService.get().subscribe({
        next: (profile) => {
          this.form.patchValue({
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            email: profile.email,
            phone: profile.phoneNumber ?? '',
            nationalId: profile.nationalId ?? '',
          });

          this.form.controls.name.disable();
          this.form.controls.email.disable();
          this.form.controls.phone.disable();
          this.form.controls.nationalId.disable();
        },
        error: () => {
          // Fallback to the basic logged-in user information
          this.form.patchValue({
            name: currentUser.fullName,
            email: currentUser.email,
          });

          this.form.controls.name.disable();
          this.form.controls.email.disable();
        },
      });
    }
  }

  submit(): void {
    if (!this.listingId) {
      this.errorMessage.set('This application link is missing a circle reference.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const currentUser = this.auth.currentUser();
    const raw = this.form.getRawValue();

    this.membershipApplicationService
      .create({
        listingId: this.listingId,
        userId: currentUser?.id ?? null,
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        nationalId: raw.nationalId,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitted.set(true);
        },
        error: (error) => {
          this.isSubmitting.set(false);

          if (error.status === 400 || error.status === 404) {
            const body = error.error;
            let message: string | null = null;

            if (body?.errors) {
              // Validation error shape: { errors: { "Code": ["message"] } }
              const firstKey = Object.keys(body.errors)[0];
              message = body.errors[firstKey]?.[0] ?? null;
            } else if (body?.detail) {
              // Single error shape: { detail: "message" }
              message = body.detail;
            }

            this.errorMessage.set(
              message ?? 'Please check the details you entered.'
            );
          } else {
            this.errorMessage.set(
              'An unexpected error occurred. Please try again.'
            );
          }
        },
      });
  }
  goBack(): void {
    const isInsideConsole = this.router.url.startsWith('/console/');

    if (isInsideConsole) {
      this.router.navigate(['/console/marketplace', this.listingId]);
    } else {
      this.router.navigate(['/marketplace', this.listingId]);
    }
  }
}
