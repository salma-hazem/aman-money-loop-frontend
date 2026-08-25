import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { InternalUser } from '../../../core/models/account.model';
import { Role } from '../../../core/models/role.model';
import { AdminUserService } from '../../../core/services/admin-user.service';
import {
  EGYPTIAN_PHONE_PATTERN,
  NATIONAL_ID_PATTERN,
  backendErrorMessage,
} from '../../../core/validators/account.validators';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdminUserService);

  readonly Role = Role;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly createdUser = signal<InternalUser | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    nationalId: ['', Validators.pattern(NATIONAL_ID_PATTERN)],
    role: this.fb.nonNullable.control<Role.Admin | Role.Organizer>(Role.Organizer, Validators.required),
  });

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.createdUser.set(null);
    this.service.create({
      ...value,
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      phoneNumber: value.phoneNumber.trim(),
      nationalId: value.nationalId.trim() || null,
    }).subscribe({
      next: (user) => {
        this.createdUser.set(user);
        this.isSubmitting.set(false);
        this.form.reset({ role: Role.Organizer });
      },
      error: (error) => {
        this.errorMessage.set(backendErrorMessage(error, 'The internal user could not be created.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
