import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationChecklistService } from '../Services/checklist.service';

@Component({
  selector: 'app-verification-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist.component.html',
})
export class VerificationChecklistComponent implements OnInit {
  // Model state for checklist fields
  documentAuthenticityRating: number = 0;
  idMatchRating: number = 0;
  completenessRating: number = 0;
  reviewerComments: string = '';

  isSubmitting: boolean = false;

  constructor(private checklistService: VerificationChecklistService) { }

  ngOnInit(): void { }

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
      documentAuthenticityRating: this.documentAuthenticityRating,
      idMatchRating: this.idMatchRating,
      completenessRating: this.completenessRating,
      reviewerComments: this.reviewerComments,
      compositeScore: this.calculatedCompositeScore
    };

    // Call your checklist service submission endpoint
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
