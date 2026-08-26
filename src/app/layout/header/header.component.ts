import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { Role } from '../../core/models/role.model';
import { AuthService } from '../../core/services/auth.service';
import { AdminCircleRequestService } from '../../features/circle-request-management/services/admin-circle-request.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuModule, AvatarModule, BadgeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly approvals = inject(AdminCircleRequestService);

  readonly toggleSidebar = output<void>();
  readonly currentUser = this.auth.currentUser;
  readonly isDark = signal(localStorage.getItem('aml_theme') === 'dark');
  readonly pendingApprovals = signal(0);
  readonly canViewApprovals = this.auth.hasRole(Role.Admin);

  readonly initials = computed(() => {
    const name = this.currentUser()?.fullName ?? '';
    return name.split(' ').slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  });

  readonly userMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'pi pi-user', routerLink: '/console/profile' },
    { label: 'Change Password', icon: 'pi pi-key', routerLink: '/console/change-password' },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.auth.logout() },
  ];

  constructor() {
    if (this.canViewApprovals) {
      this.approvals.getQueue().subscribe({
        next: (requests) => this.pendingApprovals.set(requests.length),
        error: () => this.pendingApprovals.set(0),
      });
    }
  }

  goToApprovals(): void {
    if (this.canViewApprovals) {
      this.router.navigate(['/console/admin/circle-requests']);
    }
  }

  toggleDarkMode(): void {
    this.isDark.update((value) => !value);
    document.documentElement.setAttribute('data-theme', this.isDark() ? 'dark' : 'light');
    localStorage.setItem('aml_theme', this.isDark() ? 'dark' : 'light');
  }
}
