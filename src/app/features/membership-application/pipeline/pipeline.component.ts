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
  AuthService,
} from '../../../core/services/auth.service';

import {
  Role,
} from '../../../core/models/role.model';


interface StageColumn {
  stage: MembershipApplicationStage;
  label: string;
}


/*
 * Circle information returned by:
 *
 * GET /api/circles
 *
 * We only need the fields required for
 * selecting an Applicant Pipeline.
 */
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
  {
    stage: 'Submitted',
    label: 'Submitted',
  },
  {
    stage: 'Shortlisted',
    label: 'Shortlisted',
  },
  {
    stage: 'VerificationScheduled',
    label: 'Verification Scheduled',
  },
  {
    stage: 'VerificationCompleted',
    label: 'Verification Completed',
  },
  {
    stage: 'AgreementExtended',
    label: 'Agreement Extended',
  },
  {
    stage: 'Confirmed',
    label: 'Confirmed',
  },
];


const PAGE_SIZE = 50;


@Component({
  selector: 'app-pipeline',

  standalone: true,

  imports: [
    CommonModule,
  ],

  templateUrl:
    './pipeline.component.html',

  styleUrl:
    './pipeline.component.scss',
})
export class PipelineComponent {

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private http =
    inject(HttpClient);

  private auth =
    inject(AuthService);

  private membershipApplicationService =
    inject(MembershipApplicationService);


  // =====================================================
  // Route / Listing
  // =====================================================

  /*
   * When coming from:
   *
   * /console/listings/:listingId/pipeline
   *
   * listingId will exist.
   *
   * When coming from sidebar:
   *
   * /console/pipeline
   *
   * listingId will be empty and we show
   * the circle/listing selector first.
   */
  listingId =
    this.route.snapshot
      .paramMap
      .get('listingId')
    ?? '';


  selectedCircleTitle =
    this.route.snapshot
      .queryParamMap
      .get('circleTitle')
    ?? '';


  // =====================================================
  // Pipeline Selector
  // =====================================================

  circles =
    signal<PipelineCircle[]>([]);


  /*
   * Only circles that actually have an active
   * marketplace listing can have an applicant
   * pipeline.
   */
  availablePipelineCircles =
    computed(() =>
      this.circles().filter(
        (circle) =>
          !!circle.marketplaceListing &&
          circle.marketplaceListing
            .listingStatus
            ?.toLowerCase()
            === 'active'
      )
    );


  get isPipelineSelector(): boolean {
    return !this.listingId;
  }


  // =====================================================
  // Pipeline State
  // =====================================================

  columns =
    STAGE_COLUMNS;


  applicants =
    signal<
      MembershipApplicationSummary[]
    >([]);


  isLoading =
    signal(true);


  errorMessage =
    signal<string | null>(
      null
    );


  /*
   * Tracks which applicant currently has
   * an action request in progress.
   */
  actionInFlightId =
    signal<string | null>(
      null
    );


  rejectedApplicants =
    computed(() =>
      this.applicants()
        .filter(
          (applicant) =>
            applicant.stage ===
            'Rejected'
        )
    );


  // =====================================================
  // Initialization
  // =====================================================

  constructor() {

    /*
     * Listing-specific route:
     *
     * /console/listings/:listingId/pipeline
     */
    if (this.listingId) {

      this.loadApplicants();

      return;
    }


    /*
     * Sidebar route:
     *
     * /console/pipeline
     *
     * Load available circles so Organizer/Admin
     * can choose which pipeline to open.
     */
    this.loadPipelineCircles();
  }


  // =====================================================
  // Role Helpers
  // =====================================================

  /*
   * According to the current Module 5 rules,
   * agreement generation belongs to Organizer.
   *
   * Admin may inspect the pipeline but should not
   * receive the Generate Agreement action.
   */
  get canGenerateAgreement(): boolean {

    return this.auth.hasRole(
      Role.Organizer
    );
  }


  // =====================================================
  // Load Available Pipeline Circles
  // =====================================================

  private loadPipelineCircles():
    void {

    this.isLoading.set(true);

    this.errorMessage.set(null);


    this.http
      .get<PipelineCircle[]>(
        `${environment.apiBase}/api/circles`
      )
      .subscribe({

        next: (circles) => {

          this.circles.set(
            circles ?? []
          );

          this.isLoading.set(false);
        },


        error: (error) => {

          this.isLoading.set(false);


          if (
            error.status === 401
            ||
            error.status === 403
          ) {

            this.errorMessage.set(
              'You do not have permission to view applicant pipelines.'
            );

            return;
          }


          this.errorMessage.set(
            'Unable to load the available circles.'
          );
        },
      });
  }


