import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuditLogEntry, CircleRequest } from '../../models/circle-request.model';
import { AdminCircleRequestService } from '../../services/admin-circle-request.service';
import { ConfirmationService } from 'primeng/api';

type Decision = 'reject' | 'modify';

@Component({
  selector: 'app-circle-request-approval-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './approval-details.component.html',
  styleUrls: ['../../circle-management.shared.scss', './approval-details.component.scss'],
})
export class ApprovalDetailsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AdminCircleRequestService);
  private readonly confirmation = inject(ConfirmationService);

  readonly requestId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly request = signal<CircleRequest | null>(null);
  readonly audit = signal<AuditLogEntry[]>([]);
  readonly isLoading = signal(true);
  readonly actionInFlight = signal<string | null>(null);
  readonly activeDecision = signal<Decision | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly reasonForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    this.loadDetails();
  }

  loadDetails(): void {
    if (!this.requestId) {
      this.errorMessage.set('No request was selected.');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    forkJoin({
      request: this.service.getById(this.requestId),
      audit: this.service.getAudit(this.requestId),
    }).subscribe({
      next: ({ request, audit }) => {
        this.request.set(request);
        this.audit.set(audit);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('The request review information could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  approve(): void {
    this.confirmation.confirm({
      header: 'Approve request?',
      message: 'This decision will be recorded in the audit trail and the Organizer will be notified.',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Approve',
      rejectLabel: 'Continue Reviewing',
      accept: () => {
        this.actionInFlight.set('approve');
        this.errorMessage.set(null);
        this.service.approve(this.requestId).subscribe({
          next: () => this.router.navigate(['/console/admin/circle-requests']),
          error: (error) => this.handleActionError(error),
        });
      },
    });
  }

  openDecision(decision: Decision): void {
      this.activeDecision.set(decision);
      this.reasonForm.reset();

      setTimeout(() => {
        document.getElementById('decision-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        document.getElementById('reason')?.focus();
      }, 0);
    }

  closeDecision(): void {
    this.activeDecision.set(null);
    this.reasonForm.reset();
  }

  submitDecision(): void {
    if (this.reasonForm.invalid || !this.activeDecision()) {
      this.reasonForm.markAllAsTouched();
      return;
    }
    const decision = this.activeDecision()!;
    const request = { reason: this.reasonForm.getRawValue().reason.trim() };
    this.actionInFlight.set(decision);
    this.errorMessage.set(null);
    const action$ = decision === 'reject'
      ? this.service.reject(this.requestId, request)
      : this.service.requestModification(this.requestId, request);
    action$.subscribe({
      next: () => this.router.navigate(['/console/admin/circle-requests']),
      error: (error) => this.handleActionError(error),
    });
  }

  private handleActionError(error: any): void {
    this.actionInFlight.set(null);
    this.errorMessage.set(error?.error?.detail ?? error?.error?.message ?? 'The decision could not be saved.');
  }
}
