import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  VerificationRoundResponse,
  CreateVerificationRound,
  UpdateVerificationRound
} from '../Models/round.model';

@Injectable({
  providedIn: 'root'
})
export class VerificationRoundService {
  private readonly apiUrl = `${environment.apiBase}/api/verification/rounds`;

  constructor(private http: HttpClient) { }

  getRoundById(roundId: string): Observable<VerificationRoundResponse> {
    return this.http.get<VerificationRoundResponse>(`${this.apiUrl}/${roundId}`);
  }

  getRoundsByCircle(circleId: string): Observable<VerificationRoundResponse[]> {
    return this.http.get<VerificationRoundResponse[]>(`${this.apiUrl}/circle/${circleId}`);
  }

  createRound(dto: CreateVerificationRound): Observable<VerificationRoundResponse> {
    return this.http.post<VerificationRoundResponse>(this.apiUrl, dto);
  }

  updateRound(roundId: string, dto: UpdateVerificationRound): Observable<VerificationRoundResponse> {
    return this.http.put<VerificationRoundResponse>(`${this.apiUrl}/${roundId}`, dto);
  }
}
