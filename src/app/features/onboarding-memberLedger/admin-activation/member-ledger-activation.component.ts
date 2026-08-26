import { Component, inject, signal, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { OnboardingCaseService } from '../services/onboarding-case.service';
import { MemberLedgerService } from '../services/member-ledger.service';
import { OnboardingCase, OnboardingCaseStatus } from '../models/onboarding-case.model';

@Component({
  selector: 'app-member-ledger-activation',
  standalone: true,
  imports: [CardModule, TagModule, ButtonModule, MessageModule, CheckboxModule, FormsModule],
  templateUrl: './member-ledger-activation.component.html',
  styleUrl: './member-ledger-activation.component.scss',
})
export class MemberLedgerActivationComponent implements OnInit {
  private caseService = inject(OnboardingCaseService);
  private ledgerService = inject(MemberLedgerService);

  cases = signal<OnboardingCase[]>([]);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  activatingId = signal<string | null>(null);

  ngOnInit(): void {
    this.caseService.getByStatus(OnboardingCaseStatus.Approved, 1, 20).subscribe({
      next: (result) => this.cases.set(result.items),
      error: () => this.error.set('Failed to load approved cases.'),
    });
  }

  activate(item: OnboardingCase): void {
    this.activatingId.set(item.onboardingCaseId);
    this.error.set(null);

    this.ledgerService.activate({
      userId: item.userId,
      onboardingCaseId: item.onboardingCaseId,
    }).subscribe({
      next: () => {
        this.success.set('Member activated successfully.');
        this.cases.update((c) => c.filter((x) => x.onboardingCaseId !== item.onboardingCaseId));
        this.activatingId.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Activation failed.');
        this.activatingId.set(null);
      },
    });
  }
}