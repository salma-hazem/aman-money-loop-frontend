import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';

import { MemberLedger } from '../models/member-ledger.model';
import { MemberLedgerService } from '../services/member-ledger.service';

import {
  PaymentOverview,
  PaymentTransaction,
  RecordPaymentRequest,
} from '../models/payment-transaction.model';

import { PaymentTransactionService } from '../services/payment-transaction.service';

@Component({
  selector: 'app-payments-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payments-receipts.component.html',
  styleUrl: './payments-receipts.component.scss',
})
export class PaymentsReceiptsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  memberLedgerId = '';
  availableLedgers: MemberLedger[] = [];
  selectedLedger: MemberLedger | null = null;

  paymentOverview: PaymentOverview | null = null;
  transactions: PaymentTransaction[] = [];

  isLoading = true;
  isSubmitting = false;
  downloadingTransactionId: string | null = null;

  errorMessage = '';
  successMessage = '';

  paymentForm = this.formBuilder.group({
    transactionType: ['PayIn', Validators.required],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    paymentMethod: [
      null as number | null,
      Validators.required,
    ],
    transactionReference: [''],
  });

  constructor(
    private route: ActivatedRoute,
    private paymentTransactionService: PaymentTransactionService,
    private memberLedgerService: MemberLedgerService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const ledgerFromUrl = this.route.snapshot.queryParamMap.get(
      'memberLedgerId'
    );

    // Organizer/Admin may open a specific ledger directly.
    if (ledgerFromUrl) {
      this.memberLedgerId = ledgerFromUrl;
      this.loadTransactions();
      return;
    }

    const currentUser = this.auth.currentUser();

    if (!currentUser) {
      this.errorMessage =
        'The current user could not be determined.';
      this.isLoading = false;
      return;
    }

    // Member automatically loads their own ledger.
    if (this.isMember) {
      this.loadMemberLedger(currentUser.id);
      return;
    }

    // Organizer/Admin first select a member ledger.
    if (this.canRecordPayments) {
      this.loadAvailableLedgers();
      return;
    }

    this.errorMessage =
      'You do not have permission to access payment information.';
    this.isLoading = false;
  }

  // =====================================================
  // Role Helpers
  // =====================================================

  get isMember(): boolean {
    return this.auth.hasRole(Role.Member);
  }

  get canRecordPayments(): boolean {
    return this.auth.hasRole(
      Role.Admin,
      Role.Organizer
    );
  }

  // =====================================================
  // Member Ledger
  // =====================================================

  private loadMemberLedger(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.memberLedgerService
      .getByUserId(userId)
      .subscribe({
        next: (ledger) => {
          this.memberLedgerId =
            ledger.memberLedgerId;

          this.loadTransactions();
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 404) {
            this.errorMessage =
              'No active member ledger was found for your account. Your onboarding may not be completed yet.';
          } else if (error?.error?.detail) {
            this.errorMessage =
              error.error.detail;
          } else {
            this.errorMessage =
              'Unable to load your member ledger.';
          }
        },
      });
  }

  private loadAvailableLedgers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.memberLedgerService
      .getAvailableLedgers()
      .subscribe({
        next: (ledgers) => {
          this.availableLedgers =
            ledgers ?? [];

          this.isLoading = false;
        },
        error: (error) => {
          this.availableLedgers = [];
          this.isLoading = false;

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Unable to load available member ledgers.'
            );
        },
      });
  }

  selectLedger(ledger: MemberLedger): void {
    this.selectedLedger = ledger;
    this.memberLedgerId =
      ledger.memberLedgerId;

    this.paymentOverview = null;
    this.transactions = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.loadTransactions();
  }

  backToLedgerSelection(): void {
    this.selectedLedger = null;
    this.memberLedgerId = '';

    this.paymentOverview = null;
    this.transactions = [];

    this.errorMessage = '';
    this.successMessage = '';
  }

  // =====================================================
  // Payment Overview
  // =====================================================

  get totalPaid(): number {
    return this.paymentOverview
      ?.totalPaid ?? 0;
  }

  get successfulPaymentCount(): number {
    return this.paymentOverview
      ?.paidContributionsCount ?? 0;
  }

  get latestTransaction():
    PaymentTransaction | null {

    if (this.transactions.length === 0) {
      return null;
    }

    return [...this.transactions]
      .sort(
        (a, b) =>
          new Date(
            b.transactionDate
          ).getTime()
          -
          new Date(
            a.transactionDate
          ).getTime()
      )[0];
  }

  // =====================================================
  // Load Transactions
  // =====================================================

  loadTransactions(): void {
    if (!this.memberLedgerId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentTransactionService
      .getPaymentsByMemberLedger(
        this.memberLedgerId
      )
      .subscribe({
        next: (overview) => {
          this.paymentOverview =
            overview;

          this.transactions =
            overview.transactions ?? [];

          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.paymentOverview = null;
          this.transactions = [];

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Unable to load payment transactions.'
            );
        },
      });
  }

  // =====================================================
  // Record Payment
  // =====================================================

  recordPayment(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.canRecordPayments) {
      this.errorMessage =
        'You do not have permission to record payments.';
      return;
    }

    if (!this.memberLedgerId) {
      this.errorMessage =
        'A member ledger must be selected first.';
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required payment information.';
      return;
    }

    const value =
      this.paymentForm.getRawValue();

    const request: RecordPaymentRequest = {
      memberLedgerId:
        this.memberLedgerId,

      amount:
        Number(value.amount),

      paymentMethod:
        Number(value.paymentMethod),

      transactionReference:
        value.transactionReference?.trim()
        || null,
    };

    this.isSubmitting = true;

    const request$ =
      value.transactionType === 'PayOut'
        ? this.paymentTransactionService
            .recordPayOut(request)
        : this.paymentTransactionService
            .recordPayIn(request);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;

        this.successMessage =
          value.transactionType === 'PayOut'
            ? 'Payout recorded successfully.'
            : 'Pay-in recorded successfully.';

        this.paymentForm.reset({
          transactionType: 'PayIn',
          amount: null,
          paymentMethod: null,
          transactionReference: '',
        });

        this.loadTransactions();
      },
      error: (error) => {
        this.isSubmitting = false;

        this.errorMessage =
          this.getBackendErrorMessage(
            error,
            'Unable to record the payment transaction.'
          );
      },
    });
  }

  // =====================================================
  // Receipt Download
  // =====================================================

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
            window.URL.createObjectURL(
              pdfBlob
            );

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

          setTimeout(() => {
            window.URL.revokeObjectURL(
              blobUrl
            );
          }, 1000);

          this.downloadingTransactionId =
            null;
        },
        error: (error) => {
          this.downloadingTransactionId =
            null;

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Unable to download the payment receipt.'
            );
        },
      });
  }

  // =====================================================
  // Transaction Type
  // =====================================================

  getTransactionTypeLabel(
    transaction: PaymentTransaction
  ): string {
    const type =
      String(
        transaction.transactionType
      ).toLowerCase();

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

    return String(
      transaction.transactionType
    );
  }

  // =====================================================
  // Transaction Status
  // =====================================================

  getStatusLabel(
    transaction: PaymentTransaction
  ): string {
    const status =
      String(
        transaction.transactionStatus
      ).toLowerCase();

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

    return String(
      transaction.transactionStatus
    );
  }

  // =====================================================
  // Payment Method
  // =====================================================

  getPaymentMethodLabel(
    transaction: PaymentTransaction
  ): string {
    const method =
      String(
        transaction.paymentMethod
      ).toLowerCase();

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

    return String(
      transaction.paymentMethod
    );
  }

  // =====================================================
  // Receipt Loading State
  // =====================================================

  isDownloading(
    transaction: PaymentTransaction
  ): boolean {
    return (
      this.downloadingTransactionId ===
      transaction.paymentTransactionId
    );
  }

  // =====================================================
  // Backend Error Handling
  // =====================================================

  private getBackendErrorMessage(
    error: any,
    fallback: string
  ): string {
    const errors =
      error?.error?.errors;

    if (errors) {
      const messages =
        Object.values(errors)
          .flat() as string[];

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    if (error?.error?.detail) {
      return error.error.detail;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error.status === 403) {
      return 'You do not have permission to access this payment information.';
    }

    if (error.status === 404) {
      return 'The selected member ledger was not found.';
    }

    if (error.status === 409) {
      return 'The payment could not be recorded because it conflicts with the current ledger or transaction state.';
    }

    if (error.status === 400) {
      return 'The payment information is invalid.';
    }

    return fallback;
  }
}