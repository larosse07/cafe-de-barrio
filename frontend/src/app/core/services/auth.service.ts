import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
import { AuthResponse, LoginRequest, UserInfo } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<UserInfo | null>(this.loadStoredUser());
  private readonly _accessToken = signal<string | null>(this.getStoredItem(APP_CONSTANTS.AUTH_ACCESS_KEY));

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken() && !!this._user());
  readonly isAdmin = computed(() => this._user()?.rol === 'ADMIN');

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => this.persistSession(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      throw new Error('No hay refresh token disponible');
    }
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(response => this.persistSession(response))
    );
  }

  fetchCurrentUser(): Observable<UserInfo> {
    return this.api.get<UserInfo>('/auth/me').pipe(
      tap(user => {
        this._user.set(user);
        this.setStoredItem(APP_CONSTANTS.AUTH_USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(redirectToLogin = true): Observable<unknown> {
    const refreshToken = this.getRefreshToken();
    const request$ = refreshToken
      ? this.api.post('/auth/logout', { refreshToken }).pipe(catchError(() => of(null)))
      : of(null);

    return request$.pipe(
      finalize(() => {
        this.clearSession();
        if (redirectToLogin) {
          this.router.navigate(['/admin/login']);
        }
      })
    );
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this.getStoredItem(APP_CONSTANTS.AUTH_REFRESH_KEY);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    this.removeStoredItem(APP_CONSTANTS.AUTH_ACCESS_KEY);
    this.removeStoredItem(APP_CONSTANTS.AUTH_REFRESH_KEY);
    this.removeStoredItem(APP_CONSTANTS.AUTH_USER_KEY);
  }

  private persistSession(response: AuthResponse): void {
    this._accessToken.set(response.accessToken);
    this._user.set(response.user);
    this.setStoredItem(APP_CONSTANTS.AUTH_ACCESS_KEY, response.accessToken);
    this.setStoredItem(APP_CONSTANTS.AUTH_REFRESH_KEY, response.refreshToken);
    this.setStoredItem(APP_CONSTANTS.AUTH_USER_KEY, JSON.stringify(response.user));
  }

  private loadStoredUser(): UserInfo | null {
    const raw = this.getStoredItem(APP_CONSTANTS.AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  }

  private getStoredItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStoredItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignorar si almacenamiento no está disponible
    }
  }

  private removeStoredItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignorar
    }
  }
}
