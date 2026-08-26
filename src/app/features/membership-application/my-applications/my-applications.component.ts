import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MembershipApplicationService } from '../services/membership-application.service';
import { MembershipApplicationDetail } from '../models/membership-application.model';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
})
export class MyApplicationsComponent {
  private membershipApplicationService = inject(MembershipApplicationService);

  applications = signal<MembershipApplicationDetail[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.membershipApplicationService.getMine().subscribe({
      next: (applications) => {
        this.applications.set(applications);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'Could not load your applications right now. Please try again later.'
        );
      },
    });
  }
}
