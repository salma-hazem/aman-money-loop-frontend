import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateVerificationChecklistSubmission,
  VerificationChecklistSubmissionResponse,
  VerificationConsolidatedResult
} from '../Models/checklist.model';

@Injectable({
  providedIn: 'root'
})
export class VerificationChecklistService {
  private readonly apiUrl = `${environment.apiBase}/api/verification-checklists`;

  constructor(private http: HttpClient) { }

  // POST api/verification-checklists/submit
  submitChecklist(dto: CreateVerificationChecklistSubmission): Observable<VerificationChecklistSubmissionResponse> {
    return this.http.post<VerificationChecklistSubmissionResponse>(`${this.apiUrl}/submit`, dto);
  }

  // GET api/verification-checklists/schedule/{scheduleId}
  getSubmissionBySchedule(scheduleId: string): Observable<VerificationChecklistSubmissionResponse> {
    return this.http.get<VerificationChecklistSubmissionResponse>(`${this.apiUrl}/schedule/${scheduleId}`);
  }

  // GET api/verification-checklists/schedule/{scheduleId}/consolidated-result
  getConsolidatedResult(scheduleId: string): Observable<VerificationConsolidatedResult> {
    return this.http.get<VerificationConsolidatedResult>(`${this.apiUrl}/schedule/${scheduleId}/consolidated-result`);
  }
}
