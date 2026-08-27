export type CircleType = 'NewCircle' | 'Replacement';

export type CircleRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'ModificationRequested'
  | 'Approved'
  | 'Rejected'
  | 'Published'
  | 'Cancelled'
  | 'Fulfilled';

export interface CircleRequestSummary {
  requestId: string;
  circleTitle: string;
  circleType: CircleType;
  requestStatus: CircleRequestStatus;
  contributionAmount: number;
  duration: number;
  numberOfSlots: number;
  createdAt: string;
  submittedAt: string | null;
}

export interface CircleRequest extends CircleRequestSummary {
  existingCircleId: string | null;
  createdByOrganizerId: string;
  reviewedByAdminId: string | null;
  shortJustification: string | null;
  vacantSlotNumber: number | null;
  reviewedAt: string | null;
  decisionReason: string | null;
}

export interface CreateNewCircleRequest {
  circleTitle: string;
  contributionAmount: number;
  duration: number;
  numberOfSlots: number;
  shortJustification: string;
}

export type UpdateNewCircleRequest = CreateNewCircleRequest;

export interface CreateReplacementCircleRequest {
  existingCircleId: string;
  vacantSlotNumber: number;
  shortJustification: string | null;
}

export type UpdateReplacementCircleRequest = CreateReplacementCircleRequest;

export interface DecisionReason {
  reason: string;
}

export interface AuditLogEntry {
  auditLogId: string;
  entityId: string | null;
  performedByUserId: string;
  entityType: string;
  actionType: string;
  oldStatus: string | null;
  newStatus: string | null;
  actionDescription: string | null;
  createdAt: string;
}

