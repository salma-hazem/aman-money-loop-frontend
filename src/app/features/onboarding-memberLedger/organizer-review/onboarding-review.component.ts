import { Component, inject, signal, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DocumentService } from '../services/document.service';
import { OnboardingCaseService } from '../services/onboarding-case.service';
import { DocumentItem, DocumentStatus } from '../models/document.model';

@Component({
  selector: 'app-onboarding-review',
  standalone: true,
  imports: [CardModule, TagModule, ButtonModule, DialogModule, InputTextModule, MessageModule, PaginatorModule, FormsModule, DatePipe],
  templateUrl: './onboarding-review.component.html',
  styleUrl: './onboarding-review.component.scss',
})
export class OnboardingReviewComponent implements OnInit {
  private documentService = inject(DocumentService);
  private caseService = inject(OnboardingCaseService);

  documents = signal<DocumentItem[]>([]);
  totalCount = signal(0);
  error = signal<string | null>(null);
  pageNumber = 1;
  pageSize = 10;

  rejectDialogVisible = false;
  rejectionReason = '';
  private selectedDoc: DocumentItem | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.documentService.getPendingReview(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.documents.set(result.items);
        this.totalCount.set(result.totalCount);
      },
      error: () => this.error.set('Failed to load pending documents.'),
    });
  }

  onPageChange(event: PaginatorState): void {
    this.pageNumber = (event.page ?? 0) + 1;
    this.pageSize = event.rows ?? 10;
    this.load();
  }

  approve(doc: DocumentItem): void {
    this.documentService.review({
      documentId: doc.documentId,
      newStatus: DocumentStatus.Approved,
    }).subscribe({
      next: () => {
        this.documents.update((docs) => docs.filter((d) => d.documentId !== doc.documentId));
        this.checkAllVerified(doc.onboardingCaseId);
      },
      error: () => this.error.set('Failed to approve document.'),
    });
  }

  openReject(doc: DocumentItem): void {
    this.selectedDoc = doc;
    this.rejectionReason = '';
    this.rejectDialogVisible = true;
  }

  confirmReject(): void {
    if (!this.selectedDoc || !this.rejectionReason.trim()) return;

    this.documentService.review({
      documentId: this.selectedDoc.documentId,
      newStatus: DocumentStatus.Rejected,
      rejectionReason: this.rejectionReason,
    }).subscribe({
      next: () => {
        this.documents.update((docs) => docs.filter((d) => d.documentId !== this.selectedDoc!.documentId));
        this.rejectDialogVisible = false;
      },
      error: () => this.error.set('Failed to reject document.'),
    });
  }

  private checkAllVerified(onboardingCaseId: string): void {
    this.caseService.markDocumentsVerified(onboardingCaseId).subscribe({
      error: () => {},
    });
  }

  viewDocument(doc: DocumentItem): void {
  const previewWindow = window.open('', '_blank');

  this.documentService.getFile(doc.documentId).subscribe({
    next: (blob) => {
      const url = URL.createObjectURL(blob);

      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
    error: () => {
      previewWindow?.close();
      this.error.set('Failed to open document.');
    },
  });
}
}