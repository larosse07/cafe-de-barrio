import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { APP_CONSTANTS } from '../constants/app.constants';

export type QueryParamValue = string | number | boolean | null | undefined;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private buildUrl(endpoint: string): string {
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.config.apiBaseUrl}${cleanPath}`;
  }

  private buildParams(params?: Record<string, QueryParamValue>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, QueryParamValue>): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(endpoint), { params: this.buildParams(params) })
      .pipe(timeout(APP_CONSTANTS.HTTP_TIMEOUT_MS));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(endpoint), body)
      .pipe(timeout(APP_CONSTANTS.HTTP_TIMEOUT_MS));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(endpoint), body)
      .pipe(timeout(APP_CONSTANTS.HTTP_TIMEOUT_MS));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(endpoint), body)
      .pipe(timeout(APP_CONSTANTS.HTTP_TIMEOUT_MS));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(endpoint))
      .pipe(timeout(APP_CONSTANTS.HTTP_TIMEOUT_MS));
  }
}
