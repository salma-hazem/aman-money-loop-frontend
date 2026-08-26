export enum DocumentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface DocumentItem {
  documentId: string;
  onboardingCaseId: string;
  documentRequirementId: string;
  reviewedByUserId?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
}

export interface DocumentRequest {
  onboardingCaseId: string;
  documentRequirementId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
}

export interface DocumentReviewRequest {
  documentId: string;
  newStatus: string; // 'Approved' | 'Rejected'
  rejectionReason?: string;
}