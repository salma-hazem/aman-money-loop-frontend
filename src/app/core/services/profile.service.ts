import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateProfileRequest, UserProfile } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/profile`;

  get(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.baseUrl);
  }

  update(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.baseUrl, request);
  }

  requestEmailChange(newEmail: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/email-change/request`, { newEmail });
  }

  confirmEmailChange(code: string): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/email-change/confirm`, { code });
  }
}

