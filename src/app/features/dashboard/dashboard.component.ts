import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Role } from '../../core/models/role.model';
import { AuthService } from '../../core/services/auth.service';
import { PaymentOverview } from '../agreement-payment/models/payment-transaction.model';
import { MemberLedger } from '../agreement-payment/models/member-ledger.model';
import { MemberLedgerService as PaymentMemberLedgerService } from '../agreement-payment/services/member-ledger.service';
import { PaymentTransactionService } from '../agreement-payment/services/payment-transaction.service';
import { Circle } from '../circle-request-management/models/circle.model';
import { CircleRequestStatus, CircleRequestSummary } from '../circle-request-management/models/circle-request.model';
import { AdminCircleRequestService } from '../circle-request-management/services/admin-circle-request.service';
import { CircleRegistryService } from '../circle-request-management/services/circle-registry.service';
import { CircleRequestService } from '../circle-request-management/services/circle-request.service';
import { MembershipApplicationDetail, MembershipApplicationStage } from '../membership-application/models/membership-application.model';
import { MembershipApplicationService } from '../membership-application/services/membership-application.service';
import { DocumentItem, DocumentStatus } from '../onboarding-memberLedger/models/document.model';
import { DocumentRequirement } from '../onboarding-memberLedger/models/document-requirement.model';
import { OnboardingCase, OnboardingCaseStatus } from '../onboarding-memberLedger/models/onboarding-case.model';
import { DocumentRequirementService } from '../onboarding-memberLedger/services/document-requirement.service';
import { DocumentService } from '../onboarding-memberLedger/services/document.service';
import { OnboardingCaseService } from '../onboarding-memberLedger/services/onboarding-case.service';

interface DashboardMetric {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  route: string;
  tone: 'teal' | 'blue' | 'orange' | 'purple';
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
  primary?: boolean;
}

