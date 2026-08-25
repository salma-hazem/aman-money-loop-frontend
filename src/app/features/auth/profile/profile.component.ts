import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { EGYPTIAN_PHONE_PATTERN, OTP_PATTERN, backendErrorMessage } from '../../../core/validators/account.validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly emailStep = signal<'idle' | 'code'>('idle');
  readonly emailActionLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: [{ value: '', disabled: true }],
    phoneNumber: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    nationalId: [{ value: '', disabled: true }],
  });
  readonly emailForm = this.fb.nonNullable.group({
    newEmail: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
  });
  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(OTP_PATTERN)]],
  });

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.profileService.get().subscribe({
      next: (profile) => {
        this.profileForm.reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber ?? '',
          nationalId: profile.nationalId ?? 'Not provided',
        });
        this.auth.updateCurrentUserFromProfile(profile);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(backendErrorMessage(error, 'Your profile could not be loaded.'));
        this.isLoading.set(false);
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const value = this.profileForm.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.profileService.update({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phoneNumber: value.phoneNumber.trim(),
    }).subscribe({
      next: (profile) => {
        this.auth.updateCurrentUserFromProfile(profile);
        this.isSaving.set(false);
        this.successMessage.set('Profile information updated successfully.');
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(backendErrorMessage(error, 'Your profile could not be updated.'));
      },
    });
  }

  requestEmailChange(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.emailActionLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.profileService.requestEmailChange(this.emailForm.getRawValue().newEmail).subscribe({
      next: () => {
        this.emailActionLoading.set(false);
        this.emailStep.set('code');
        this.successMessage.set('A confirmation code was sent to your new email address.');
      },
      error: (error) => {
        this.emailActionLoading.set(false);
        this.errorMessage.set(backendErrorMessage(error, 'The email change could not be requested.'));
      },
    });
  }

  confirmEmailChange(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.emailActionLoading.set(true);
    this.errorMessage.set(null);
    this.profileService.confirmEmailChange(this.codeForm.getRawValue().code).subscribe({
      next: (profile) => {
        this.auth.updateCurrentUserFromProfile(profile);
        this.profileForm.controls.email.setValue(profile.email);
        this.emailStep.set('idle');
        this.emailForm.reset();
        this.codeForm.reset();
        this.emailActionLoading.set(false);
        this.successMessage.set('Email address changed successfully.');
      },
      error: (error) => {
        this.emailActionLoading.set(false);
        this.errorMessage.set(backendErrorMessage(error, 'The confirmation code is invalid or expired.'));
      },
    });
  }
}