  // =====================================================
  // Open Selected Pipeline
  // =====================================================

  openPipeline(
    circle: PipelineCircle
  ): void {

    const listing =
      circle.marketplaceListing;


    if (!listing?.listingId) {

      return;
    }


    this.router.navigate(
      [
        '/console/listings',
        listing.listingId,
        'pipeline',
      ],
      {
        queryParams: {
          circleTitle:
            circle.circleTitle,
        },
      }
    );
  }


  // =====================================================
  // Back To Pipeline Selector
  // =====================================================

  backToPipelines(): void {

    this.router.navigate(
      [
        '/console/pipeline',
      ]
    );
  }


  // =====================================================
  // Applicant Stage Helpers
  // =====================================================

  applicantsForStage(
    stage:
      MembershipApplicationStage
  ):
    MembershipApplicationSummary[] {

    return this.applicants()
      .filter(
        (applicant) =>
          applicant.stage ===
          stage
      );
  }


  // =====================================================
  // Load Applicants
  // =====================================================

  private loadApplicants():
    void {

    if (!this.listingId) {

      this.errorMessage.set(
        'No listing was specified.'
      );

      this.isLoading.set(false);

      return;
    }


    this.isLoading.set(true);

    this.errorMessage.set(null);


    this.membershipApplicationService
      .getByListing(
        this.listingId,
        1,
        PAGE_SIZE
      )
      .subscribe({

        next: (result) => {

          this.applicants.set(
            result.items ?? []
          );

          this.isLoading.set(false);
        },


        error: (error) => {

          this.isLoading.set(false);


          if (
            error.status === 401
            ||
            error.status === 403
          ) {

            this.errorMessage.set(
              'You do not have permission to view this pipeline.'
            );

          } else if (
            error.status === 404
          ) {

            this.errorMessage.set(
              'This listing could not be found.'
            );

          } else {

            this.errorMessage.set(
              'An unexpected error occurred while loading applicants.'
            );
          }
        },
      });
  }


  // =====================================================
  // Shortlist Applicant
  // =====================================================

  shortlist(
    applicantId: string
  ): void {

    if (
      this.actionInFlightId()
    ) {

      return;
    }


    this.errorMessage.set(null);

    this.actionInFlightId.set(
      applicantId
    );


    this.membershipApplicationService
      .shortlist(
        applicantId
      )
      .subscribe({

        next: (updated) => {

          this.patchApplicantStage(
            applicantId,
            updated.stage
          );

          this.actionInFlightId.set(
            null
          );
        },


        error: () => {

          this.actionInFlightId.set(
            null
          );

          this.errorMessage.set(
            'Could not shortlist this applicant. Refresh and try again.'
          );
        },
      });
  }


  // =====================================================
  // Reject Applicant
  // =====================================================

  reject(
    applicantId: string
  ): void {

    if (
      this.actionInFlightId()
    ) {

      return;
    }


    this.errorMessage.set(null);

    this.actionInFlightId.set(
      applicantId
    );


    this.membershipApplicationService
      .reject(
        applicantId
      )
      .subscribe({

        next: (updated) => {

          this.patchApplicantStage(
            applicantId,
            updated.stage
          );

          this.actionInFlightId.set(
            null
          );
        },


        error: () => {

          this.actionInFlightId.set(
            null
          );

          this.errorMessage.set(
            'Could not reject this applicant. Refresh and try again.'
          );
        },
      });
  }


  // =====================================================
  // View Applicant Details
  // =====================================================

  viewDetails(
    applicantId: string
  ): void {

    this.router.navigate(
      [
        '/console/applicants',
        applicantId,
      ]
    );
  }


  // =====================================================
  // Update Applicant Locally
  // =====================================================

  private patchApplicantStage(
    applicantId: string,
    stage:
      MembershipApplicationStage
  ): void {

    this.applicants.update(
      (list) =>
        list.map(
          (applicant) =>
            applicant
              .membershipApplicationId
              === applicantId

              ? {
                  ...applicant,
                  stage,
                }

              : applicant
        )
    );
  }


  // =====================================================
  // Generate Agreement
  // =====================================================

  generateAgreement(
    membershipApplicationId:
      string
  ): void {

    if (
      !this.canGenerateAgreement
    ) {

      return;
    }


    this.router.navigate(
      [
        '/console/agreement-generator',
      ],
      {
        queryParams: {
          membershipApplicationId,
        },
      }
    );
  }
}