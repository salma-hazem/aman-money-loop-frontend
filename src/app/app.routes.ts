import { Routes } from '@angular/router';
import {
  authGuard,
  guestRedirectGuard,
  roleGuard,
} from './core/guards/auth.guard';
import { Role } from './core/models/role.model';

export const routes: Routes = [

  // =====================================================
  // Public pages
  // =====================================================
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-shell/public-shell.component')
        .then((m) => m.PublicShellComponent),

    children: [

      // Public landing page
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/landing/landing.component')
            .then((m) => m.LandingComponent),
      },

      // Login
      {
        path: 'login',
        canActivate: [guestRedirectGuard],
        loadComponent: () =>
          import('./features/auth/login/login.component')
            .then((m) => m.LoginComponent),
      },

      {
        path: 'change-password',
        loadComponent: () =>
          import(
            './features/auth/change-password/change-password.component'
          ).then((m) => m.ChangePasswordComponent),
      },
      {
        path: 'register',
        canActivate: [guestRedirectGuard],
        loadComponent: () =>
          import(
            './features/auth/register/register.component'
          ).then((m) => m.RegisterComponent),
      },

      {
        path: 'confirm-otp',
        loadComponent: () =>
          import(
            './features/auth/confirm-otp/confirm-otp.component'
          ).then((m) => m.ConfirmOtpComponent),
      },
      // Member opens this from the secure agreement email link.
      // Must remain public because the token in the URL authenticates
      // the agreement response.
      {
        path: 'agreement-response',
        loadComponent: () =>
          import(
            './features/agreement-payment/agreement-response/agreement-response.component'
          ).then((m) => m.AgreementResponseComponent),
      },

      // Screen 9 - Circle Application Form. Public: guests and members can apply.
      {
        path: 'marketplace/:listingId/apply',
        loadComponent: () =>
          import(
            './features/membership-application/apply/apply.component'
          ).then((m) => m.ApplyComponent),
      },
    ],
  },

  // =====================================================
  // Authenticated application
  // =====================================================
  {
    path: 'console',
    canActivate: [authGuard],

    loadComponent: () =>
      import('./layout/console-shell/console-shell.component')
        .then((m) => m.ConsoleShellComponent),

    children: [

      // Main Aman Money Loop dashboard
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then((m) => m.DashboardComponent),
      },

      // =================================================
      // Module 5 - Agreement & Payment
      // =================================================

      {
        path: 'agreement-generator',
        canActivate: [
          roleGuard([Role.Organizer])
        ],
        loadComponent: () =>
          import(
            './features/agreement-payment/agreement-generator/agreement-generator.component'
          ).then((m) => m.AgreementGeneratorComponent),
      },

      {
        path: 'payments-receipts',
        loadComponent: () =>
          import(
            './features/agreement-payment/payments-receipts/payments-receipts.component'
          ).then((m) => m.PaymentsReceiptsComponent),
      },

      // =================================================
      // Module 6 - Onboarding
      // =================================================

      {
        path: 'onboarding',
        loadComponent: () =>
          import('./features/onboarding/onboarding.component')
            .then((m) => m.OnboardingComponent),
      },

      // =================================================
      // Module 1 - Admin User Management
      // =================================================

      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/users/user-management.component')
            .then((m) => m.UserManagementComponent),
      },

      // =================================================
      // Module 3 - Circle Marketplace & Membership Applications
      // =================================================

      // Screen 17 - Applicant Pipeline. Organizer/Admin only.
      {
        path: 'listings/:listingId/pipeline',
        canActivate: [roleGuard([Role.Organizer, Role.Admin])],
        loadComponent: () =>
          import(
            './features/membership-application/pipeline/pipeline.component'
          ).then((m) => m.PipelineComponent),
      },
    ],
  },

  // =====================================================
  // Temporary compatibility redirects
  // Preserve your old Module 5 URLs
  // =====================================================

  {
    path: 'agreement-generator',
    redirectTo: 'console/agreement-generator',
    pathMatch: 'full',
  },

  {
    path: 'payments-receipts',
    redirectTo: 'console/payments-receipts',
    pathMatch: 'full',
  },

  // =====================================================
  // Unknown routes
  // =====================================================

  {
    path: '**',
    redirectTo: '',
  },
];
