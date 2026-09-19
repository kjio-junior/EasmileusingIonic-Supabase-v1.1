import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { NotificationsApi, Notification } from '../../../core/notifications.service';

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
        <ion-buttons slot="end">
          @if (unreadCount() > 0) {
            <ion-button (click)="markAllRead()" class="mark-all-btn">
              Mark all read
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      <section class="head">
        <h1>Notifications</h1>
        <p class="sub">Booking updates, treatment notes, and announcements.</p>
      </section>

      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!items().length) {
        <div class="empty">
          <div class="empty-icon">
            <ion-icon name="notifications-outline"></ion-icon>
          </div>
          <h2>All caught up</h2>
          <p>You don't have any notifications yet.</p>
        </div>
      } @else {
        <div class="list">
          @for (n of items(); track n.id) {
            <div
              class="notif-card"
              [class.unread]="!n.is_read"
              (click)="open(n)">
              <div class="notif-icon" [attr.data-type]="n.type">
                <ion-icon [name]="iconFor(n.type)"></ion-icon>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-message">{{ n.message }}</div>
                <div class="notif-date">{{ n.created_at | date:'MMM d, y · h:mm a' }}</div>
              </div>
              @if (!n.is_read) {
                <span class="unread-dot"></span>
              }
            </div>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .mark-all-btn {
      --color: #4EBE7D;
      font-size: 12px;
      font-weight: 700;
      text-transform: none;
    }

    .head { padding: 16px 20px 8px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 13px; margin: 4px 0 0; }

    .list {
      padding: 12px 20px 90px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .notif-card {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 14px;
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e6eef5;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
      position: relative;
    }
    .notif-card:hover { transform: translateY(-1px); }
    .notif-card.unread {
      background: #f0f9f4;
      border-color: #c9ecd7;
    }

    .notif-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 20px; flex: 0 0 auto;
      background: #eef3f8; color: #4a6272;
    }
    .notif-icon[data-type="booking"]   { background: #d9f0fb; color: #1a5a7a; }
    .notif-icon[data-type="status"]    { background: #d7f0e0; color: #1e6b3d; }
    .notif-icon[data-type="treatment"] { background: #f0f9f4; color: #1e6b3d; }
    .notif-icon[data-type="promotion"] { background: #fff4d6; color: #8a6d00; }
    .notif-icon[data-type="message"]   { background: #ece0ff; color: #5a3d8a; }

    .notif-body { flex: 1; min-width: 0; padding-right: 12px; }
    .notif-title { font-size: 14px; font-weight: 700; color: #0A1E29; margin-bottom: 3px; }
    .notif-message { font-size: 12.5px; color: #4a6272; line-height: 1.4; margin-bottom: 6px; }
    .notif-date { font-size: 11px; color: #7a8a97; }

    .unread-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4EBE7D;
      box-shadow: 0 0 0 3px rgba(78,190,125,0.2);
      flex: 0 0 auto;
      margin-top: 6px;
    }

    .loading { display: grid; place-items: center; padding: 60px; }

    .empty { text-align: center; padding: 60px 32px; }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center; font-size: 32px; margin: 0 auto 16px;
    }
    .empty h2 { font-size: 18px; margin: 0 0 6px; color: #0A1E29; }
    .empty p { color: #7a8a97; font-size: 13px; margin: 0; }
  `]
})
export class NotificationsPage implements OnInit {
  items = signal<Notification[]>([]);
  loading = signal(true);

  constructor(
    private api: NotificationsApi,
    private router: Router
  ) {}

  unreadCount = () => this.items().filter(n => !n.is_read).length;

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.list();
      this.items.set(list);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async open(n: Notification) {
    if (!n.is_read) {
      await this.api.markRead(n.id);
      this.items.update(list =>
        list.map(x => x.id === n.id ? { ...x, is_read: true } : x)
      );
    }
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  async markAllRead() {
    await this.api.markAllRead();
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