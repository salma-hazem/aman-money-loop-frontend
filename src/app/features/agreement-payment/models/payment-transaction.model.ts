export interface PaymentTransaction {
  paymentTransactionId: string;

  transactionType: string | number;

  amount: number;

  paymentMethod: string | number;

  transactionReference?: string | null;

  transactionStatus: string | number;

  transactionDate: string;

  receiptNumber: string | null;
}

export interface PaymentOverview {
  memberLedgerId: string;

  nextContributionAmount: number | null;

  totalPaid: number;

  paidContributionsCount: number;

  payoutSlot: number | null;

  payoutStatus: string | number | null;

  transactions: PaymentTransaction[];
}

export interface RecordPaymentRequest {
  memberLedgerId: string;

  amount: number;

  // Backend PaymentMethod enum:
  // 0 = BankTransfer
  // 1 = EWallet
  paymentMethod: number;

  transactionReference?: string | null;
}