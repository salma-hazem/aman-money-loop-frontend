import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateVerificationSchedule,
  UpdateVerificationSchedule,
  VerificationScheduleResponse
} from '../Models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class verificationScheduleService {
  private readonly apiUrl = `${environment.apiBase}/api/verification/schedules`;

  constructor(private http: HttpClient) { }

  scheduleVerification(dto: CreateVerificationSchedule): Observable<VerificationScheduleResponse> {
    return this.http.post<VerificationScheduleResponse>(this.apiUrl, dto);
  }

  getScheduleById(scheduleId: string): Observable<VerificationScheduleResponse> {
    return this.http.get<VerificationScheduleResponse>(`${this.apiUrl}/${scheduleId}`);
  }

  getSchedulesByApplication(applicationId: string): Observable<VerificationScheduleResponse[]> {
    return this.http.get<VerificationScheduleResponse[]>(`${this.apiUrl}/application/${applicationId}`);
  }

  updateSchedule(scheduleId: string, dto: UpdateVerificationSchedule): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${scheduleId}`, dto);
  }
}
