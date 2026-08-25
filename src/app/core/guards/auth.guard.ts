import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/role.model';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

export const roleGuard = (allowed: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.hasRole(...allowed)) {
      return router.createUrlTree(['/console']);
    }
    return true;
  };
};

export const guestRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
  ? router.createUrlTree(['/console'])
  : true;
};

export const passwordChangeGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();

  if (user?.mustChangePassword && state.url !== '/console/change-password') {
    return router.createUrlTree(['/console/change-password']);
  }
  return true;
};
