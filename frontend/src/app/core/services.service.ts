import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'preventive'|'restorative'|'cosmetic'|'surgical'|'diagnostic';
  duration_minutes: number;
  image_url: string | null;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ServicesApi {
  readonly services = signal<Service[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<{ services: Service[] }>(`${environment.apiUrl}/services`)
      );
      this.services.set(res.services);
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Failed to load services');
    } finally {
      this.loading.set(false);
    }
  }
}