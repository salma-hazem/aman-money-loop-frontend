import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MembershipAgreement } from '../models/membership-agreement.model';

@Injectable({
  providedIn: 'root',
})
export class MembershipAgreementService {
  private readonly baseUrl =
    `${environment.apiBase}/api/membership-agreements`;

  constructor(private http: HttpClient) {}

  getAgreementForResponse(
    agreementId: string,
    token: string
  ): Observable<MembershipAgreement> {
    return this.http.get<MembershipAgreement>(
      `${this.baseUrl}/${agreementId}/response`,
      {
        params: {
          token,
        },
      }
    );
  }

  acceptAgreement(
    agreementId: string,
    token: string
  ): Observable<MembershipAgreement> {
    return this.http.post<MembershipAgreement>(
      `${this.baseUrl}/${agreementId}/accept`,
      null,
      {
        params: {
          token,
        },
      }
    );
  }

  declineAgreement(
    agreementId: string,
    token: string
  ): Observable<MembershipAgreement> {
    return this.http.post<MembershipAgreement>(
      `${this.baseUrl}/${agreementId}/decline`,
      null,
      {
        params: {
          token,
        },
      }
    );
  }
}