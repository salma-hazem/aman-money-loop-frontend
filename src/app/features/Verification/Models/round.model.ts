export enum VerificationFormat {
  InPerson = 0,
  Video = 1,
  Phone = 2
}

export interface CreateVerificationCriterion {
  criterionName: string;
  weight: number;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateVerificationCriterion {
  verificationCriterionId?: string; // Included when updating an existing criterion, omitted for new criteria
  criterionName: string;
  weight: number;
  displayOrder: number;
  isActive: boolean;
}

export interface VerificationCriterionResponse {
  verificationCriterionId: string;
  verificationRoundId: string;
  criterionName: string;
  weight: number;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateVerificationRound {
  circleId: string;
  reviewedByUserId: string;
  roundName: string;
  format: VerificationFormat;
  criteria: CreateVerificationCriterion[];
}

export interface UpdateVerificationRound {
  reviewedByUserId?: string;
  roundName: string;
  format: VerificationFormat;
  criteria: UpdateVerificationCriterion[];
}

export interface VerificationRoundResponse {
  verificationRoundId: string;
  circleId: string;
  reviewedByUserId: string;
  roundName: string;
  format: VerificationFormat;
  criteria: VerificationCriterionResponse[];
}
