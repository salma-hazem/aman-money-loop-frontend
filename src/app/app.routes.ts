import { Routes } from '@angular/router';
import {
  authGuard,
  guestRedirectGuard,
  passwordChangeGuard,
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
        redirectTo: '/console/change-password',
        pathMatch: 'full',
      },
      {
        path: 'forgot-password',
        canActivate: [guestRedirectGuard],
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component')
            .then((m) => m.ForgotPasswordComponent),
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
        path: 'marketplace',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            './features/membership-application/marketplace-browse/marketplace-browse.component'
          ).then((m) => m.MarketplaceBrowseComponent),
      },

      {
        path: 'marketplace/:listingId',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            './features/membership-application/circle-details/circle-details.component'
          ).then((m) => m.CircleDetailsComponent),
      },

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
    canActivateChild: [passwordChangeGuard],

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
      // Module 1 - Profile & Account Security
      // =================================================

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/profile/profile.component')
            .then((m) => m.ProfileComponent),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component')
            .then((m) => m.ChangePasswordComponent),
      },

      // =================================================
      // Module 2 - Circle Request & Configuration Management
      // =================================================

      {
        path: 'circle-requests',
        canActivate: [roleGuard([Role.Organizer])],
        loadComponent: () =>
          import(
            './features/circle-request-management/organizer/request-list/request-list.component'
          ).then((m) => m.RequestListComponent),
      },
      {
        path: 'circle-requests/new',
        canActivate: [roleGuard([Role.Organizer])],
        loadComponent: () =>
          import(
            './features/circle-request-management/organizer/request-form/request-form.component'
          ).then((m) => m.RequestFormComponent),
      },
      {
        path: 'circle-requests/:id/edit',
        canActivate: [roleGuard([Role.Organizer])],
        loadComponent: () =>
          import(
            './features/circle-request-management/organizer/request-form/request-form.component'
          ).then((m) => m.RequestFormComponent),
      },
      {
        path: 'circle-requests/:id',
        canActivate: [roleGuard([Role.Organizer])],
        loadComponent: () =>
          import(
            './features/circle-request-management/organizer/request-details/request-details.component'
          ).then((m) => m.RequestDetailsComponent),
      },
      {
        path: 'admin/circle-requests',
        canActivate: [roleGuard([Role.Admin])],
        loadComponent: () =>
          import(
            './features/circle-request-management/admin/approval-queue/approval-queue.component'
          ).then((m) => m.ApprovalQueueComponent),
      },
      {
        path: 'admin/circle-requests/:id',
        canActivate: [roleGuard([Role.Admin])],
        loadComponent: () =>
          import(
            './features/circle-request-management/admin/approval-details/approval-details.component'
          ).then((m) => m.ApprovalDetailsComponent),
      },
      {
        path: 'circle-registry',
        canActivate: [roleGuard([Role.Organizer, Role.Admin])],
        loadComponent: () =>
          import(
            './features/circle-request-management/registry/circle-registry/circle-registry.component'
          ).then((m) => m.CircleRegistryComponent),
      },

      // =================================================
      // Module 5 - Agreement & Payment
      // =================================================

      {
        path: 'agreement-generator',
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
        children: [
          {
            path: 'upload',
            canActivate: [roleGuard([Role.Member])],
            loadComponent: () =>
              import('./features/onboarding-memberLedger/member-upload/upload.component')
                .then((m) => m.OnboardingUploadComponent),
          },
          {
            path: 'review',
            canActivate: [roleGuard([Role.Organizer, Role.Admin])],
            loadComponent: () =>
              import('./features/onboarding-memberLedger/organizer-review/onboarding-review.component')
                .then((m) => m.OnboardingReviewComponent),
          },
          {
            path: 'activation',
            canActivate: [roleGuard([Role.Admin])],
            loadComponent: () =>
              import('./features/onboarding-memberLedger/admin-activation/member-ledger-activation.component')
                .then((m) => m.MemberLedgerActivationComponent),
          },
        ]
      },

      // =================================================
      // Module 1 - Admin User Management
      // =================================================

      {
        path: 'admin/users',
        canActivate: [roleGuard([Role.Admin])],
        loadComponent: () =>
          import('./features/admin/users/user-management.component')
            .then((m) => m.UserManagementComponent),
      },

      // =================================================
      // Module 3 - Circle Marketplace & Membership Applications
      // =================================================
      // Applicant Pipeline selector (no listing specified). Organizer/Admin only.
      {
        path: 'pipeline',
        canActivate: [roleGuard([Role.Organizer, Role.Admin])],
        loadComponent: () =>
          import(
            './features/membership-application/pipeline/pipeline.component'
          ).then((m) => m.PipelineComponent),
      },

      // Screen 17 - Applicant Pipeline. Organizer/Admin only.
      {
        path: 'listings/:listingId/pipeline',
        canActivate: [roleGuard([Role.Organizer, Role.Admin])],
        loadComponent: () =>
          import(
            './features/membership-application/pipeline/pipeline.component'
          ).then((m) => m.PipelineComponent),
      },

      // Screen 18 - Applicant Details. Organizer/Admin only.
      {
        path: 'applicants/:id',
        canActivate: [roleGuard([Role.Organizer, Role.Admin])],
        loadComponent: () =>
          import(
            './features/membership-application/applicant-details/applicant-details.component'
          ).then((m) => m.ApplicantDetailsComponent),
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
    loadComponent: () =>
      import('./features/not-found/not-found.component')
        .then((m) => m.NotFoundComponent),
  },
];
