import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  PaymentOverview,
  PaymentTransaction
} from '../models/payment-transaction.model';

import {
  PaymentTransactionService
} from '../services/payment-transaction.service';

@Component({
  selector: 'app-payments-receipts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments-receipts.component.html',
  styleUrl: './payments-receipts.component.scss',
})
export class PaymentsReceiptsComponent implements OnInit {

  memberLedgerId = '';

  paymentOverview: PaymentOverview | null = null;

  transactions: PaymentTransaction[] = [];

  isLoading = true;

  downloadingTransactionId: string | null = null;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private paymentTransactionService: PaymentTransactionService
  ) {}

  ngOnInit(): void {

    this.memberLedgerId =
      this.route.snapshot.queryParamMap.get('memberLedgerId') ?? '';

    if (!this.memberLedgerId) {

      this.errorMessage =
        'A member ledger ID is required to view payment transactions.';

      this.isLoading = false;

      return;
    }

    this.loadTransactions();
  }

  private loadTransactions(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentTransactionService
      .getPaymentsByMemberLedger(this.memberLedgerId)
      .subscribe({

        next: (overview) => {

          this.paymentOverview = overview;

          this.transactions =
            overview.transactions ?? [];

          this.isLoading = false;
        },

        error: (error) => {

          this.isLoading = false;

          if (error.status === 404) {

            this.errorMessage =
              'No payment information was found for this member.';

          } else {

            this.errorMessage =
              'An unexpected error occurred while loading payment transactions.';
          }
        },
      });
  }

  get totalPaid(): number {

    return this.paymentOverview?.totalPaid ?? 0;
  }

  get successfulPaymentCount(): number {

    return (
      this.paymentOverview?.paidContributionsCount ?? 0
    );
  }

  get latestTransaction(): PaymentTransaction | null {

    if (this.transactions.length === 0) {
      return null;
    }

    return [...this.transactions].sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    )[0];
  }

  downloadReceipt(
    transaction: PaymentTransaction
  ): void {

    if (
      !transaction.paymentTransactionId ||
      this.downloadingTransactionId
    ) {
      return;
    }

    this.downloadingTransactionId =
      transaction.paymentTransactionId;

    this.errorMessage = '';

    this.paymentTransactionService
      .downloadReceipt(
        transaction.paymentTransactionId
      )
      .subscribe({

        next: (pdfBlob) => {

          const blobUrl =
            window.URL.createObjectURL(pdfBlob);

          const link =
            document.createElement('a');

          link.href = blobUrl;

          link.download =
            transaction.receiptNumber
              ? `${transaction.receiptNumber}.pdf`
              : `payment-receipt-${transaction.paymentTransactionId}.pdf`;

          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);

          window.URL.revokeObjectURL(blobUrl);

          this.downloadingTransactionId = null;
        },

        error: () => {

          this.downloadingTransactionId = null;

          this.errorMessage =
            'Unable to download the payment receipt.';
        },
      });
  }

  getTransactionTypeLabel(
    transaction: PaymentTransaction
  ): string {

    const type =
      String(transaction.transactionType).toLowerCase();

    if (
      type === 'payin' ||
      type === 'pay-in' ||
      type === '0'
    ) {
      return 'Pay-In';
    }

    if (
      type === 'payout' ||
      type === 'pay-out' ||
      type === '1'
    ) {
      return 'Payout';
    }

    return String(transaction.transactionType);
  }

  getStatusLabel(
    transaction: PaymentTransaction
  ): string {

    const status =
      String(transaction.transactionStatus).toLowerCase();

    if (
      status === 'pending' ||
      status === '0'
    ) {
      return 'Pending';
    }

    if (
      status === 'successful' ||
      status === 'success' ||
      status === '1'
    ) {
      return 'Successful';
    }

    if (
      status === 'failed' ||
      status === '2'
    ) {
      return 'Failed';
    }

    return String(transaction.transactionStatus);
  }

  getPaymentMethodLabel(
    transaction: PaymentTransaction
  ): string {

    const method =
      String(transaction.paymentMethod).toLowerCase();

    if (
      method === 'banktransfer' ||
      method === 'bank-transfer' ||
      method === '0'
    ) {
      return 'Bank Transfer';
    }

    if (
      method === 'ewallet' ||
      method === 'e-wallet' ||
      method === '1'
    ) {
      return 'E-Wallet';
    }

    return String(transaction.paymentMethod);
  }

  isDownloading(
    transaction: PaymentTransaction
  ): boolean {

    return (
      this.downloadingTransactionId ===
      transaction.paymentTransactionId
    );
  }
}