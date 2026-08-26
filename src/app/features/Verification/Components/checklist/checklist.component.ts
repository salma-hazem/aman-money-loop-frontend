import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationChecklistService } from '../../Services/checklist.service';
import { CreateVerificationChecklistSubmission } from '../../Models/checklist.model';

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

  documentAuthenticityRating: number = 0;
  idMatchRating: number = 0;
  completenessRating: number = 0;
  reviewerComments: string = '';

  isSubmitting: boolean = false;

  constructor(
    private checklistService: VerificationChecklistService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (!this.scheduleId) {
      this.scheduleId = this.route.snapshot.paramMap.get('scheduleId') || '';
    }

    if (this.scheduleId) {
      this.loadChecklistDetails(this.scheduleId);
    }
  }

  loadChecklistDetails(scheduleId: string): void {
    this.checklistService.getSubmissionBySchedule(scheduleId).subscribe({
      next: (data) => {
        if (data) {
          this.reviewerComments = data.overallComments || '';

          data.criterionRatings?.forEach((item) => {
            if (item.verificationCriterionId === 'authenticity') this.documentAuthenticityRating = item.rating;
            if (item.verificationCriterionId === 'idMatch') this.idMatchRating = item.rating;
            if (item.verificationCriterionId === 'completeness') this.completenessRating = item.rating;
          });
        }
      },
      error: (err) => console.error('Error loading checklist details:', err)
    });
  }

  setRating(category: string, score: number): void {
    if (category === 'authenticity') this.documentAuthenticityRating = score;
    if (category === 'idMatch') this.idMatchRating = score;
    if (category === 'completeness') this.completenessRating = score;
  }

  onSubmitChecklist(): void {
    if (!this.scheduleId) {
      alert('Missing Schedule ID!');
      return;
    }

    this.isSubmitting = true;
    const currentUserId = localStorage.getItem('userId') || '';

    const payload: CreateVerificationChecklistSubmission = {
      verificationScheduleId: this.scheduleId,
      submittedByUserId: currentUserId,
      overallComments: this.reviewerComments,
      ratings: [
        { verificationCriterionId: 'authenticity', rating: this.documentAuthenticityRating },
        { verificationCriterionId: 'idMatch', rating: this.idMatchRating },
        { verificationCriterionId: 'completeness', rating: this.completenessRating }
      ]
    };

    this.checklistService.submitChecklist(payload).subscribe({
      next: () => {
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
