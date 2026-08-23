import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  CreateMembershipAgreementRequest,
  MembershipAgreement,
} from '../models/membership-agreement.model';

import {
  MembershipAgreementService,
} from '../services/membership-agreement.service';

import {
  MembershipApplicationService,
} from '../../membership-application/services/membership-application.service';

import {
  MembershipApplicationDetail,
} from '../../membership-application/models/membership-application.model';

@Component({
  selector: 'app-agreement-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './agreement-generator.component.html',
  styleUrl: './agreement-generator.component.scss',
})
export class AgreementGeneratorComponent
  implements OnInit {

  agreementForm: FormGroup;

  membershipApplication:
    MembershipApplicationDetail | null = null;

  generatedAgreement:
    MembershipAgreement | null = null;

  membershipApplicationId: string | null = null;

  isLoadingApplication = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private membershipApplicationService:
      MembershipApplicationService,
    private membershipAgreementService:
      MembershipAgreementService
  ) {
    this.agreementForm =
      this.formBuilder.group({
        contributionSchedule: [
          '',
          Validators.required,
        ],

        payoutSlot: [
          null,
          [
            Validators.required,
            Validators.min(1),
          ],
        ],

        startDate: [
          '',
          Validators.required,
        ],

        expiryDate: [
          '',
          Validators.required,
        ],
      });
  }

  ngOnInit(): void {
    this.membershipApplicationId =
      this.route.snapshot.queryParamMap.get(
        'membershipApplicationId'
      );

    if (!this.membershipApplicationId) {
      this.errorMessage =
        'No membership application was selected. Please open the agreement generator from the applicant pipeline.';

      return;
    }

    this.loadMembershipApplication();
  }

  private loadMembershipApplication(): void {
    if (!this.membershipApplicationId) {
      return;
    }

    this.isLoadingApplication = true;
    this.errorMessage = '';

    this.membershipApplicationService
      .getById(this.membershipApplicationId)
      .subscribe({
        next: (application) => {
          this.membershipApplication =
            application;

          this.isLoadingApplication = false;

          if (
            application.stage !==
            'VerificationCompleted'
          ) {
            this.errorMessage =
              'An agreement can only be generated for an applicant whose verification has been completed.';
          }
        },

        error: (error) => {
          this.isLoadingApplication = false;

          if (error.status === 404) {
            this.errorMessage =
              'The selected membership application was not found.';
          } else if (error.status === 403) {
            this.errorMessage =
              'You do not have permission to access this membership application.';
          } else {
            this.errorMessage =
              'Unable to load the selected membership application.';
          }
        },
      });
  }

  generateAgreement(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.membershipApplication ||
      !this.membershipApplicationId
    ) {
      this.errorMessage =
        'A valid membership application must be selected first.';

      return;
    }

    if (
      this.membershipApplication.stage !==
      'VerificationCompleted'
    ) {
      this.errorMessage =
        'The applicant must complete verification before an agreement can be generated.';

      return;
    }

    if (this.agreementForm.invalid) {
      this.agreementForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required agreement details.';

      return;
    }

    const formValue =
      this.agreementForm.getRawValue();

    const startDate =
      new Date(formValue.startDate);

    const expiryDate =
      new Date(formValue.expiryDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (expiryDate <= today) {
      this.errorMessage =
        'Agreement expiry date must be a future date.';

      return;
    }

    if (startDate > expiryDate) {
      this.errorMessage =
        'The start date cannot be later than the expiry date.';

      return;
    }

    const request:
      CreateMembershipAgreementRequest = {
        membershipApplicationId:
          this.membershipApplicationId,

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
          this.generatedAgreement =
            agreement;

          this.successMessage =
            'Membership agreement generated and sent successfully.';

          this.isSubmitting = false;
        },

        error: (error) => {
          this.isSubmitting = false;

          this.errorMessage =
            this.getBackendErrorMessage(
              error
            );
        },
      });
  }

  resetForm(): void {
    this.agreementForm.reset();

    this.generatedAgreement = null;

    this.errorMessage = '';
    this.successMessage = '';
  }

  backToPipeline(): void {
    if (!this.membershipApplication) {
      return;
    }

    this.router.navigate([
      '/console/listings',
      this.membershipApplication.listingId,
      'pipeline',
    ]);
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

  private getBackendErrorMessage(
    error: any
  ): string {
    const errors =
      error?.error?.errors;

    if (errors) {
      const messages =
        Object.values(errors)
          .flat() as string[];

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    if (error?.error?.detail) {
      return error.error.detail;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error.status === 400) {
      return 'The agreement information is invalid.';
    }

    if (error.status === 403) {
      return 'You do not have permission to generate this agreement.';
    }

    if (error.status === 404) {
      return 'The membership application or related circle was not found.';
    }

    if (error.status === 409) {
      return 'An agreement already exists for this membership application.';
    }

    return 'An unexpected error occurred while generating the agreement.';
  }
}