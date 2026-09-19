import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from './notifications.service';

@Injectable({ providedIn: 'root' })
export class AdminNotificationsApi {
  readonly unread = signal(0);

  constructor(private http: HttpClient) {}

  async list(): Promise<Notification[]> {
    const res = await firstValueFrom(
      this.http.get<{ notifications: Notification[] }>(
        `${environment.apiUrl}/admin/notifications/mine`
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
          `${environment.apiUrl}/admin/notifications/unread-count`
        )
      );
      this.unread.set(res.count);
    } catch {
      this.unread.set(0);
    }
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/admin/notifications/${id}/read`, {})
    );
    this.unread.update(n => Math.max(0, n - 1));
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/admin/notifications/read-all`, {})
    );
    this.unread.set(0);
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/admin/notifications/${id}`)
    );
    this.refreshCount();
  }
}