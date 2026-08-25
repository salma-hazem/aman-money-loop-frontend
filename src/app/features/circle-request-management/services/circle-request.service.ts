import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CircleRequest,
  CircleRequestSummary,
  CreateNewCircleRequest,
  CreateReplacementCircleRequest,
  UpdateNewCircleRequest,
  UpdateReplacementCircleRequest,
} from '../models/circle-request.model';

@Injectable({ providedIn: 'root' })
export class CircleRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/circle-requests`;

  getMine(): Observable<CircleRequestSummary[]> {
    return this.http.get<CircleRequestSummary[]>(`${this.baseUrl}/mine`);
  }

  getById(id: string): Observable<CircleRequest> {
    return this.http.get<CircleRequest>(`${this.baseUrl}/${id}`);
  }

  createNew(request: CreateNewCircleRequest): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/new`, request);
  }

  createReplacement(request: CreateReplacementCircleRequest): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/replacement`, request);
  }

  updateNew(id: string, request: UpdateNewCircleRequest): Observable<CircleRequest> {
    return this.http.put<CircleRequest>(`${this.baseUrl}/${id}/new`, request);
  }

  updateReplacement(id: string, request: UpdateReplacementCircleRequest): Observable<CircleRequest> {
    return this.http.put<CircleRequest>(`${this.baseUrl}/${id}/replacement`, request);
  }

  submit(id: string): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/submit`, null);
  }

  publish(id: string): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/publish`, null);
  }

  cancel(id: string): Observable<CircleRequest> {
    return this.http.post<CircleRequest>(`${this.baseUrl}/${id}/cancel`, null);
  }
}

