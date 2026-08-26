export interface CreateVerificationCriterionRating {
  verificationCriterionId: string;
  rating: number;
  comments?: string;
}

export interface VerificationCriterionRatingResponse {
  verificationCriterionRatingId: string;
  verificationChecklistSubmissionId: string;
  verificationCriterionId: string;
  rating: number;
  comments?: string;
}
export interface CreateVerificationChecklistSubmission {
  verificationScheduleId: string;
  submittedByUserId: string;
  overallComments?: string;
  ratings: CreateVerificationCriterionRating[];
}

export interface VerificationChecklistSubmissionResponse {
  verificationChecklistSubmissionId: string;
  verificationScheduleId: string;
  submittedByUserId: string;
  compositeScore: number;
  overallComments?: string;
  submittedAt: string;
  criterionRatings: VerificationCriterionRatingResponse[];
}

export interface VerificationConsolidatedResult {
  verificationScheduleId: string;
  applicationId: string;
  roundName: string;
  compositeScore: number;
  overallComments?: string;
  submittedAt: string;
  detailedRatings: VerificationCriterionRatingResponse[];
}
