export interface MembershipAgreement {
  membershipAgreementId: string;
  membershipApplicationId: string;

  memberName: string;
  circleTitle: string;
  contributionSchedule: string;

  payoutSlot: number;

  startDate: string;
  expiryDate: string;

  status: string;

  createdAt: string;
  respondedAt: string | null;
}
export interface CreateMembershipAgreementRequest {
  membershipApplicationId: string;
  contributionSchedule: string;
  payoutSlot: number;
  startDate: string;
  expiryDate: string;
}