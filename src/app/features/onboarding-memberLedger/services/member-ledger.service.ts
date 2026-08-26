import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MemberLedger, MemberLedgerRequest } from '../models/member-ledger.model';

@Injectable({ providedIn: 'root' })
export class MemberLedgerService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/api/MemberLedgers`;

  activate(request: MemberLedgerRequest): Observable<MemberLedger> {
    return this.http.post<MemberLedger>(`${this.base}/activate`, request);
  }

  getByUserId(userId: string): Observable<MemberLedger> {
    return this.http.get<MemberLedger>(`${this.base}/by-user/${userId}`);
  }
}