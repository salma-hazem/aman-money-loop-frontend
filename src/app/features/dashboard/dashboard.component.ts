import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingCaseService } from '../onboarding-memberLedger/services/onboarding-case.service';
import { OnboardingCase } from '../onboarding-memberLedger/models/onboarding-case.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private onboardingService = inject(OnboardingCaseService);

  // استخدام الـ Interface الصحيح OnboardingCase
  onboardingCase = signal<OnboardingCase | null>(null);
  isLoadingCase = signal<boolean>(true);

  ngOnInit(): void {
    if (this.auth.role() === 'Member') {
      this.loadMyOnboardingCase();
    } else {
      this.isLoadingCase.set(false);
    }
  }

  loadMyOnboardingCase() {
    // تأكد إن الدالة في الـ Service عندك اسمها getMyCase (أو شيلها وحط اسم الدالة الموجودة في الـ service)
    this.onboardingService.getMyCase().subscribe({
      next: (res: OnboardingCase) => {
        this.onboardingCase.set(res);
        this.isLoadingCase.set(false);
      },
      error: (err: any) => {
        console.log('No active onboarding case found or not created yet.', err);
        this.isLoadingCase.set(false);
      }
    });
  }
}