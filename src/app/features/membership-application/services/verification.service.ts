import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateVerificationScheduleRequest,
  VerificationRound,
  VerificationSchedule,
  normalizeFormat,
  normalizeScheduleStatus,
} from '../models/verification.model';

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private readonly roundsBaseUrl = `${environment.apiBase}/api/verification-rounds`;
  private readonly schedulesBaseUrl = `${environment.apiBase}/api/verification-schedules`;

  constructor(private http: HttpClient) { }

  getRoundsByCircle(circleId: string): Observable<VerificationRound[]> {
    return this.http
      .get<VerificationRound[]>(`${this.roundsBaseUrl}/circle/${circleId}`)
      .pipe(
        map((rounds) =>
          rounds.map((r) => ({ ...r, format: normalizeFormat(r.format) }))
        )
      );
  }

  getSchedulesByApplication(
    applicationId: string
  ): Observable<VerificationSchedule[]> {
    return this.http
      .get<VerificationSchedule[]>(
        `${this.schedulesBaseUrl}/application/${applicationId}`
      )
      .pipe(
        map((schedules) =>
          schedules.map((s) => ({
            ...s,
            status: normalizeScheduleStatus(s.status),
          }))
        )
      );
  }

  createSchedule(
    request: CreateVerificationScheduleRequest
  ): Observable<VerificationSchedule> {
    return this.http
      .post<VerificationSchedule>(this.schedulesBaseUrl, request)
      .pipe(
        map((s) => ({ ...s, status: normalizeScheduleStatus(s.status) }))
      );
  }
}
