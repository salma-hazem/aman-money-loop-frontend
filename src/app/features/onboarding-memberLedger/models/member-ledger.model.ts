export interface MemberLedger {
  memberLedgerId: string;
  userId: string;
  caseId: string;
  activatedByAdminId: string;
  activatedAt: string;
}

export interface MemberLedgerRequest {
  userId: string;
  onboardingCaseId: string;
}