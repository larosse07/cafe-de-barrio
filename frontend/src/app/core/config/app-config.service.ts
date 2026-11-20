import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RuntimeConfig {
  apiBaseUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private apiUrl: string = environment.apiBaseUrl;

  async load(): Promise<void> {
    try {
      const response = await fetch('/assets/runtime-config.json', { cache: 'no-store' });
      if (response.ok) {
        const config = (await response.json()) as RuntimeConfig;
        if (config.apiBaseUrl && config.apiBaseUrl.trim().length > 0) {
          this.apiUrl = config.apiBaseUrl.trim().replace(/\/+$/, '');
        }
      }
    } catch {
      // Mantiene el valor configurado en environment.ts si no hay archivo runtime externo
    }
  }

  get apiBaseUrl(): string {
    return this.apiUrl;
  }
}
