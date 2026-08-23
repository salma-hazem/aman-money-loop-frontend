import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
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
export class AgreementResponseComponent
  implements OnInit {

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
    private membershipAgreementService:
      MembershipAgreementService
  ) {}

  ngOnInit(): void {
    this.agreementId =
      this.route.snapshot.queryParamMap.get(
        'agreementId'
      ) ?? '';

    this.token =
      this.route.snapshot.queryParamMap.get(
        'token'
      ) ?? '';

    if (!this.agreementId || !this.token) {
      this.errorMessage =
        'The agreement link is invalid.';

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

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Unable to load the membership agreement.'
            );
        },
      });
  }

  acceptAgreement(): void {
    if (
      !this.hasReviewed ||
      this.isSubmitting ||
      !this.agreement ||
      !this.isAgreementPending()
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
            'Agreement accepted successfully. Your onboarding process has now started.';

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
      !this.agreement ||
      !this.isAgreementPending()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to decline this membership agreement?'
      );

    if (!confirmed) {
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
            'The membership agreement has been declined.';

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

  getStatusClass(): string {
    if (!this.agreement) {
      return '';
    }

    return this
      .getAgreementStatusLabel(
        this.agreement.status
      )
      .toLowerCase();
  }

  isAgreementPending(): boolean {
    if (!this.agreement) {
      return false;
    }

    return (
      this.getAgreementStatusLabel(
        this.agreement.status
      ) === 'Pending'
    );
  }

  isAgreementAccepted(): boolean {
    return (
      this.agreement !== null &&
      this.getAgreementStatusLabel(
        this.agreement.status
      ) === 'Accepted'
    );
  }

  isAgreementDeclined(): boolean {
    return (
      this.agreement !== null &&
      this.getAgreementStatusLabel(
        this.agreement.status
      ) === 'Declined'
    );
  }

  isAgreementExpired(): boolean {
    return (
      this.agreement !== null &&
      this.getAgreementStatusLabel(
        this.agreement.status
      ) === 'Expired'
    );
  }

  private handleResponseError(
    error: any
  ): void {
    this.isSubmitting = false;

    this.errorMessage =
      this.getBackendErrorMessage(
        error,
        'The agreement could not be updated. Please try again.'
      );
  }

  private getBackendErrorMessage(
    error: any,
    fallback: string
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

    if (error.status === 401) {
      return 'The agreement link is invalid or no longer authorized.';
    }

    if (error.status === 404) {
      return 'The membership agreement was not found.';
    }

    if (error.status === 409) {
      return 'This agreement can no longer be changed.';
    }

    return fallback;
  }
}