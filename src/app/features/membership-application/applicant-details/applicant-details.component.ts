import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MembershipApplicationService } from '../services/membership-application.service';
import { VerificationService } from '../services/verification.service';
import { VerificationChecklistService } from '../../Verification/Services/checklist.service';
import { ApplicationVerificationSummary } from '../../Verification/Models/checklist.model';
import {
  MembershipApplicationDetail,
  normalizeStage,
} from '../models/membership-application.model';
import {
  VerificationRound,
  VerificationSchedule,
} from '../models/verification.model';

@Component({
  selector: 'app-applicant-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './applicant-details.component.html',
  styleUrl: './applicant-details.component.scss',
})
export class ApplicantDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private membershipApplicationService = inject(MembershipApplicationService);
  private verificationService = inject(VerificationService);
  private checklistService = inject(VerificationChecklistService);

  applicationId = this.route.snapshot.paramMap.get('id') ?? '';
  openScheduleOnLoad =
    this.route.snapshot.queryParamMap.get('schedule') === 'true';
  applicant = signal<MembershipApplicationDetail | null>(null);
  activeSchedule = signal<VerificationSchedule | null>(null);
  availableRounds = signal<VerificationRound[]>([]);
  historySummary = signal<ApplicationVerificationSummary | null>(null);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  actionInProgress = signal(false);
  actionError = signal<string | null>(null);

  schedulePanelOpen = signal(false);
  isLoadingRounds = signal(false);
  isSubmittingSchedule = signal(false);
  scheduleError = signal<string | null>(null);

  isLoadingHistory = signal(false);
  historyError = signal<string | null>(null);
  historyPanelOpen = signal(false);

  // Property to restrict calendar date picking to today or future
  minDate = new Date().toISOString().split('T')[0];

  scheduleForm = this.fb.nonNullable.group({
    verificationRoundId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    locationLink: [''],
    videoLink: [''],
    sendCalendarInvite: [true]
  });

  constructor() {
    this.load();
  }

  ngOnInit(): void {
    // Dynamically update validators based on the selected round format
    this.scheduleForm.get('verificationRoundId')?.valueChanges.subscribe(() => {
      const format = this.selectedRoundFormat();
      const locationControl = this.scheduleForm.get('locationLink');
      const videoControl = this.scheduleForm.get('videoLink');

      locationControl?.clearValidators();
      videoControl?.clearValidators();

      if (format === 'InPerson') {
        locationControl?.setValidators(Validators.required);
      } else if (format === 'Video') {
        videoControl?.setValidators(Validators.required);
      }

      locationControl?.updateValueAndValidity();
      videoControl?.updateValueAndValidity();
    });
  }

  private load(): void {
    if (!this.applicationId) {
      this.errorMessage.set('No applicant was specified.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      applicant: this.membershipApplicationService.getById(this.applicationId),
      schedules: this.verificationService.getSchedulesByApplication(
        this.applicationId
      ),
    }).subscribe({
      next: ({ applicant, schedules }) => {
        const normalizedStage = normalizeStage(applicant.stage);

        this.applicant.set({
          ...applicant,
          stage: normalizedStage,
        });

        const active = schedules
          .filter((s) => s.status !== 'Cancelled')
          .sort((a, b) => (a.date < b.date ? 1 : -1))[0];

        this.activeSchedule.set(active ?? null);

        this.isLoading.set(false);

        // Fetch verification history across all rounds
        this.loadHistory();

        if (
          this.openScheduleOnLoad &&
          normalizedStage === 'Shortlisted' &&
          !active
        ) {
          this.openSchedulePanel();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load applicant details.');
      }
    });
  }

  loadHistory(): void {
    if (!this.applicationId) return;

    this.isLoadingHistory.set(true);
    this.historyError.set(null);

    this.checklistService.getApplicationConsolidatedSummary(this.applicationId).subscribe({
      next: (summary) => {
        this.historySummary.set(summary);
        this.isLoadingHistory.set(false);
      },
      error: () => {
        this.isLoadingHistory.set(false);
        this.historyError.set('No evaluation history found or failed to load history.');
      }
    });
  }

  toggleHistoryPanel(): void {
    this.historyPanelOpen.update((isOpen) => !isOpen);
  }

  shortlist(): void {
    const applicant = this.applicant();
    if (!applicant || this.actionInProgress()) {
      return;
    }

    this.actionInProgress.set(true);
    this.actionError.set(null);

    this.membershipApplicationService.shortlist(applicant.membershipApplicationId).subscribe({
      next: (updated) => {
        this.applicant.set({ ...applicant, stage: normalizeStage(updated.stage) });
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.actionError.set('Could not shortlist this applicant. Refresh and try again.');
      },
    });
  }

  reject(): void {
    const applicant = this.applicant();
    if (!applicant || this.actionInProgress()) {
      return;
    }

    this.actionInProgress.set(true);
    this.actionError.set(null);

    this.membershipApplicationService.reject(applicant.membershipApplicationId).subscribe({
      next: (updated) => {
        this.applicant.set({ ...applicant, stage: normalizeStage(updated.stage) });
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.actionError.set('Could not reject this applicant. Refresh and try again.');
      },
    });
  }

  openSchedulePanel(): void {
    this.schedulePanelOpen.set(true);
    this.scheduleError.set(null);

    const applicant = this.applicant();
    if (!applicant || this.availableRounds().length > 0) {
      return;
    }

    this.isLoadingRounds.set(true);

    this.verificationService.getRoundsByCircle(applicant.circleId).subscribe({
      next: (rounds) => {
        this.availableRounds.set(rounds);
        this.isLoadingRounds.set(false);
      },
      error: () => {
        this.isLoadingRounds.set(false);
        this.scheduleError.set(
          'Could not load verification rounds for this circle.'
        );
      },
    });
  }

  closeSchedulePanel(): void {
    this.schedulePanelOpen.set(false);
    this.scheduleForm.reset({ sendCalendarInvite: true });
  }

  submitSchedule(): void {
    const applicant = this.applicant();
    if (!applicant || this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.isSubmittingSchedule.set(true);
    this.scheduleError.set(null);

    const raw = this.scheduleForm.getRawValue();

    this.verificationService
      .createSchedule({
        applicationId: applicant.membershipApplicationId,
        verificationRoundId: raw.verificationRoundId,
        date: raw.date,
        time: raw.time.length === 5 ? `${raw.time}:00` : raw.time,
        locationLink: raw.locationLink || null,
        videoLink: raw.videoLink || null,
        sendCalendarInvite: raw.sendCalendarInvite
      })
      .subscribe({
        next: (schedule) => {
          this.activeSchedule.set(schedule);
          this.applicant.set({ ...applicant, stage: 'VerificationScheduled' });
          this.isSubmittingSchedule.set(false);
          this.schedulePanelOpen.set(false);
        },
        error: (error) => {
          this.isSubmittingSchedule.set(false);
          this.scheduleError.set(
            error.error?.message ?? 'Could not schedule verification. Please try again.'
          );
        },
      });
  }

  selectedRoundFormat(): string | null {
    const roundId = this.scheduleForm.controls.verificationRoundId.value;
    const round = this.availableRounds().find(
      (r) => r.verificationRoundId === roundId
    );
    return round?.format ?? null;
  }

  goBack(): void {
    this.router.navigate(['/console/pipeline']);
  }
}
