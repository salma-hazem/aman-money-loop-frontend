import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  Observable,
  map,
} from 'rxjs';

import {
  environment,
} from '../../../../environments/environment';

import {
  CreateMembershipApplicationRequest,
  MembershipApplicationDetail,
  MembershipApplicationStage,
  MembershipApplicationSummary,
  PagedResult,
} from '../models/membership-application.model';


@Injectable({
  providedIn: 'root',
})
export class MembershipApplicationService {

  private readonly baseUrl =
    `${environment.apiBase}/api/MembershipApplications`;


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // Create Application
  // =====================================================

  create(
    request: CreateMembershipApplicationRequest
  ): Observable<MembershipApplicationDetail> {

    return this.http
      .post<any>(
        this.baseUrl,
        request
      )
      .pipe(
        map((application) =>
          this.mapDetail(application)
        )
      );
  }


  // =====================================================
  // Get Application By Id
  // =====================================================

  getById(
    id: string
  ): Observable<MembershipApplicationDetail> {

    return this.http
      .get<any>(
        `${this.baseUrl}/${id}`
      )
      .pipe(
        map((application) =>
          this.mapDetail(application)
        )
      );
  }

  // =====================================================
  // Get My Applications
  // =====================================================

  getMine(): Observable<MembershipApplicationDetail[]> {

    return this.http
      .get<any[]>(
        `${this.baseUrl}/mine`
      )
      .pipe(
        map((applications) =>
          applications.map((application) =>
            this.mapDetail(application)
          )
        )
      );
  }

  // =====================================================
  // Get Applications By Listing
  // =====================================================

  getByListing(
    listingId: string,
    pageNumber: number,
    pageSize: number
  ): Observable<
    PagedResult<MembershipApplicationSummary>
  > {

    return this.http
      .get<any>(
        `${this.baseUrl}/by-listing/${listingId}`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
          },
        }
      )
      .pipe(
        map((result) => ({

          ...result,

          items:
            (result.items ?? [])
              .map((application: any) =>
                this.mapSummary(application)
              ),

        }))
      );
  }


  // =====================================================
  // Shortlist
  // =====================================================

  shortlist(
    id: string
  ): Observable<MembershipApplicationDetail> {

    return this.http
      .post<any>(
        `${this.baseUrl}/${id}/shortlist`,
        null
      )
      .pipe(
        map((application) =>
          this.mapDetail(application)
        )
      );
  }


  // =====================================================
  // Reject
  // =====================================================

  reject(
    id: string
  ): Observable<MembershipApplicationDetail> {

    return this.http
      .post<any>(
        `${this.baseUrl}/${id}/reject`,
        null
      )
      .pipe(
        map((application) =>
          this.mapDetail(application)
        )
      );
  }


  // =====================================================
  // Mapping Helpers
  // =====================================================

  private mapSummary(
    application: any
  ): MembershipApplicationSummary {

    return {

      membershipApplicationId:
        application.membershipApplicationId,

      name:
        application.name,

      stage:
        this.mapStage(
          application.stage
        ),

      createdAt:
        application.createdAt,
    };
  }


  private mapDetail(
    application: any
  ): MembershipApplicationDetail {

    return {

      ...application,

      stage:
        this.mapStage(
          application.stage
        ),
    };
  }


  // =====================================================
  // Backend Enum → Frontend Stage
  // =====================================================

  private mapStage(
    stage: number | string
  ): MembershipApplicationStage {

    if (typeof stage === 'string') {

      return stage as MembershipApplicationStage;
    }


    switch (stage) {

      case 0:
        return 'Submitted';

      case 1:
        return 'Shortlisted';

      case 2:
        return 'VerificationScheduled';

      case 3:
        return 'VerificationCompleted';

      case 4:
        return 'AgreementExtended';

      case 5:
        return 'Confirmed';

      case 6:
        return 'Rejected';

      default:
        return 'Submitted';
    }
  }
}
