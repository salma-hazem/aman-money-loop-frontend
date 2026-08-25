import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MarketplaceListingService } from '../services/marketplace-listing.service';
import { MarketplaceListingSummary } from '../models/marketplace-listing.model';

@Component({
  selector: 'app-marketplace-browse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marketplace-browse.component.html',
  styleUrl: './marketplace-browse.component.scss',
})
export class MarketplaceBrowseComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private marketplaceListingService = inject(MarketplaceListingService);

  listings = signal<MarketplaceListingSummary[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    minContribution: [''],
    maxContribution: [''],
    minDuration: [''],
    maxDuration: [''],
    minAvailableSlots: [''],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const raw = this.filterForm.getRawValue();

    this.marketplaceListingService
      .getActive({
        search: raw.search || undefined,
        minContribution: raw.minContribution ? Number(raw.minContribution) : undefined,
        maxContribution: raw.maxContribution ? Number(raw.maxContribution) : undefined,
        minDuration: raw.minDuration ? Number(raw.minDuration) : undefined,
        maxDuration: raw.maxDuration ? Number(raw.maxDuration) : undefined,
        minAvailableSlots: raw.minAvailableSlots ? Number(raw.minAvailableSlots) : undefined,
      })
      .subscribe({
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

  search(): void {
    this.load();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      minContribution: '',
      maxContribution: '',
      minDuration: '',
      maxDuration: '',
      minAvailableSlots: '',
    });
    this.load();
  }

  viewDetails(listingId: string): void {
    this.router.navigate(['/marketplace', listingId]);
  }
}
