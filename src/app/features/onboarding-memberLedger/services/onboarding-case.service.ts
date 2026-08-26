import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OnboardingCase, OnboardingCaseRequest, OnboardingCaseStatus } from '../models/onboarding-case.model';
import { PagedResult } from '../../../core/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class OnboardingCaseService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/api/OnboardingCases`;

  create(request: OnboardingCaseRequest): Observable<OnboardingCase> {
    return this.http.post<OnboardingCase>(this.base, request);
  }

  getById(id: string): Observable<OnboardingCase> {
    return this.http.get<OnboardingCase>(`${this.base}/${id}`);
  }

  getByIdWithDocuments(id: string): Observable<OnboardingCase> {
    return this.http.get<OnboardingCase>(`${this.base}/${id}/with-documents`);
  }

  // الدالة الجديدة اللي هتجيب كيس الممبر الحالي بالتوكن
  getMyCase(): Observable<OnboardingCase> {
    return this.http.get<OnboardingCase>(`${this.base}/my-case`);
  }

  getByOrganizer(organizerId: string, pageNumber = 1, pageSize = 20): Observable<PagedResult<OnboardingCase>> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<PagedResult<OnboardingCase>>(`${this.base}/by-organizer/${organizerId}`, { params });
  }

  getByStatus(status: OnboardingCaseStatus, pageNumber = 1, pageSize = 20): Observable<PagedResult<OnboardingCase>> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<PagedResult<OnboardingCase>>(`${this.base}/by-status/${status}`, { params });
  }

  markDocumentsVerified(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/mark-documents-verified`, {});
  }
}