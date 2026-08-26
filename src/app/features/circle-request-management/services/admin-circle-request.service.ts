import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuditLogEntry,
  CircleRequest,
  CircleRequestSummary,
  DecisionReason,
} from '../models/circle-request.model';

@Injectable({ providedIn: 'root' })
export class AdminCircleRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/admin/circle-requests`;

  getQueue(): Observable<CircleRequestSummary[]> {
    return this.http.get<CircleRequestSummary[]>(`${this.baseUrl}/queue`);
  }

  getById(id: string): Observable<CircleRequest> {
    return this.http.get<CircleRequest>(`${this.baseUrl}/${id}`);
  }

  approve(id: string): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/approve`, null);
  }

  reject(id: string, request: DecisionReason): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/reject`, request);
  }

  requestModification(id: string, request: DecisionReason): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/request-modification`, request);
  }

  getAudit(id: string): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${this.baseUrl}/${id}/audit`);
  }
}

