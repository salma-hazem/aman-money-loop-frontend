import { CommonModule } from '@angular/common';

import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { environment } from '../../../../environments/environment';

import {
  MembershipApplicationService,
} from '../services/membership-application.service';

import {
  MembershipApplicationStage,
  MembershipApplicationSummary,
} from '../models/membership-application.model';

import {
  MarketplaceListingService,
} from '../services/marketplace-listing.service';

import {
  MarketplaceListingStatus,
} from '../models/marketplace-listing.model';

import {
  AuthService,
} from '../../../core/services/auth.service';

import {
  Role,
} from '../../../core/models/role.model';


interface StageColumn {
  stage: MembershipApplicationStage;
  label: string;
}


interface PipelineCircle {
  circleId: string;
  requestId: string;
  circleTitle: string;
  approvedSlots: number;
  filledCount: number;
  amount: number;
  duration: number;
  status: string;

  marketplaceListing: {
    listingId: string;
    circleId: string;
    listingStatus: string;
  } | null;
}


const STAGE_COLUMNS: StageColumn[] = [
  { stage: 'Submitted', label: 'Submitted' },
  { stage: 'Shortlisted', label: 'Shortlisted' },
  { stage: 'VerificationScheduled', label: 'Verification Scheduled' },
  { stage: 'VerificationCompleted', label: 'Verification Completed' },
  { stage: 'AgreementExtended', label: 'Agreement Extended' },
  { stage: 'Confirmed', label: 'Confirmed' },
];


/*
 * The backend serializes MembershipApplicationStage as its numeric
 * enum value (0-6), not the string name, even though our TypeScript
 * model types it as a string union. This maps the numeric value back
 * to the matching string so the rest of the component can compare
 * safely. Order must exactly match
 * MonyLoop.Domain.Constants.MembershipApplicationStage.
 */
const STAGE_NAMES: MembershipApplicationStage[] = [
  'Submitted',
  'Shortlisted',
  'VerificationScheduled',
  'VerificationCompleted',
  'AgreementExtended',
  'Confirmed',
  'Rejected',
];

