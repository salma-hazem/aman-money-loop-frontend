import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationChecklistService } from '../../Services/checklist.service';
import { VerificationRoundService } from '../../Services/round.service';
import { VerificationScheduleService } from '../../Services/schedule.service';
import {
  CreateVerificationChecklistSubmission,
  CreateVerificationCriterionRating,
} from '../../Models/checklist.model';
import { ScheduleStatus } from '../../Models/schedule.model';
import { MembershipApplicationService } from '../../../membership-application/services/membership-application.service';
import { AuthService } from '../../../../core/services/auth.service';

interface CriterionRatingRow {
  verificationCriterionId: string;
  criterionName: string;
  weight: number;
  rating: number;
  comments?: string;
}

// Backend serializes ScheduleStatus as its numeric enum value, not the name.
// Order must exactly match MonyLoop.Domain.Constants.Verification.ScheduleStatus.
const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [ScheduleStatus.Pending]: 'Pending',
  [ScheduleStatus.Scheduled]: 'Scheduled',
  [ScheduleStatus.Completed]: 'Completed',
  [ScheduleStatus.Cancelled]: 'Cancelled',
};

@Component({
  selector: 'app-verification-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class VerificationChecklistComponent implements OnInit {
  @Input() scheduleId: string = '';

  roundTitle: string = '';
  memberName: string = '';
  status: string = '';
  loadError: string = '';

  criteriaRows: CriterionRatingRow[] = [];
  reviewerComments: string = '';

  isSubmitting: boolean = false;
  calculatedCompositeScore: number | null = null;

  constructor(
    private checklistService: VerificationChecklistService,
    private roundService: VerificationRoundService,
    private scheduleService: VerificationScheduleService,
    private applicationService: MembershipApplicationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (!this.scheduleId) {
      this.scheduleId = this.route.snapshot.paramMap.get('scheduleId') || '';
    }

    if (!this.scheduleId) {
      this.loadError = 'Missing schedule ID — open this page from a scheduled verification.';
      return;
    }

    this.loadChecklistContext(this.scheduleId);
  }

  private loadChecklistContext(scheduleId: string): void {
    this.scheduleService.getScheduleById(scheduleId).subscribe({
      next: (schedule) => {
        if (typeof schedule.status === 'string') {
          this.status = schedule.status;
        } else {
          this.status = SCHEDULE_STATUS_LABELS[schedule.status] ?? '';
        }

        this.roundService.getRoundById(schedule.verificationRoundId).subscribe({
          next: (round) => {
            this.roundTitle = round.roundName;
            this.criteriaRows = round.criteria
              .filter((c) => c.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((c) => ({
                verificationCriterionId: c.verificationCriterionId,
                criterionName: c.criterionName,
                weight: c.weight,
                rating: 0,
              }));

            this.loadExistingSubmission(scheduleId);
          },
          error: (err) => console.error('Error loading verification round:', err)
        });

        this.applicationService.getById(schedule.applicationId).subscribe({
          next: (app) => (this.memberName = app.name),
          error: (err) => console.error('Error loading applicant:', err)
        });
      },
      error: (err) => {
        console.error('Error loading verification schedule:', err);
        this.loadError = 'Could not load this verification schedule.';
      }
    });
  }

  private loadExistingSubmission(scheduleId: string): void {
    this.checklistService.getSubmissionBySchedule(scheduleId).subscribe({
      next: (data) => {
        if (!data) return;

        this.reviewerComments = data.overallComments || '';
        this.calculatedCompositeScore = data.compositeScore;

        data.criterionRatings?.forEach((item) => {
          const row = this.criteriaRows.find(
            (r) => r.verificationCriterionId === item.verificationCriterionId
          );
          if (row) {
            row.rating = item.rating;
            row.comments = item.comments;
          }
        });
      },
      // No prior submission yet is expected, not an error worth surfacing.
      error: () => { }
    });
  }

  setRating(criterionId: string, score: number): void {
    const row = this.criteriaRows.find((r) => r.verificationCriterionId === criterionId);
    if (row) {
      row.rating = score;
    }
  }

  onSubmitChecklist(): void {
    if (!this.scheduleId) {
      alert('Missing Schedule ID!');
      return;
    }

    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) {
      alert('You must be logged in to submit a checklist.');
      return;
    }

    if (this.criteriaRows.length === 0) {
      alert('No criteria loaded for this round yet.');
      return;
    }

    if (this.criteriaRows.some((r) => r.rating < 1)) {
      alert('Please rate every criterion before submitting.');
      return;
    }

    this.isSubmitting = true;

    const payload: CreateVerificationChecklistSubmission = {
      verificationScheduleId: this.scheduleId,
      submittedByUserId: currentUserId,
      overallComments: this.reviewerComments,
      ratings: this.criteriaRows.map((row): CreateVerificationCriterionRating => ({
        verificationCriterionId: row.verificationCriterionId,
        rating: row.rating,
        comments: row.comments
      }))
    };

    this.checklistService.submitChecklist(payload).subscribe({
      next: (response) => {
        this.calculatedCompositeScore = response.compositeScore;
        alert('Checklist submitted successfully!');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.isSubmitting = false;
      }
    });
  }
}
