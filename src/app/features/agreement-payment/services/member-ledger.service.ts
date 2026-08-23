import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  MemberLedger,
} from '../models/member-ledger.model';

@Injectable({
  providedIn: 'root',
})
export class MemberLedgerService {

  private readonly baseUrl =
    `${environment.apiBase}/api/MemberLedgers`;

  constructor(
    private http: HttpClient
  ) {}

  getByUserId(
    userId: string
  ): Observable<MemberLedger> {

    return this.http.get<MemberLedger>(
      `${this.baseUrl}/by-user/${userId}`
    );
  }
}