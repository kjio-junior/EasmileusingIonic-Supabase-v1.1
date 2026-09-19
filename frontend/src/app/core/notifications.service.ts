import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  type: 'booking' | 'status' | 'treatment' | 'promotion' | 'system' | 'message';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  readonly unread = signal(0);

  constructor(private http: HttpClient) {}

  async list(): Promise<Notification[]> {
    const res = await firstValueFrom(
      this.http.get<{ notifications: Notification[] }>(
        `${environment.apiUrl}/notifications`
      )
    );
    const list = res.notifications;
    this.unread.set(list.filter(n => !n.is_read).length);
    return list;
  }

  async refreshCount(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ count: number }>(
          `${environment.apiUrl}/notifications/unread-count`
        )
      );
      this.unread.set(res.count);
    } catch {
      this.unread.set(0);
    }
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/notifications/${id}/read`, {})
    );
    this.unread.update(n => Math.max(0, n - 1));
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/notifications/read-all`, {})
    );
    this.unread.set(0);
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/notifications/${id}`)
    );
    this.refreshCount();
  }
}