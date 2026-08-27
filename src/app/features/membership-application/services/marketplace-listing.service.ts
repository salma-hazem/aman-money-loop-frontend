import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MarketplaceListingDetail,
  MarketplaceListingQuery,
  MarketplaceListingStatus,
  MarketplaceListingSummary,
} from '../models/marketplace-listing.model';
@Injectable({ providedIn: 'root' })
export class MarketplaceListingService {
  private readonly baseUrl = `${environment.apiBase}/api/MarketplaceListings`;
  constructor(private http: HttpClient) { }
  getActive(query?: MarketplaceListingQuery): Observable<MarketplaceListingSummary[]> {
    let params = new HttpParams();
    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.minContribution != null) params = params.set('minContribution', query.minContribution);
      if (query.maxContribution != null) params = params.set('maxContribution', query.maxContribution);
      if (query.minDuration != null) params = params.set('minDuration', query.minDuration);
      if (query.maxDuration != null) params = params.set('maxDuration', query.maxDuration);
      if (query.minAvailableSlots != null) params = params.set('minAvailableSlots', query.minAvailableSlots);
    }
    return this.http.get<MarketplaceListingSummary[]>(this.baseUrl, { params });
  }
  getById(listingId: string): Observable<MarketplaceListingDetail> {
    return this.http.get<MarketplaceListingDetail>(`${this.baseUrl}/${listingId}`);
  }
  updateStatus(
    listingId: string,
    status: MarketplaceListingStatus
  ): Observable<MarketplaceListingDetail> {
    return this.http.patch<MarketplaceListingDetail>(
      `${this.baseUrl}/${listingId}/status`,
      { status }
    );
  }
}
