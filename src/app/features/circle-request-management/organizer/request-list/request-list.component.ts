import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CircleRequestStatus,
  CircleRequestSummary,
} from '../../models/circle-request.model';
import { CircleRequestService } from '../../services/circle-request.service';

type RequestFilter = 'All' | CircleRequestStatus;

@Component({
  selector: 'app-circle-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-list.component.html',
  styleUrls: ['../../circle-management.shared.scss', './request-list.component.scss'],
})
export class RequestListComponent {
  private readonly service = inject(CircleRequestService);

  readonly requests = signal<CircleRequestSummary[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedFilter = signal<RequestFilter>('All');
  readonly filters: RequestFilter[] = [
    'All',
    'Draft',
    'Submitted',
    'ModificationRequested',
    'Approved',
    'Published',
    'Rejected',
    'Cancelled',
  ];

  readonly filteredRequests = computed(() => {
    const filter = this.selectedFilter();
    return filter === 'All'
      ? this.requests()
      : this.requests().filter((request) => request.requestStatus === filter);
  });

  constructor() {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.getMine().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('We could not load your circle requests. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: RequestFilter): void {
    this.selectedFilter.set(filter);
  }

  canEdit(request: CircleRequestSummary): boolean {
    return request.requestStatus === 'Draft' || request.requestStatus === 'ModificationRequested';
  }

  statusLabel(status: CircleRequestStatus): string {
    const labels: Record<CircleRequestStatus, string> = {
      Draft: 'Draft',
      Submitted: 'Pending Approval',
      ModificationRequested: 'Changes Requested',
      Approved: 'Approved',
      Rejected: 'Rejected',
      Published: 'Published',
      Cancelled: 'Cancelled',
    };
    return labels[status];
  }

  statusClass(status: CircleRequestStatus): string {
    return status.toLowerCase();
  }
}

