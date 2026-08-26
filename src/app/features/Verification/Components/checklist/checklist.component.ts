import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationChecklistService } from '../../Services/checklist.service';

@Component({
  selector: 'app-verification-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class VerificationChecklistComponent implements OnInit {
  @Input() scheduleId: string = ''; // Receives schedule ID from parent component or router

  roundTitle: string = 'Document Check';
  memberName: string = 'Ahmed Hassan';
  status: string = 'Scheduled';

  documentAuthenticityRating: number = 0;
  idMatchRating: number = 0;
  completenessRating: number = 0;
  reviewerComments: string = '';

  isSubmitting: boolean = false;

  constructor(private checklistService: VerificationChecklistService) { }

  ngOnInit(): void {
    if (this.scheduleId) {
      this.loadChecklistDetails(this.scheduleId);
    }
  }

  loadChecklistDetails(scheduleId: string): void {
    this.checklistService.getSubmissionBySchedule(scheduleId).subscribe({
      next: (data: any) => {
        if (data) {
          this.documentAuthenticityRating = data.documentAuthenticityRating || 0;
          this.idMatchRating = data.idMatchRating || 0;
          this.completenessRating = data.completenessRating || 0;
          this.reviewerComments = data.reviewerComments || '';
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

  get calculatedCompositeScore(): number {
    const total = this.documentAuthenticityRating + this.idMatchRating + this.completenessRating;
    return total > 0 ? Number((total / 3).toFixed(1)) : 0;
  }

  onSubmitChecklist(): void {
    this.isSubmitting = true;
    const payload = {
      verificationScheduleId: this.scheduleId,
      documentAuthenticityRating: this.documentAuthenticityRating,
      idMatchRating: this.idMatchRating,
      completenessRating: this.completenessRating,
      reviewerComments: this.reviewerComments,
      compositeScore: this.calculatedCompositeScore
    };

    this.checklistService.submitChecklist(payload as any).subscribe({
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
