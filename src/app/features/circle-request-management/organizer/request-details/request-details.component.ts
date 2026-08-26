import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CircleRequest, CircleRequestStatus } from '../../models/circle-request.model';
import { CircleRequestService } from '../../services/circle-request.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-circle-request-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-details.component.html',
  styleUrls: ['../../circle-management.shared.scss', './request-details.component.scss'],
})
export class RequestDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CircleRequestService);
  private readonly confirmation = inject(ConfirmationService);

  readonly requestId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly request = signal<CircleRequest | null>(null);
  readonly isLoading = signal(true);
  readonly actionInFlight = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  constructor() {
    this.loadRequest();
  }

  loadRequest(): void {
    if (!this.requestId) {
      this.errorMessage.set('No circle request was selected.');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.service.getById(this.requestId).subscribe({
      next: (request) => {
        this.request.set(request);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('The selected circle request could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  submitForApproval(): void {
    this.confirmation.confirm({
      header: 'Submit for approval?',
      message: 'You cannot edit this request while it is under Admin review.',
      icon: 'pi pi-send',
      acceptLabel: 'Submit Request',
      rejectLabel: 'Keep Editing',
      accept: () => this.runAction('submit', () => this.service.submit(this.requestId), 'Request submitted for approval.'),
    });
  }

  publish(): void {
    this.confirmation.confirm({
      header: 'Publish circle?',
      message: 'The approved request will become available to the marketplace.',
      icon: 'pi pi-megaphone',
      acceptLabel: 'Publish',
      rejectLabel: 'Cancel',
      accept: () => this.runAction('publish', () => this.service.publish(this.requestId), 'Circle published to the marketplace.'),
    });
  }

  cancel(): void {
    this.confirmation.confirm({
      header: 'Cancel request?',
      message: 'This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancel Request',
      rejectLabel: 'Keep Request',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.runAction('cancel', () => this.service.cancel(this.requestId), 'Circle request cancelled.'),
    });
  }

  canEdit(): boolean {
    const status = this.request()?.requestStatus;
    return status === 'Draft' || status === 'ModificationRequested';
  }

  canSubmit(): boolean {
    return this.canEdit();
  }

  canPublish(): boolean {
    return this.request()?.requestStatus === 'Approved';
  }

  canCancel(): boolean {
    return ['Draft', 'Submitted', 'ModificationRequested', 'Approved', 'Published'].includes(
      this.request()?.requestStatus ?? ''
    );
  }

  statusLabel(status: CircleRequestStatus): string {
    return status === 'Submitted'
      ? 'Pending Approval'
      : status === 'ModificationRequested'
        ? 'Changes Requested'
        : status;
  }

  statusClass(status: CircleRequestStatus): string {
    return status.toLowerCase();
  }

  private runAction(
    action: string,
    requestFactory: () => ReturnType<CircleRequestService['submit']>,
    success: string
  ): void {
    this.actionInFlight.set(action);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    requestFactory().subscribe({
      next: (request) => {
        this.request.set(request);
        this.actionInFlight.set(null);
        this.successMessage.set(success);
      },
      error: (error) => {
        this.actionInFlight.set(null);
        this.errorMessage.set(error?.error?.detail ?? error?.error?.message ?? 'The action could not be completed.');
      },
    });
  }
}
