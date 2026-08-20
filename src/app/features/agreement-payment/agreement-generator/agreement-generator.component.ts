import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CreateMembershipAgreementRequest,
  MembershipAgreement
} from '../models/membership-agreement.model';

import { MembershipAgreementService } from '../services/membership-agreement.service';

@Component({
  selector: 'app-agreement-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './agreement-generator.component.html',
  styleUrl: './agreement-generator.component.scss',
})
export class AgreementGeneratorComponent {

  agreementForm: FormGroup;

  generatedAgreement: MembershipAgreement | null = null;

  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private membershipAgreementService: MembershipAgreementService
  ) {
    this.agreementForm = this.formBuilder.group({
      membershipApplicationId: [
        '',
        Validators.required
      ],

      contributionSchedule: [
        '',
        Validators.required
      ],

      payoutSlot: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      startDate: [
        '',
        Validators.required
      ],

      expiryDate: [
        '',
        Validators.required
      ],
    });
  }

  generateAgreement(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.agreementForm.invalid) {
      this.agreementForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required agreement details.';

      return;
    }

    const formValue = this.agreementForm.value;

    if (
      new Date(formValue.startDate) >
      new Date(formValue.expiryDate)
    ) {
      this.errorMessage =
        'The start date cannot be later than the expiry date.';

      return;
    }

    const request: CreateMembershipAgreementRequest = {
      membershipApplicationId:
        formValue.membershipApplicationId,

      contributionSchedule:
        formValue.contributionSchedule,

      payoutSlot:
        Number(formValue.payoutSlot),

      startDate:
        formValue.startDate,

      expiryDate:
        formValue.expiryDate,
    };

    this.isSubmitting = true;

    this.membershipAgreementService
      .createAgreement(request)
      .subscribe({
        next: (agreement) => {

          this.generatedAgreement = agreement;

          this.successMessage =
            'Membership agreement generated successfully.';

          this.isSubmitting = false;
        },

        error: (error) => {

          this.isSubmitting = false;

          if (error.status === 400) {
            this.errorMessage =
              error.error?.message ??
              'The agreement information is invalid.';
          }

          else if (error.status === 404) {
            this.errorMessage =
              'The membership application was not found.';
          }

          else if (error.status === 409) {
            this.errorMessage =
              error.error?.message ??
              'An agreement already exists for this membership application.';
          }

          else {
            this.errorMessage =
              'An unexpected error occurred while generating the agreement.';
          }
        },
      });
  }

  resetForm(): void {

    this.agreementForm.reset();

    this.generatedAgreement = null;

    this.errorMessage = '';
    this.successMessage = '';
  }

  getAgreementStatusLabel(
    status: string | number
  ): string {

    if (typeof status === 'string') {
      return status;
    }

    switch (status) {
      case 0:
        return 'Pending';

      case 1:
        return 'Accepted';

      case 2:
        return 'Declined';

      case 3:
        return 'Expired';

      default:
        return 'Unknown';
    }
  }
}