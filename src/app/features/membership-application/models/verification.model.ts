export type VerificationFormat = 'InPerson' | 'Video' | 'Phone';
export type ScheduleStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled';

export interface VerificationCriterion {
  verificationCriterionId: string;
  verificationRoundId: string;
  criterionName: string;
  weight: number;
  displayOrder: number;
  isActive: boolean;
}

export interface VerificationRound {
  verificationRoundId: string;
  circleId: string;
  reviewedByUserId: string;
  roundName: string;
  format: VerificationFormat;
  criteria: VerificationCriterion[];
}

export interface VerificationSchedule {
  verificationScheduleId: string;
  applicationId: string;
  verificationRoundId: string;
  date: string;
  time: string;
  locationLink: string | null;
  videoLink: string | null;
  status: ScheduleStatus;
}

export interface CreateVerificationScheduleRequest {
  applicationId: string;
  verificationRoundId: string;
  date: string;
  time: string;
  locationLink?: string | null;
  videoLink?: string | null;
  sendCalendarInvite: boolean; // <-- Add this property here
}

// The backend serializes VerificationFormat and ScheduleStatus as their
// numeric enum values, not string names - same quirk as
// MembershipApplicationStage. Order must exactly match
// MonyLoop.Domain.Constants.Verification.VerificationFormat /
// ScheduleStatus.
const FORMAT_NAMES: VerificationFormat[] = ['InPerson', 'Video', 'Phone'];
const STATUS_NAMES: ScheduleStatus[] = [
  'Pending',
  'Scheduled',
  'Completed',
  'Cancelled',
];

export function normalizeFormat(
  format: VerificationFormat | number
): VerificationFormat {
  return typeof format === 'number' ? FORMAT_NAMES[format] : format;
}

export function normalizeScheduleStatus(
  status: ScheduleStatus | number
): ScheduleStatus {
  return typeof status === 'number' ? STATUS_NAMES[status] : status;
}
