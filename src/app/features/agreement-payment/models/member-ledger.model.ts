export interface MemberLedger {
  memberLedgerId: string;
  userId: string;
  onboardingCaseId: string;

  circleId?: string | null;
  circleSlotId?: string | null;

  payoutSlot?: number | null;

  activatedAt?: string | null;

  isActive?: boolean;
}