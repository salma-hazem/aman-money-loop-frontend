export type MembershipApplicationStage =
  | 'Submitted'
  | 'Shortlisted'
  | 'VerificationScheduled'
  | 'VerificationCompleted'
  | 'AgreementExtended'
  | 'Confirmed'
  | 'Rejected';

export interface MembershipApplicationSummary {
  membershipApplicationId: string;
  name: string;
  stage: MembershipApplicationStage;
  createdAt: string;
}

export interface MembershipApplicationDetail {
  membershipApplicationId: string;
  listingId: string;
  circleId: string;
  title: string | null;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  stage: MembershipApplicationStage;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateMembershipApplicationRequest {
  listingId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ListingSummary {
  listingId: string;
  title: string;
  monthlyContribution: number;
  durationMonths: number;
  availableSlots: number;
}

// The backend serializes MembershipApplicationStage as its numeric enum
// value (0-6), not the string name. Order must exactly match
// MonyLoop.Domain.Constants.MembershipApplicationStage.
const STAGE_NAMES: MembershipApplicationStage[] = [
  'Submitted',
  'Shortlisted',
  'VerificationScheduled',
  'VerificationCompleted',
  'AgreementExtended',
  'Confirmed',
  'Rejected',
];

export function normalizeStage(
  stage: MembershipApplicationStage | number
): MembershipApplicationStage {
  return typeof stage === 'number' ? STAGE_NAMES[stage] : stage;
}
