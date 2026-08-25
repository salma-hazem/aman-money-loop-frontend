import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Refresh tokens are single-use on the backend (rotated + revoked on each
// use). If two requests 401 around the same time, each firing its own
// refresh call would burn the token twice - the second refresh fails even
// though the first succeeded, causing a spurious error or logout. This
// guard makes concurrent 401s share a single refresh, so only one refresh
// call is ever in flight at a time.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/api/auth/');

      if (err.status !== 401 || !auth.getToken() || isAuthEndpoint) {
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshedToken$.next(null);

        return auth.refreshTokenRequest().pipe(
          switchMap(() => {
            const newToken = auth.getToken();
            isRefreshing = false;
            refreshedToken$.next(newToken);

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              })
            );
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      }

      // A refresh is already in flight from another request that 401'd
      // around the same time - wait for it instead of starting a second
      // one, then retry this request with the token it produced.
      return refreshedToken$.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
        )
      );
    })
  );
};