function normalizeStage(
  stage: MembershipApplicationStage | number
): MembershipApplicationStage {
  return typeof stage === 'number' ? STAGE_NAMES[stage] : stage;
}


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
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private membershipApplicationService = inject(MembershipApplicationService);
  private marketplaceListingService = inject(MarketplaceListingService);

  listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
  selectedCircleTitle = this.route.snapshot.queryParamMap.get('circleTitle') ?? '';

  circles = signal<PipelineCircle[]>([]);

  // Shows every circle that has a listing at all, regardless of status,
  // so organizers can manage (close/reopen) as well as open a pipeline.
  availablePipelineCircles = computed(() =>
    this.circles().filter((circle) => !!circle.marketplaceListing)
  );

  get isPipelineSelector(): boolean {
    return !this.listingId;
  }

  columns = STAGE_COLUMNS;

  applicants = signal<MembershipApplicationSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  actionInFlightId = signal<string | null>(null);

  rejectedApplicants = computed(() =>
    this.applicants().filter((applicant) => applicant.stage === 'Rejected')
  );

  constructor() {
    if (this.listingId) {
      this.loadApplicants();
      return;
    }

    this.loadPipelineCircles();
  }

  get canGenerateAgreement(): boolean {
    return this.auth.hasRole(Role.Organizer);
  }

  private loadPipelineCircles(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get<PipelineCircle[]>(`${environment.apiBase}/api/circles`).subscribe({
      next: (circles) => {
        this.circles.set(circles ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('You do not have permission to view applicant pipelines.');
          return;
        }

        this.errorMessage.set('Unable to load the available circles.');
      },
    });
  }

  openPipeline(circle: PipelineCircle): void {
    const listing = circle.marketplaceListing;
    if (!listing?.listingId) {
      return;
    }

    this.router.navigate(['/console/listings', listing.listingId, 'pipeline'], {
      queryParams: { circleTitle: circle.circleTitle },
    });
  }

  closeListing(circle: PipelineCircle): void {
    this.changeListingStatus(circle, 'Cancelled');
  }

  reopenListing(circle: PipelineCircle): void {
    this.changeListingStatus(circle, 'Active');
  }

  private changeListingStatus(circle: PipelineCircle, status: MarketplaceListingStatus): void {
    const listingId = circle.marketplaceListing?.listingId;
    if (!listingId || this.actionInFlightId()) {
      return;
    }

    this.actionInFlightId.set(listingId);
    this.errorMessage.set(null);

    this.marketplaceListingService.updateStatus(listingId, status).subscribe({
      next: (updated) => {
        this.circles.update((list) =>
          list.map((c) =>
            c.circleId === circle.circleId
              ? {
                ...c,
                marketplaceListing: {
                  ...c.marketplaceListing!,
                  listingStatus: updated.listingStatus,
                },
              }
              : c
          )
        );
        this.actionInFlightId.set(null);
      },
      error: () => {
        this.actionInFlightId.set(null);
        this.errorMessage.set('Could not update this listing. Refresh and try again.');
      },
    });
  }

  backToPipelines(): void {
    this.router.navigate(['/console/pipeline']);
  }

  applicantsForStage(stage: MembershipApplicationStage): MembershipApplicationSummary[] {
    return this.applicants().filter((applicant) => applicant.stage === stage);
  }

  private loadApplicants(): void {
    if (!this.listingId) {
      this.errorMessage.set('No listing was specified.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.membershipApplicationService.getByListing(this.listingId, 1, PAGE_SIZE).subscribe({
      next: (result) => {
        this.applicants.set(
          (result.items ?? []).map((applicant) => ({
            ...applicant,
            stage: normalizeStage(applicant.stage),
          }))
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set('You do not have permission to view this pipeline.');
        } else if (error.status === 404) {
          this.errorMessage.set('This listing could not be found.');
        } else {
          this.errorMessage.set('An unexpected error occurred while loading applicants.');
        }
      },
    });
  }

  shortlist(applicantId: string): void {
    if (this.actionInFlightId()) {
      return;
    }

    this.errorMessage.set(null);
    this.actionInFlightId.set(applicantId);

    this.membershipApplicationService.shortlist(applicantId).subscribe({
      next: (updated) => {
        this.patchApplicantStage(applicantId, normalizeStage(updated.stage));
        this.actionInFlightId.set(null);
      },
      error: () => {
        this.actionInFlightId.set(null);
        this.errorMessage.set('Could not shortlist this applicant. Refresh and try again.');
      },
    });
  }

  reject(applicantId: string): void {
    if (this.actionInFlightId()) {
      return;
    }

    this.errorMessage.set(null);
    this.actionInFlightId.set(applicantId);

    this.membershipApplicationService.reject(applicantId).subscribe({
      next: (updated) => {
        this.patchApplicantStage(applicantId, normalizeStage(updated.stage));
        this.actionInFlightId.set(null);
      },
      error: () => {
        this.actionInFlightId.set(null);
        this.errorMessage.set('Could not reject this applicant. Refresh and try again.');
      },
    });
  }

  viewDetails(applicantId: string): void {
    this.router.navigate(['/console/applicants', applicantId]);
  }
  scheduleVerification(applicantId: string): void {
    this.router.navigate(['/console/applicants', applicantId], {
      queryParams: { schedule: 'true' },
    });
  }

  private patchApplicantStage(
    applicantId: string,
    stage: MembershipApplicationStage
  ): void {
    this.applicants.update((list) =>
      list.map((applicant) =>
        applicant.membershipApplicationId === applicantId
          ? { ...applicant, stage }
          : applicant
      )
    );
  }

  generateAgreement(membershipApplicationId: string): void {
    if (!this.canGenerateAgreement) {
      return;
    }

    this.router.navigate(['/console/agreement-generator'], {
      queryParams: { membershipApplicationId },
    });
  }
}
