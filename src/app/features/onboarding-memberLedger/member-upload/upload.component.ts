import { Component, inject, signal, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { DocumentRequirementService } from '../services/document-requirement.service';
import { DocumentService } from '../services/document.service';
import { OnboardingCaseService } from '../services/onboarding-case.service';
import { DocumentRequirement } from '../models/document-requirement.model';
import { DocumentItem, DocumentStatus } from '../models/document.model';

@Component({
  selector: 'app-onboarding-upload',
  standalone: true,
  imports: [CardModule, TagModule, FileUploadModule, MessageModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class OnboardingUploadComponent implements OnInit {
  private requirementService = inject(DocumentRequirementService);
  private documentService = inject(DocumentService);
  private onboardingCaseService = inject(OnboardingCaseService);

  requirements = signal<DocumentRequirement[]>([]);
  documents = signal<DocumentItem[]>([]);
  error = signal<string | null>(null);
  onboardingCaseId = signal<string | null>(null);

  ngOnInit(): void {
    this.requirementService.getActiveOrdered().subscribe({
      next: (reqs) => this.requirements.set(reqs),
      error: () => this.error.set('Failed to load document requirements.'),
    });

    // 🆕 جلب الـ OnboardingCase بتاع اليوزر الحالي من endpoint الموجود بالفعل
    this.onboardingCaseService.getMyCase().subscribe({
      next: (myCase) => {
        this.onboardingCaseId.set(myCase.onboardingCaseId);

        this.documentService.getByOnboardingCase(myCase.onboardingCaseId).subscribe({
          next: (docs) => this.documents.set(docs),
          error: () => this.error.set('Failed to load uploaded documents.'),
        });
      },
      error: () => this.error.set('No active onboarding case found for your account.'),
    });
  }

  hasDocument(requirementId: string): boolean {
    return this.documents().some((d) => d.documentRequirementId === requirementId);
  }

  statusFor(requirementId: string): string {
    const doc = this.documents().find((d) => d.documentRequirementId === requirementId);
    return doc ? doc.status : 'Not Uploaded';
  }

  severityFor(requirementId: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const doc = this.documents().find((d) => d.documentRequirementId === requirementId);
    if (!doc) return 'secondary';
    switch (doc.status) {
      case DocumentStatus.Approved: return 'success';
      case DocumentStatus.Rejected: return 'danger';
      default: return 'warn';
    }
  }

  onUpload(event: FileUploadHandlerEvent, requirementId: string): void {
    const file = event.files[0];
    const caseId = this.onboardingCaseId();

    if (!file || !caseId) {
      this.error.set('Cannot upload: no active onboarding case found.');
      return;
    }

    // 🆕 FormData حقيقي فيه الملف نفسه، مطابق للباك إند [FromForm]/IFormFile
    const formData = new FormData();
    formData.append('onboardingCaseId', caseId);
    formData.append('documentRequirementId', requirementId);
    formData.append('file', file, file.name);

    this.documentService.upload(formData).subscribe({
      next: (doc) => {
        this.documents.update((docs) => [
          ...docs.filter((d) => d.documentRequirementId !== requirementId),
          doc,
        ]);
      },
      error: () => this.error.set('Upload failed. Please try again.'),
    });
  }
}