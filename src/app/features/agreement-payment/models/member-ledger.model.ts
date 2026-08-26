export interface MemberLedger {

  memberLedgerId: string;

  userId: string;

  onboardingCaseId: string;

  activatedByAdminId?: string | null;

  activatedAt?: string | null;

  // New fields returned by GET /api/MemberLedgers
  memberName?: string;

  circleTitle?: string;

  slotNumber?: number | null;

  // Keep existing fields for compatibility
  circleId?: string | null;

  circleSlotId?: string | null;

  payoutSlot?: number | null;

  isActive?: boolean;
}