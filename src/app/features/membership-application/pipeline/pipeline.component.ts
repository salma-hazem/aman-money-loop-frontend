import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MembershipApplicationService } from '../services/membership-application.service';
import {
  MembershipApplicationStage,
  MembershipApplicationSummary,
} from '../models/membership-application.model';

interface StageColumn {
  stage: MembershipApplicationStage;
  label: string;
}

const STAGE_COLUMNS: StageColumn[] = [
  { stage: 'Submitted', label: 'Submitted' },
  { stage: 'Shortlisted', label: 'Shortlisted' },
  { stage: 'VerificationScheduled', label: 'Verification Scheduled' },
  { stage: 'VerificationCompleted', label: 'Verification Completed' },
  { stage: 'AgreementExtended', label: 'Agreement Extended' },
  { stage: 'Confirmed', label: 'Confirmed' },
];

const PAGE_SIZE = 50;

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline.component.html',
  styleUrl: './pipeline.component.scss',
})
export class PipelineComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private membershipApplicationService = inject(MembershipApplicationService);

  listingId = this.route.snapshot.paramMap.get('listingId') ?? '';

  columns = STAGE_COLUMNS;

  applicants = signal<MembershipApplicationSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Tracks which applicant id currently has a shortlist/reject request in flight,
  // so we can disable just that card's buttons instead of the whole board.
  actionInFlightId = signal<string | null>(null);

  rejectedApplicants = computed(() =>
    this.applicants().filter((a) => a.stage === 'Rejected')
  );

  constructor() {
    this.loadApplicants();
  }

  applicantsForStage(stage: MembershipApplicationStage): MembershipApplicationSummary[] {
    return this.applicants().filter((a) => a.stage === stage);
  }

  private loadApplicants(): void {
    if (!this.listingId) {
      this.errorMessage.set('No listing was specified.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.membershipApplicationService
      .getByListing(this.listingId, 1, PAGE_SIZE)
      .subscribe({
        next: (result) => {
          this.applicants.set(result.items);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);

          if (error.status === 401 || error.status === 403) {
            this.errorMessage.set(
              'You do not have permission to view this pipeline.'
            );
          } else if (error.status === 404) {
            this.errorMessage.set('This listing could not be found.');
          } else {
            this.errorMessage.set(
              'An unexpected error occurred while loading applicants.'
            );
          }
        },
      });
  }

  shortlist(applicantId: string): void {
    if (this.actionInFlightId()) {
      return;
    }

    this.actionInFlightId.set(applicantId);

    this.membershipApplicationService.shortlist(applicantId).subscribe({
      next: (updated) => {
        this.patchApplicantStage(applicantId, updated.stage);
        this.actionInFlightId.set(null);
      },
      error: () => {
        this.actionInFlightId.set(null);
        this.errorMessage.set(
          'Could not shortlist this applicant. Refresh and try again.'
        );
      },
    });
  }

  reject(applicantId: string): void {
    if (this.actionInFlightId()) {
      return;
    }

    this.actionInFlightId.set(applicantId);

    this.membershipApplicationService.reject(applicantId).subscribe({
      next: (updated) => {
        this.patchApplicantStage(applicantId, updated.stage);
        this.actionInFlightId.set(null);
      },
      error: () => {
        this.actionInFlightId.set(null);
        this.errorMessage.set(
          'Could not reject this applicant. Refresh and try again.'
        );
      },
    });
  }

  viewDetails(applicantId: string): void {
    this.router.navigate(['/console/applicants', applicantId]);
  }

  private patchApplicantStage(
    applicantId: string,
    stage: MembershipApplicationStage
  ): void {
    this.applicants.update((list) =>
      list.map((a) =>
        a.membershipApplicationId === applicantId ? { ...a, stage } : a
      )
    );
  }

  generateAgreement(
    membershipApplicationId: string
  ): void {
    this.router.navigate(
      ['/console/agreement-generator'],
      {
        queryParams: {
          membershipApplicationId,
        },
      }
    );
  }
}
