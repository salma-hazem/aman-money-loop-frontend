import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MarketplaceListingService } from '../services/marketplace-listing.service';
import { MarketplaceListingSummary } from '../models/marketplace-listing.model';

@Component({
  selector: 'app-marketplace-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace-browse.component.html',
  styleUrl: './marketplace-browse.component.scss',
})
export class MarketplaceBrowseComponent {
  private router = inject(Router);
  private marketplaceListingService = inject(MarketplaceListingService);

  listings = signal<MarketplaceListingSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.marketplaceListingService.getActive().subscribe({
      next: (listings) => {
        this.listings.set(listings);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'Could not load circles right now. Please try again later.'
        );
      },
    });
  }

  viewDetails(listingId: string): void {
    this.router.navigate(['/marketplace', listingId]);
  }
}
