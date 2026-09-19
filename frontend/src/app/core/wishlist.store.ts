import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WishlistItem {
  id: string;
  created_at: string;
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    duration_minutes: number;
  };
}

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  readonly ids = signal<Set<string>>(new Set());
  readonly loaded = signal(false);

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ items: WishlistItem[] }>(`${environment.apiUrl}/wishlist`)
      );
      const ids = new Set(res.items.map(i => i.service.id));
      this.ids.set(ids);
    } catch {
      this.ids.set(new Set());
    } finally {
      this.loaded.set(true);
    }
  }

  has(serviceId: string): boolean {
    return this.ids().has(serviceId);
  }

  async toggle(serviceId: string): Promise<void> {
    const currently = this.ids().has(serviceId);

    // Optimistic
    this.ids.update(s => {
      const next = new Set(s);
      if (currently) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });

    try {
      if (currently) {
        await firstValueFrom(
          this.http.delete(`${environment.apiUrl}/wishlist/${serviceId}`)
        );
      } else {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/wishlist`, { service_id: serviceId })
        );
      }
    } catch {
      // Revert
      this.ids.update(s => {
        const next = new Set(s);
        if (currently) next.add(serviceId);
        else next.delete(serviceId);
        return next;
      });
    }
  }

  async list(): Promise<WishlistItem[]> {
    return firstValueFrom(
      this.http.get<{ items: WishlistItem[] }>(`${environment.apiUrl}/wishlist`)
    ).then(r => r.items);
  }
}