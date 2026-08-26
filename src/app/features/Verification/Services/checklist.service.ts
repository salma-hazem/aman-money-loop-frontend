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
  private readonly apiUrl = `${environment.apiBase}/api/VerificationChecklist`;

  constructor(private http: HttpClient) { }

  submitChecklist(dto: CreateVerificationChecklistSubmission): Observable<VerificationChecklistSubmissionResponse> {
    return this.http.post<VerificationChecklistSubmissionResponse>(this.apiUrl, dto);
  }

  getSubmissionBySchedule(scheduleId: string): Observable<VerificationChecklistSubmissionResponse> {
    return this.http.get<VerificationChecklistSubmissionResponse>(`${this.apiUrl}/schedule/${scheduleId}`);
  }

  getConsolidatedResults(applicationId: string): Observable<VerificationConsolidatedResult[]> {
    return this.http.get<VerificationConsolidatedResult[]>(`${this.apiUrl}/consolidated/${applicationId}`);
  }
}
