import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MarketplaceListingService } from '../services/marketplace-listing.service';
import { MarketplaceListingDetail } from '../models/marketplace-listing.model';
import { ListingSummary } from '../models/membership-application.model';

@Component({
  selector: 'app-circle-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circle-details.component.html',
  styleUrl: './circle-details.component.scss',
})
export class CircleDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private marketplaceListingService = inject(MarketplaceListingService);

  listingId = this.route.snapshot.paramMap.get('listingId') ?? '';

  listing = signal<MarketplaceListingDetail | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    if (!this.listingId) {
      this.errorMessage.set('No circle was specified.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.marketplaceListingService.getById(this.listingId).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 404) {
          this.errorMessage.set('This circle could not be found.');
        } else {
          this.errorMessage.set('An unexpected error occurred while loading this circle.');
        }
      },
    });
  }

  apply(): void {
    const listing = this.listing();
    if (!listing) {
      return;
    }

    const listingSummary: ListingSummary = {
      listingId: listing.listingId,
      title: listing.title,
      monthlyContribution: listing.monthlyContribution,
      durationMonths: listing.durationMonths,
      availableSlots: listing.availableSlots,
    };

    this.router.navigate(['/marketplace', listing.listingId, 'apply'], {
      state: { listingSummary },
    });
  }

  goBack(): void {
    this.router.navigate(['/marketplace']);
  }
}
