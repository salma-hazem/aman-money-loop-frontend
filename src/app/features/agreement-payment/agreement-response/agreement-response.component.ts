import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MembershipAgreement } from '../models/membership-agreement.model';
import { MembershipAgreementService } from '../services/membership-agreement.service';

@Component({
  selector: 'app-agreement-response',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agreement-response.component.html',
  styleUrl: './agreement-response.component.scss',
})
export class AgreementResponseComponent implements OnInit {
  agreement: MembershipAgreement | null = null;

  agreementId = '';
  token = '';

  isLoading = true;
  isSubmitting = false;

  hasReviewed = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private membershipAgreementService: MembershipAgreementService
  ) {}

  ngOnInit(): void {
    this.agreementId =
      this.route.snapshot.queryParamMap.get('agreementId') ?? '';

    this.token =
      this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.agreementId || !this.token) {
      this.errorMessage = 'The agreement link is invalid.';
      this.isLoading = false;
      return;
    }

    this.loadAgreement();
  }

  private loadAgreement(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.membershipAgreementService
      .getAgreementForResponse(
        this.agreementId,
        this.token
      )
      .subscribe({
        next: (agreement) => {
          this.agreement = agreement;
          this.isLoading = false;
        },

        error: (error) => {
          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage =
              'The agreement link is invalid.';
          } else if (error.status === 409) {
            this.errorMessage =
              error.error?.message ??
              'This agreement can no longer be accessed.';
          } else if (error.status === 404) {
            this.errorMessage =
              'The membership agreement was not found.';
          } else {
            this.errorMessage =
              'An unexpected error occurred while loading the agreement.';
          }
        },
      });
  }

  acceptAgreement(): void {
    if (
      !this.hasReviewed ||
      this.isSubmitting ||
      !this.agreement
    ) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.membershipAgreementService
      .acceptAgreement(
        this.agreementId,
        this.token
      )
      .subscribe({
        next: (agreement) => {
          this.agreement = agreement;

          this.successMessage =
            'The agreement has been accepted successfully.';

          this.isSubmitting = false;
        },

        error: (error) => {
          this.handleResponseError(error);
        },
      });
  }

  declineAgreement(): void {
    if (
      this.isSubmitting ||
      !this.agreement
    ) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.membershipAgreementService
      .declineAgreement(
        this.agreementId,
        this.token
      )
      .subscribe({
        next: (agreement) => {
          this.agreement = agreement;

          this.successMessage =
            'The agreement has been declined.';

          this.isSubmitting = false;
        },

        error: (error) => {
          this.handleResponseError(error);
        },
      });
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

  isAgreementPending(): boolean {
    if (!this.agreement) {
      return false;
    }

    const status =
      this.getAgreementStatusLabel(
        this.agreement.status
      );

    return status === 'Pending';
  }

  private handleResponseError(error: any): void {
    this.isSubmitting = false;

    if (error.status === 401) {
      this.errorMessage =
        'The agreement link is invalid.';
    } else if (error.status === 404) {
      this.errorMessage =
        'The membership agreement was not found.';
    } else if (error.status === 409) {
      this.errorMessage =
        error.error?.message ??
        'The agreement can no longer be changed.';
    } else {
      this.errorMessage =
        'An unexpected error occurred. Please try again.';
    }
  }
}