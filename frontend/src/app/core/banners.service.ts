import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  position: 'hero' | 'featured' | 'sidebar' | 'footer';
  order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class BannersApi {
  constructor(private http: HttpClient) {}

  // Customer: only active banners
  listActive(position?: string): Promise<Banner[]> {
    const params: Record<string, string> = {};
    if (position) params['position'] = position;
    return firstValueFrom(
      this.http.get<{ banners: Banner[] }>(`${environment.apiUrl}/banners`, { params })
    ).then(r => r.banners);
  }
}