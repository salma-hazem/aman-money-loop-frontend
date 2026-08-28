import { Component, computed, inject, input, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/services/auth.service';
import { NAV_CONFIG, NavGroup } from './nav-config';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private auth = inject(AuthService);
  readonly language = inject(LanguageService);

  /** Two-way bound from the console shell so the toggle button in the header can drive this too. */
  collapsed = model(false);

  currentUser = this.auth.currentUser;

  /** Nav groups filtered down to what the signed-in role can see; groups left empty after filtering are dropped. */
  visibleGroups = computed<NavGroup[]>(() => {
    return NAV_CONFIG.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.some((role) => this.auth.hasRole(role))
      ),
    })).filter((group) => group.items.length > 0);
  });

  initials = computed(() => {
    const name = this.currentUser()?.fullName ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  });

  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.language.translate('My Profile'),
      icon: 'pi pi-user',
      routerLink: '/console/profile',
    },
    {
      label: this.language.translate('Change Password'),
      icon: 'pi pi-key',
      routerLink: '/console/change-password',
    },
    { separator: true },
    {
      label: this.language.translate('Sign Out'),
      icon: 'pi pi-sign-out',
      command: () => this.auth.logout(),
    },
  ]);
}
