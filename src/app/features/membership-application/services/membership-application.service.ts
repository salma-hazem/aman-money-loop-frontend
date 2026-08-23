import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateMembershipApplicationRequest,
  MembershipApplicationDetail,
  MembershipApplicationSummary,
  PagedResult
} from '../models/membership-application.model';

@Injectable({
  providedIn: 'root',
})
export class MembershipApplicationService {
  private readonly baseUrl =
    `${environment.apiBase}/api/MembershipApplications`;

  constructor(private http: HttpClient) { }

  create(
    request: CreateMembershipApplicationRequest
  ): Observable<MembershipApplicationDetail> {
    return this.http.post<MembershipApplicationDetail>(
      this.baseUrl,
      request
    );
  }

  getById(id: string): Observable<MembershipApplicationDetail> {
    return this.http.get<MembershipApplicationDetail>(
      `${this.baseUrl}/${id}`
    );
  }

  getByListing(
    listingId: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PagedResult<MembershipApplicationSummary>> {
    return this.http.get<PagedResult<MembershipApplicationSummary>>(
      `${this.baseUrl}/by-listing/${listingId}`,
      {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      }
    );
  }

  shortlist(id: string): Observable<MembershipApplicationDetail> {
    return this.http.post<MembershipApplicationDetail>(
      `${this.baseUrl}/${id}/shortlist`,
      null
    );
  }

  reject(id: string): Observable<MembershipApplicationDetail> {
    return this.http.post<MembershipApplicationDetail>(
      `${this.baseUrl}/${id}/reject`,
      null
    );
  }
}
