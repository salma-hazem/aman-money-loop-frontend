import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  PaymentOverview,
  PaymentTransaction,
  RecordPaymentRequest,
} from '../models/payment-transaction.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentTransactionService {

  private readonly baseUrl =
    `${environment.apiBase}/api/payment-transactions`;

  constructor(
    private http: HttpClient
  ) {}

  getPaymentsByMemberLedger(
    memberLedgerId: string
  ): Observable<PaymentOverview> {

    return this.http.get<PaymentOverview>(
      `${this.baseUrl}/member-ledger/${memberLedgerId}`
    );
  }

  recordPayIn(
    request: RecordPaymentRequest
  ): Observable<PaymentTransaction> {

    return this.http.post<PaymentTransaction>(
      `${this.baseUrl}/pay-ins`,
      request
    );
  }

  recordPayOut(
    request: RecordPaymentRequest
  ): Observable<PaymentTransaction> {

    return this.http.post<PaymentTransaction>(
      `${this.baseUrl}/pay-outs`,
      request
    );
  }

  downloadReceipt(
    transactionId: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}/${transactionId}/receipt`,
      {
        responseType: 'blob',
      }
    );
  }
}