const MEMBER_STAGES: MembershipApplicationStage[] = [
  'Submitted', 'Shortlisted', 'VerificationScheduled',
  'VerificationCompleted', 'AgreementExtended', 'Confirmed',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly applicationService = inject(MembershipApplicationService);
  private readonly onboardingCaseService = inject(OnboardingCaseService);
  private readonly documentService = inject(DocumentService);
  private readonly documentRequirementService = inject(DocumentRequirementService);
  private readonly paymentLedgerService = inject(PaymentMemberLedgerService);
  private readonly paymentService = inject(PaymentTransactionService);
  private readonly circleRequestService = inject(CircleRequestService);
  private readonly adminRequestService = inject(AdminCircleRequestService);
  private readonly circleRegistryService = inject(CircleRegistryService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly noticeMessage = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);

  readonly memberApplications = signal<MembershipApplicationDetail[]>([]);
  readonly memberOnboardingCase = signal<OnboardingCase | null>(null);
  readonly memberDocuments = signal<DocumentItem[]>([]);
  readonly requiredDocuments = signal<DocumentRequirement[]>([]);
  readonly memberLedger = signal<MemberLedger | null>(null);
  readonly paymentOverview = signal<PaymentOverview | null>(null);
  readonly organizerRequests = signal<CircleRequestSummary[]>([]);
  readonly organizerCircles = signal<Circle[]>([]);
  readonly organizerOnboardingCount = signal(0);
  readonly adminQueue = signal<CircleRequestSummary[]>([]);
  readonly adminCircles = signal<Circle[]>([]);
  readonly adminLedgers = signal<MemberLedger[]>([]);
  readonly activationReadyCount = signal(0);

  readonly role = computed<Role | null>(() => {
    if (this.auth.hasRole(Role.Admin)) return Role.Admin;
    if (this.auth.hasRole(Role.Organizer)) return Role.Organizer;
    if (this.auth.hasRole(Role.Member)) return Role.Member;
    return null;
  });

  readonly currentApplication = computed(() => {
    const applications = [...this.memberApplications()].sort(
      (a, b) => this.applicationTimestamp(b) - this.applicationTimestamp(a)
    );
    return applications.find((item) => !['Confirmed', 'Rejected'].includes(item.stage)) ?? applications[0] ?? null;
  });

  readonly currentStageIndex = computed(() => {
    const current = this.currentApplication();
    return current ? MEMBER_STAGES.indexOf(current.stage) : -1;
  });

  readonly missingDocumentCount = computed(() => {
    const approvedIds = new Set(
      this.memberDocuments()
        .filter((item) => item.status === DocumentStatus.Approved)
        .map((item) => item.documentRequirementId)
    );
    return this.requiredDocuments().filter((item) => !approvedIds.has(item.documentRequirementId)).length;
  });

  readonly ownedCircles = computed(() => {
    const requestIds = new Set(this.organizerRequests().map((item) => item.requestId));
    return this.organizerCircles().filter((circle) => requestIds.has(circle.requestId));
  });

  readonly organizerAttentionRequests = computed(() =>
    [...this.organizerRequests()]
      .filter((item) => ['ModificationRequested', 'Approved'].includes(item.requestStatus))
      .sort((a, b) => this.requestPriority(a.requestStatus) - this.requestPriority(b.requestStatus))
      .slice(0, 5)
  );

  readonly adminCircleStatus = computed(() => {
    const circles = this.adminCircles();
    return {
      open: circles.filter((item) => item.status === 'Open').length,
      recruitment: circles.filter((item) => item.status === 'InRecruitment').length,
      filled: circles.filter((item) => item.status === 'Filled').length,
      closed: circles.filter((item) => item.status === 'Closed').length,
      availableSlots: circles.reduce(
        (total, item) => total + Math.max(0, item.approvedSlots - item.filledCount),
        0
      ),
    };
  });

  readonly memberMetrics = computed<DashboardMetric[]>(() => [
    { label: 'Applications', value: this.memberApplications().length, detail: 'Circle applications submitted', icon: 'pi pi-file', route: '/console/my-applications', tone: 'teal' },
    { label: 'Current Stage', value: this.currentApplication() ? this.stageLabel(this.currentApplication()!.stage) : 'Not started', detail: this.currentApplication()?.title ?? 'Browse the marketplace to begin', icon: 'pi pi-chart-line', route: this.currentApplication() ? '/console/my-applications' : '/console/marketplace', tone: 'blue' },
    { label: 'Documents Required', value: this.memberOnboardingCase() ? this.missingDocumentCount() : '—', detail: this.memberOnboardingCase() ? 'Still needed for onboarding' : 'Available after agreement acceptance', icon: 'pi pi-file-check', route: this.memberOnboardingCase() ? '/console/onboarding/upload' : '/console/my-applications', tone: 'orange' },
    { label: 'Next Contribution', value: this.paymentOverview()?.nextContributionAmount != null ? this.formatMoney(this.paymentOverview()!.nextContributionAmount!) : 'Not active', detail: this.memberLedger() ? 'From your active member ledger' : 'Available after ledger activation', icon: 'pi pi-wallet', route: '/console/payments-receipts', tone: 'purple' },
  ]);

  readonly organizerMetrics = computed<DashboardMetric[]>(() => [
    { label: 'My Requests', value: this.organizerRequests().length, detail: 'All circle requests created by you', icon: 'pi pi-file-edit', route: '/console/circle-requests', tone: 'teal' },
    { label: 'Pending Approval', value: this.organizerRequests().filter((item) => item.requestStatus === 'Submitted').length, detail: 'Waiting for an Admin decision', icon: 'pi pi-clock', route: '/console/circle-requests', tone: 'blue' },
    { label: 'Needs Attention', value: this.organizerAttentionRequests().length, detail: 'Changes requested or ready to publish', icon: 'pi pi-bell', route: '/console/circle-requests', tone: 'orange' },
    { label: 'Active Circles', value: this.ownedCircles().filter((item) => ['Open', 'InRecruitment'].includes(item.status)).length, detail: 'Open or recruiting circles', icon: 'pi pi-sitemap', route: '/console/circle-registry', tone: 'purple' },
  ]);

  readonly adminMetrics = computed<DashboardMetric[]>(() => [
    { label: 'Approval Queue', value: this.adminQueue().length, detail: 'Circle requests awaiting review', icon: 'pi pi-check-square', route: '/console/admin/circle-requests', tone: 'teal' },
    { label: 'Open Circles', value: this.adminCircles().filter((item) => ['Open', 'InRecruitment'].includes(item.status)).length, detail: 'Open or currently recruiting', icon: 'pi pi-sitemap', route: '/console/circle-registry', tone: 'blue' },
    { label: 'Ready to Activate', value: this.activationReadyCount(), detail: 'Approved onboarding cases', icon: 'pi pi-user-plus', route: '/console/onboarding/activation', tone: 'orange' },
    { label: 'Active Ledgers', value: this.adminLedgers().length, detail: 'Activated member ledger records', icon: 'pi pi-book', route: '/console/payments-receipts', tone: 'purple' },
  ]);

  readonly memberActions = computed<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      { label: 'Browse Circles', description: 'Find an open circle that fits your goals.', icon: 'pi pi-shopping-bag', route: '/console/marketplace', primary: !this.currentApplication() },
      { label: 'Track Applications', description: 'Review the latest status of your applications.', icon: 'pi pi-list-check', route: '/console/my-applications', primary: !!this.currentApplication() && !this.memberOnboardingCase() },
    ];
    if (this.memberOnboardingCase()) actions.push({ label: 'Manage Documents', description: 'Upload missing documents and track review status.', icon: 'pi pi-upload', route: '/console/onboarding/upload', primary: this.missingDocumentCount() > 0 });
    if (this.memberLedger()) actions.push({ label: 'Payments & Receipts', description: 'See contribution history and download receipts.', icon: 'pi pi-wallet', route: '/console/payments-receipts' });
    return actions;
  });

  readonly organizerActions: QuickAction[] = [
    { label: 'New Circle Request', description: 'Create and submit a new or replacement circle.', icon: 'pi pi-plus-circle', route: '/console/circle-requests/new', primary: true },
    { label: 'Applicant Pipelines', description: 'Review and progress membership applicants.', icon: 'pi pi-users', route: '/console/pipeline' },
    { label: 'Schedule Verification', description: 'Schedule a shortlisted applicant for review.', icon: 'pi pi-calendar-plus', route: '/console/verification/schedule' },
    { label: 'Review Documents', description: 'Process uploaded onboarding documents.', icon: 'pi pi-file-check', route: '/console/onboarding/review' },
  ];

  readonly adminActions: QuickAction[] = [
    { label: 'Review Approvals', description: 'Approve, reject, or return circle requests.', icon: 'pi pi-check-square', route: '/console/admin/circle-requests', primary: true },
    { label: 'Ledger Activation', description: 'Activate members with completed onboarding.', icon: 'pi pi-user-plus', route: '/console/onboarding/activation' },
    { label: 'Manage Users', description: 'Create Organizer and Admin accounts.', icon: 'pi pi-users', route: '/console/admin/users' },
    { label: 'Circle Registry', description: 'Monitor circle status and slot utilization.', icon: 'pi pi-sitemap', route: '/console/circle-registry' },
  ];

  readonly memberStages = MEMBER_STAGES;

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.noticeMessage.set(null);
    switch (this.role()) {
      case Role.Member: this.loadMemberDashboard(); break;
      case Role.Organizer: this.loadOrganizerDashboard(); break;
      case Role.Admin: this.loadAdminDashboard(); break;
      default: this.failLoading('Your account does not have a supported dashboard role.');
    }
  }

  roleTitle(): string {
    if (this.role() === Role.Admin) return 'Admin Dashboard';
    if (this.role() === Role.Organizer) return 'Organizer Dashboard';
    return 'Member Dashboard';
  }

  roleDescription(): string {
    if (this.role() === Role.Admin) return 'Review approvals, monitor circle capacity, and activate completed members.';
    if (this.role() === Role.Organizer) return 'Move circle requests and members through the next stage of their journey.';
    return 'Track your circle journey and see the next action that needs your attention.';
  }

  stageLabel(stage: MembershipApplicationStage): string {
    return ({ Submitted: 'Submitted', Shortlisted: 'Shortlisted', VerificationScheduled: 'Verification scheduled', VerificationCompleted: 'Verification completed', AgreementExtended: 'Agreement extended', Confirmed: 'Confirmed', Rejected: 'Rejected' })[stage];
  }

  requestStatusLabel(status: CircleRequestStatus): string {
    return ({ Draft: 'Draft', Submitted: 'Pending approval', ModificationRequested: 'Changes requested', Approved: 'Ready to publish', Rejected: 'Rejected', Published: 'Published', Cancelled: 'Cancelled', Fulfilled: 'Fulfilled' })[status];
  }

  requestActionLabel(status: CircleRequestStatus): string {
    if (status === 'ModificationRequested') return 'Edit request';
    if (status === 'Approved') return 'Publish request';
    return 'View request';
  }

  requestRoute(item: CircleRequestSummary): string[] {
    return item.requestStatus === 'ModificationRequested'
      ? ['/console/circle-requests', item.requestId, 'edit']
      : ['/console/circle-requests', item.requestId];
  }

  circleFillPercent(circle: Circle): number {
    return circle.approvedSlots ? Math.min(100, Math.round((circle.filledCount / circle.approvedSlots) * 100)) : 0;
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(value);
  }

  private loadMemberDashboard(): void {
    const user = this.auth.currentUser();
    if (!user) return this.failLoading('Your account information could not be loaded.');
    let partialFailure = false;
    forkJoin({
      applications: this.applicationService.getMine(),
      onboardingCase: this.onboardingCaseService.getMyCase().pipe(catchError((error) => { if (error?.status !== 404) partialFailure = true; return of(null); })),
      ledger: this.paymentLedgerService.getByUserId(user.id).pipe(catchError((error) => { if (error?.status !== 404) partialFailure = true; return of(null); })),
      requirements: this.documentRequirementService.getRequiredOnly().pipe(catchError(() => { partialFailure = true; return of([] as DocumentRequirement[]); })),
    }).subscribe({
      next: ({ applications, onboardingCase, ledger, requirements }) => {
        this.memberApplications.set(applications);
        this.memberOnboardingCase.set(onboardingCase);
        this.memberLedger.set(ledger);
        this.requiredDocuments.set(requirements);
        forkJoin({
          documents: onboardingCase ? this.documentService.getByOnboardingCase(onboardingCase.onboardingCaseId).pipe(catchError(() => { partialFailure = true; return of([] as DocumentItem[]); })) : of([] as DocumentItem[]),
          payments: ledger ? this.paymentService.getPaymentsByMemberLedger(ledger.memberLedgerId).pipe(catchError(() => { partialFailure = true; return of(null); })) : of(null),
        }).pipe(finalize(() => this.finishLoading(partialFailure))).subscribe({
          next: ({ documents, payments }) => { this.memberDocuments.set(documents); this.paymentOverview.set(payments); },
        });
      },
      error: () => this.failLoading('We could not load your dashboard. Please try again.'),
    });
  }

  private loadOrganizerDashboard(): void {
    const user = this.auth.currentUser();
    if (!user) return this.failLoading('Your account information could not be loaded.');
    let partialFailure = false;
    forkJoin({
      requests: this.circleRequestService.getMine(),
      circles: this.circleRegistryService.getAll().pipe(catchError(() => { partialFailure = true; return of([] as Circle[]); })),
      onboarding: this.onboardingCaseService.getByOrganizer(user.id, 1, 5).pipe(catchError(() => { partialFailure = true; return of({ items: [] as OnboardingCase[], pageNumber: 1, pageSize: 5, totalCount: 0, totalPages: 0 }); })),
    }).pipe(finalize(() => this.finishLoading(partialFailure))).subscribe({
      next: ({ requests, circles, onboarding }) => {
        this.organizerRequests.set(requests);
        this.organizerCircles.set(circles);
        this.organizerOnboardingCount.set(onboarding.totalCount);
      },
      error: () => this.failLoading('We could not load the Organizer dashboard. Please try again.'),
    });
  }

  private loadAdminDashboard(): void {
    let partialFailure = false;
    forkJoin({
      queue: this.adminRequestService.getQueue(),
      circles: this.circleRegistryService.getAll().pipe(catchError(() => { partialFailure = true; return of([] as Circle[]); })),
      ledgers: this.paymentLedgerService.getAvailableLedgers().pipe(catchError(() => { partialFailure = true; return of([] as MemberLedger[]); })),
      readyCases: this.onboardingCaseService.getByStatus(OnboardingCaseStatus.Approved, 1, 5).pipe(catchError(() => { partialFailure = true; return of({ items: [] as OnboardingCase[], pageNumber: 1, pageSize: 5, totalCount: 0, totalPages: 0 }); })),
    }).pipe(finalize(() => this.finishLoading(partialFailure))).subscribe({
      next: ({ queue, circles, ledgers, readyCases }) => {
        this.adminQueue.set([...queue].sort((a, b) => new Date(a.submittedAt ?? a.createdAt).getTime() - new Date(b.submittedAt ?? b.createdAt).getTime()));
        this.adminCircles.set(circles);
        this.adminLedgers.set(ledgers);
        this.activationReadyCount.set(readyCases.totalCount);
      },
      error: () => this.failLoading('We could not load the Admin dashboard. Please try again.'),
    });
  }

  private applicationTimestamp(item: MembershipApplicationDetail): number { return new Date(item.updatedAt ?? item.createdAt).getTime(); }
  private requestPriority(status: CircleRequestStatus): number { return status === 'ModificationRequested' ? 0 : status === 'Approved' ? 1 : 2; }
  private finishLoading(partialFailure: boolean): void {
    if (partialFailure) this.noticeMessage.set('Some secondary information is temporarily unavailable. Core actions are still available.');
    this.lastUpdated.set(new Date());
    this.isLoading.set(false);
  }
  private failLoading(message: string): void { this.errorMessage.set(message); this.isLoading.set(false); }
}
