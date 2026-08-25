import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MarketplaceListingDetail,
  MarketplaceListingSummary,
} from '../models/marketplace-listing.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceListingService {
  private readonly baseUrl = `${environment.apiBase}/api/MarketplaceListings`;

  constructor(private http: HttpClient) { }

  getActive(): Observable<MarketplaceListingSummary[]> {
    return this.http.get<MarketplaceListingSummary[]>(this.baseUrl);
  }

  getById(listingId: string): Observable<MarketplaceListingDetail> {
    return this.http.get<MarketplaceListingDetail>(`${this.baseUrl}/${listingId}`);
  }
}
