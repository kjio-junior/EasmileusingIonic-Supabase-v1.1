import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { NotificationsApi, Notification } from '../../core/notifications.service';

@Component({
  standalone: true,
  selector: 'app-notification-bell',
  imports: [CommonModule, IonIcon, IonSpinner],
  template: `
    <button type="button" class="fab" (click)="open.set(true)">
      <ion-icon name="notifications-outline"></ion-icon>
      @if (notifications.unread() > 0) {
        <span class="badge">{{ notifications.unread() > 99 ? '99+' : notifications.unread() }}</span>
      }
    </button>

    @if (open()) {
      <div class="overlay" (click)="open.set(false)"></div>
      <div class="panel">
        <header class="panel-head">
          <div class="panel-title">Notifications</div>
          <div class="panel-actions">
            @if (notifications.unread() > 0) {
              <button type="button" class="mark-all" (click)="markAllRead()">Mark all read</button>
            }
            <button type="button" class="close" (click)="open.set(false)">
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
        </header>

        <div class="panel-body">
          @if (loading()) {
            <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
          } @else if (!items().length) {
            <div class="empty">
              <ion-icon name="notifications-off-outline"></ion-icon>
              <p>All caught up</p>
            </div>
          } @else {
            @for (n of items(); track n.id) {
              <div class="row" [class.unread]="!n.is_read" (click)="tap(n)">
                <div class="icon" [attr.data-type]="n.type">
                  <ion-icon [name]="iconFor(n.type)"></ion-icon>
                </div>
                <div class="body">
                  <div class="title">{{ n.title }}</div>
                  <div class="msg">{{ n.message }}</div>
                  <div class="when">{{ n.created_at | date:'MMM d, h:mm a' }}</div>
                </div>
                @if (!n.is_read) {
                  <span class="dot"></span>
                }
              </div>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .fab {
      position: fixed;
      bottom: 76px;
      right: 16px;
      z-index: 300;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 0;
      background: #0A1E29;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      display: grid; place-items: center;
      box-shadow: 0 8px 20px rgba(10,30,41,0.28);
      transition: transform 0.15s;
    }
    .fab:hover { transform: scale(1.06); }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      border-radius: 9999px;
      background: #e74c6b;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      display: grid; place-items: center;
      border: 2px solid #ffffff;
    }

    .overlay {
      position: fixed; inset: 0;
      background: rgba(10,30,41,0.35);
      z-index: 1400;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .panel {
      position: fixed;
      bottom: 76px;
      right: 16px;
      width: 380px;
      max-width: calc(100vw - 32px);
      max-height: 560px;
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(10,30,41,0.28);
      z-index: 1500;
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }

    .panel-head {
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid #eef3f8;
    }
    .panel-title { font-size: 15px; font-weight: 700; color: #0A1E29; }
    .panel-actions { display: flex; align-items: center; gap: 4px; }

    .mark-all {
      border: 0;
      background: transparent;
      color: #4EBE7D;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      padding: 6px 10px;
      border-radius: 9999px;
    }
    .mark-all:hover { background: #f0f9f4; }

    .close {
      width: 32px; height: 32px;
      border: 0; background: transparent;
      color: #7a8a97;
      border-radius: 50%;
      cursor: pointer;
      display: grid; place-items: center;
      font-size: 20px;
    }
    .close:hover { background: #f2f8fc; color: #0A1E29; }

    .panel-body { flex: 1; overflow-y: auto; padding: 8px; }

    .loading { padding: 40px; display: grid; place-items: center; }
    .empty { padding: 40px 20px; text-align: center; color: #7a8a97; }
    .empty ion-icon { font-size: 40px; color: #b0bcc6; }
    .empty p { font-size: 13px; margin: 8px 0 0; }

    .row {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .row:hover { background: #f7fafc; }
    .row.unread { background: #f0f9f4; }
    .row.unread:hover { background: #e6f4eb; }

    .icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: grid; place-items: center;
      font-size: 18px; flex: 0 0 auto;
      background: #eef3f8; color: #4a6272;
    }
    .icon[data-type="booking"]   { background: #d9f0fb; color: #1a5a7a; }
    .icon[data-type="status"]    { background: #d7f0e0; color: #1e6b3d; }
    .icon[data-type="treatment"] { background: #f0f9f4; color: #1e6b3d; }
    .icon[data-type="promotion"] { background: #fff4d6; color: #8a6d00; }
    .icon[data-type="message"]   { background: #ece0ff; color: #5a3d8a; }

    .body { flex: 1; min-width: 0; }
    .title { font-size: 13px; font-weight: 700; color: #0A1E29; margin-bottom: 2px; }
    .msg { font-size: 12px; color: #4a6272; line-height: 1.4; margin-bottom: 4px; }
    .when { font-size: 10px; color: #7a8a97; }

    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4EBE7D;
      flex: 0 0 auto;
      margin-top: 6px;
    }

    @media (max-width: 480px) {
      .panel {
        left: 8px; right: 8px; bottom: 76px;
        width: auto; max-width: none;
        max-height: calc(100vh - 100px);
      }
    }
  `]
})
export class NotificationBellComponent {
  open = signal(false);
  items = signal<Notification[]>([]);
  loading = signal(false);

  constructor(
    public notifications: NotificationsApi,
    private router: Router
  ) {
    // Refresh list when panel opens
    effect(() => {
      if (this.open()) {
        this.load();
      }
    });

    // Refresh count on construct
    this.notifications.refreshCount();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.notifications.list();
      this.items.set(list);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async tap(n: Notification) {
    if (!n.is_read) {
      await this.notifications.markRead(n.id);
      this.items.update(list =>
        list.map(x => x.id === n.id ? { ...x, is_read: true } : x)
      );
    }
    if (n.link) {
      this.open.set(false);
      this.router.navigateByUrl(n.link);
    }
  }

  async markAllRead() {
    await this.notifications.markAllRead();
    this.items.update(list => list.map(x => ({ ...x, is_read: true })));
  }

  iconFor(type: string): string {
    switch (type) {
      case 'booking':   return 'calendar-outline';
      case 'status':    return 'checkmark-circle-outline';
      case 'treatment': return 'medical-outline';
      case 'promotion': return 'pricetag-outline';
      case 'message':   return 'chatbubble-outline';
      default:          return 'notifications-outline';
    }
  }
}