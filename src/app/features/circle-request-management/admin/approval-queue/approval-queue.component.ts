import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CircleRequestSummary } from '../../models/circle-request.model';
import { AdminCircleRequestService } from '../../services/admin-circle-request.service';

@Component({
  selector: 'app-circle-request-approval-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './approval-queue.component.html',
  styleUrls: ['../../circle-management.shared.scss', './approval-queue.component.scss'],
})
export class ApprovalQueueComponent {
  private readonly service = inject(AdminCircleRequestService);

  readonly requests = signal<CircleRequestSummary[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly newCircleCount = computed(() =>
    this.requests().filter((request) => request.circleType === 'NewCircle').length
  );
  readonly replacementCount = computed(() =>
    this.requests().filter((request) => request.circleType === 'Replacement').length
  );

  constructor() {
    this.loadQueue();
  }

  loadQueue(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.getQueue().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('The approval queue could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
