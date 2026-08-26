import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateInternalUserRequest, InternalUser } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/admin/users`;

  create(request: CreateInternalUserRequest): Observable<InternalUser> {
    return this.http.post<InternalUser>(this.baseUrl, request);
  }
}

