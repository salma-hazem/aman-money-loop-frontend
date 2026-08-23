import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, Role } from '../models/role.model';

interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  roles: Role[];
}

const TOKEN_KEY = 'aml_token';
const REFRESH_TOKEN_KEY = 'aml_refresh_token';
const USER_KEY = 'aml_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = environment.apiBase;

  private _currentUser = signal<CurrentUser | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();

  isLoggedIn = computed(() => this._currentUser() !== null);
  role = computed(() => this._currentUser()?.roles?.[0] ?? null);

  hasRole(...roles: Role[]): boolean {
    const userRoles = this._currentUser()?.roles ?? [];
    return roles.some((role) => userRoles.includes(role));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.base}/api/auth/login`,
        { email, password }
      )
      .pipe(
        tap((res) => {
          const user: CurrentUser = {
            id: res.userId,
            fullName: res.fullName,
            email: res.email,
            roles: res.roles,
            mustChangePassword: res.mustChangePassword,
          };

          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
          );

          this._currentUser.set(user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  refreshTokenRequest(): Observable<AuthResponse> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.base}/api/auth/refresh-token`, { accessToken, refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        }),
      );
  }

  private loadUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.base}/api/auth/change-password`,
      {
        currentPassword,
        newPassword,
      }
    );
  }

  markPasswordChanged(): void {
    const currentUser = this._currentUser();

    if (!currentUser) {
      return;
    }

    const updatedUser: CurrentUser = {
      ...currentUser,
      mustChangePassword: false,
    };

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    this._currentUser.set(updatedUser);
  }

  register(request: {
    firstName: string;
    lastName: string;
    nationalId: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Observable<string> {
    return this.http.post<string>(
      `${this.base}/api/auth/register`,
      request
    );
  }

  confirmOtp(
    userId: string,
    otp: string
  ): Observable<void> {
    return this.http.post<void>(
      `${this.base}/api/auth/confirm-otp`,
      {
        userId,
        code: otp,
      }
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/api/auth/forgot-password`, { email });
  }

  resetPassword(userId: string, code: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/api/auth/reset-password`, { userId, code, newPassword });
  }
}