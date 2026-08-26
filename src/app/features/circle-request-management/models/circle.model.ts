export type CircleStatus = 'Open' | 'InRecruitment' | 'Filled' | 'Closed';
export type CircleSlotStatus = 'Vacant' | 'Assigned' | 'Locked';
export type MarketplaceListingStatus = 'Active' | 'Completed' | 'Cancelled';

export interface MarketplaceListingReference {
  listingId: string;
  circleId: string;
  listingStatus: MarketplaceListingStatus;
}

export interface Circle {
  circleId: string;
  requestId: string;
  circleTitle: string;
  approvedSlots: number;
  filledCount: number;
  amount: number;
  duration: number;
  status: CircleStatus;
  marketplaceListing: MarketplaceListingReference | null;
}

export interface CircleSlot {
  circleSlotId: string;
  circleId: string;
  memberLedgerId: string | null;
  slotNumber: number;
  status: CircleSlotStatus;
  vacatedAt: string | null;
  assignedAt: string | null;
}

