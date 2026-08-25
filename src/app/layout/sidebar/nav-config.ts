import { Role } from '../../core/models/role.model';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_CONFIG: NavGroup[] = [
  {
    label: '',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/console',
        roles: [Role.Member, Role.Organizer, Role.Admin],
      },
    ],
  },

  {
    label: 'Membership',
    items: [
      {
        label: 'Applicant Pipeline',
        icon: 'pi pi-list',
        route: '/console/pipeline',
        roles: [Role.Organizer, Role.Admin],
      },
      {
        label: 'My Profile',
        icon: 'pi pi-user',
        route: '/console/profile',
      },
    ],
  },

  {
    label: 'Circle Management',
    items: [
      {
        label: 'Circle Requests',
        icon: 'pi pi-file-edit',
        route: '/console/circle-requests',
        roles: [Role.Organizer],
      },
      {
        label: 'Approval Queue',
        icon: 'pi pi-check-square',
        route: '/console/admin/circle-requests',
        roles: [Role.Admin],
      },
      {
        label: 'Circle Registry',
        icon: 'pi pi-sitemap',
        route: '/console/circle-registry',
        roles: [Role.Organizer, Role.Admin],
      },
    ],
  },

  {
    label: 'Agreement & Payment',
    items: [
      {
        label: 'Payments & Receipts',
        icon: 'pi pi-wallet',
        route: '/console/payments-receipts',
        roles: [Role.Member, Role.Organizer, Role.Admin],
      },
    ],
  },

  {
    label: 'Onboarding',
    items: [
      {
        label: 'Onboarding',
        icon: 'pi pi-user-plus',
        route: '/console/onboarding',
        roles: [Role.Organizer, Role.Admin],
      },
    ],
  },

  {
    label: 'Administration',
    items: [
      {
        label: 'Users',
        icon: 'pi pi-users',
        route: '/console/admin/users',
        roles: [Role.Admin],
      },
    ],
  },
];
