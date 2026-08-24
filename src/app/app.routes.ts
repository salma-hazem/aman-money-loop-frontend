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
      import('./layout/public-shell/public-shell.component').then(
        (m) => m.PublicShellComponent
      ),

    children: [
      // =================================================
      // Landing Page
      // =================================================
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/landing/landing.component').then(
            (m) => m.LandingComponent
          ),
      },

      // =================================================
      // Authentication
      // =================================================
      {
        path: 'login',
        canActivate: [guestRedirectGuard],
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },

      {
        path: 'register',
        canActivate: [guestRedirectGuard],
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },

      {
        path: 'confirm-otp',
        loadComponent: () =>
          import('./features/auth/confirm-otp/confirm-otp.component').then(
            (m) => m.ConfirmOtpComponent
          ),
      },

      {
        path: 'change-password',
        loadComponent: () =>
          import(
            './features/auth/change-password/change-password.component'
          ).then((m) => m.ChangePasswordComponent),
      },

      // =================================================
      // Public Agreement Response
      // =================================================
      //
      // Must remain public.
      //
      // The secure agreement token in the URL is what
      // authorizes access to the agreement response.
      //
      {
        path: 'agreement-response',
        loadComponent: () =>
          import(
            './features/agreement-payment/agreement-response/agreement-response.component'
          ).then((m) => m.AgreementResponseComponent),
      },

      // =================================================
      // Public Marketplace Application
      // =================================================
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
  // Authenticated Application
  // =====================================================
  {
    path: 'console',

    canActivate: [authGuard],

    loadComponent: () =>
      import('./layout/console-shell/console-shell.component').then(
        (m) => m.ConsoleShellComponent
      ),

    children: [
      // =================================================
      // Dashboard
      // Member / Organizer / Admin
      // =================================================
      {
        path: '',
        pathMatch: 'full',

        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },

      // =================================================
      // Applicant Pipeline
      // Organizer / Admin
      // =================================================
      //
      // Clean sidebar entry point.
      //
      // We will update PipelineComponent so that when this
      // route is opened without a listingId, it resolves the
      // appropriate listing instead of requiring a manually
      // typed URL.
      //
      {
        path: 'pipeline',

        canActivate: [
          roleGuard([
            Role.Organizer,
            Role.Admin,
          ]),
        ],

        loadComponent: () =>
          import(
            './features/membership-application/pipeline/pipeline.component'
          ).then((m) => m.PipelineComponent),
      },

      // =================================================
      // Listing-specific Applicant Pipeline
      // Organizer / Admin
      // =================================================
      //
      // Keep this route because other pages can navigate
      // directly to the pipeline for a known listing.
      //
      {
        path: 'listings/:listingId/pipeline',

        canActivate: [
          roleGuard([
            Role.Organizer,
            Role.Admin,
          ]),
        ],

        loadComponent: () =>
          import(
            './features/membership-application/pipeline/pipeline.component'
          ).then((m) => m.PipelineComponent),
      },

      // =================================================
      // Module 5 - Agreement Generation
      // Organizer only
      // =================================================
      {
        path: 'agreement-generator',

        canActivate: [
          roleGuard([
            Role.Organizer,
          ]),
        ],

        loadComponent: () =>
          import(
            './features/agreement-payment/agreement-generator/agreement-generator.component'
          ).then((m) => m.AgreementGeneratorComponent),
      },

      // =================================================
      // Module 5 - Payments & Receipts
      // Member / Organizer / Admin
      // =================================================
      {
        path: 'payments-receipts',

        canActivate: [
          roleGuard([
            Role.Member,
            Role.Organizer,
            Role.Admin,
          ]),
        ],

        loadComponent: () =>
          import(
            './features/agreement-payment/payments-receipts/payments-receipts.component'
          ).then((m) => m.PaymentsReceiptsComponent),
      },

      // =================================================
      // Module 6 - Onboarding
      // Organizer / Admin
      // =================================================
      {
        path: 'onboarding',

        canActivate: [
          roleGuard([
            Role.Organizer,
            Role.Admin,
          ]),
        ],

        loadComponent: () =>
          import('./features/onboarding/onboarding.component').then(
            (m) => m.OnboardingComponent
          ),
      },

      // =================================================
      // Module 1 - Admin User Management
      // Admin only
      // =================================================
      {
        path: 'admin/users',

        canActivate: [
          roleGuard([
            Role.Admin,
          ]),
        ],

        loadComponent: () =>
          import(
            './features/admin/users/user-management.component'
          ).then((m) => m.UserManagementComponent),
      },
    ],
  },

  // =====================================================
  // Temporary Compatibility Redirects
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
  // Unknown Routes
  // =====================================================

  {
    path: '**',
    redirectTo: '',
  },
];
