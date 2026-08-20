export interface PaymentTransaction {
  paymentTransactionId: string;

  transactionType: string | number;

  amount: number;

  paymentMethod: string | number;

  transactionStatus: string | number;

  transactionDate: string;

  receiptNumber: string | null;

  // Currently not returned by the backend,
  // so keep it optional for future support.
  transactionReference?: string | null;
}

export interface PaymentOverview {
  memberLedgerId: string;

  nextContributionAmount: number | null;

  nextContributionDueDate: string | null;

  totalPaid: number;

  paidContributionsCount: number;

  payoutSlot: number | null;

  payoutStatus: string | number | null;

  transactions: PaymentTransaction[];
}