export type MarketplaceListingStatus = 'Active' | 'Completed' | 'Cancelled';

export interface MarketplaceListingSummary {
  listingId: string;
  circleId: string;
  title: string;
  listingStatus: MarketplaceListingStatus;
  monthlyContribution: number;
  durationMonths: number;
  totalSlots: number;
  availableSlots: number;
}

export interface MarketplaceListingDetail extends MarketplaceListingSummary {
  filledSlots: number;
}

// All optional - matches the backend's MarketplaceListingQueryDto query params.
export interface MarketplaceListingQuery {
  search?: string;
  minContribution?: number;
  maxContribution?: number;
  minDuration?: number;
  maxDuration?: number;
  minAvailableSlots?: number;
}
