import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentItem, DocumentRequest, DocumentReviewRequest } from '../models/document.model';
import { PagedResult } from '../../../core/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/api/Documents`;

  upload(request: DocumentRequest): Observable<DocumentItem> {
    return this.http.post<DocumentItem>(this.base, request);
  }

  getByOnboardingCase(onboardingCaseId: string): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(`${this.base}/by-case/${onboardingCaseId}`);
  }

  getPendingReview(pageNumber = 1, pageSize = 20): Observable<PagedResult<DocumentItem>> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<PagedResult<DocumentItem>>(`${this.base}/pending-review`, { params });
  }

  review(request: DocumentReviewRequest): Observable<DocumentItem> {
    return this.http.patch<DocumentItem>(`${this.base}/review`, request);
  }
}