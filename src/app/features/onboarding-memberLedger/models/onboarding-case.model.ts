import { DocumentItem } from "./document.model";

export enum OnboardingCaseStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface OnboardingCase {
  onboardingCaseId: string;
  userId: string; 
  membershipAgreementId: string;
  organizerId: string;
  finalStatus: OnboardingCaseStatus;
  createdAt: string;
  documents?: DocumentItem[];
}

export interface OnboardingCaseRequest {
  userId: string; 
  membershipAgreementId: string;
  organizerId: string;
}