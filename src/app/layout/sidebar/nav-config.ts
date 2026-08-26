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
    label: 'Marketplace & Membership',
    items: [
      {
        label: 'Marketplace',
        icon: 'pi pi-shopping-bag',
        route: '/console/marketplace',
        roles: [Role.Member],
      },
      {
        label: 'My Applications',
        icon: 'pi pi-file',
        route: '/console/my-applications',
        roles: [Role.Member],
      },
      {
        label: 'Applicant Pipeline',
        icon: 'pi pi-list',
        route: '/console/pipeline',
        roles: [Role.Organizer, Role.Admin],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'My Profile',
        icon: 'pi pi-user',
        route: '/console/profile',
        roles: [Role.Member, Role.Organizer, Role.Admin],
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
    label: 'Verification',
    items: [
      {
        label: 'Schedule Verification',
        icon: 'pi pi-calendar-plus',
        route: '/console/verification/schedule',
        roles: [Role.Organizer, Role.Admin],
      },
      {
        label: 'Verification Checklist',
        icon: 'pi pi-check-circle',
        route: '/console/verification/checklist',
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
        label: 'Upload Documents',
        icon: 'pi pi-upload',
        route: '/console/onboarding/upload',
        roles: [Role.Member],
      },
      {
        label: 'Document Review',
        icon: 'pi pi-file-check',
        route: '/console/onboarding/review',
        roles: [Role.Organizer, Role.Admin],
      },
      {
        label: 'Ledger Activation',
        icon: 'pi pi-user-plus',
        route: '/console/onboarding/activation',
        roles: [Role.Admin],
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
