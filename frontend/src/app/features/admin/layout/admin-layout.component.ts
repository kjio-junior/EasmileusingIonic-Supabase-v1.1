import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonRouterOutlet, IonIcon, IonSpinner, IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem,
  ToastController
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminAuthService } from '../../../core/admin-auth.service';
import { AdminNotificationsApi } from '../../../core/admin-notifications.service';
import { Notification } from '../../../core/notifications.service';
import { environment } from '../../../../environments/environment';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  roles: string[];
}

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    RouterLink, RouterLinkActive,
    IonRouterOutlet, IonIcon, IonSpinner,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem
  ],
  template: `
    <div class="admin-shell" [class.sidebar-open]="sidebarOpen()">

      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="closeSidebar()"></div>
      }

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand">
            <strong>EA<span class="accent">smile</span></strong>
            <span>{{ roleLabel() }}</span>
          </div>
          <button class="close-button" type="button" (click)="closeSidebar()">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <nav class="nav">
          @for (item of visibleNav(); track item.path) {
            <a class="nav-link"
               [routerLink]="item.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.path === '/ea-admin/dashboard' }"
               (click)="closeSidebar()">
              <ion-icon [name]="item.icon"></ion-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-bottom">
          @if (auth.user(); as u) {
            <div class="who">
              <div class="avatar">{{ initials(u.first_name, u.last_name) }}</div>
              <div class="who-text">
                <div class="who-name">{{ u.first_name }} {{ u.last_name }}</div>
                <div class="who-role">{{ roleLabel() }}</div>
              </div>
            </div>
          }
          <button class="logout-button" type="button" (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main">
        <header class="mobile-header">
          <button class="hamburger" type="button" (click)="toggleSidebar()">
            <ion-icon name="menu-outline"></ion-icon>
          </button>
          <strong>EA<span class="accent">smile</span> {{ roleLabel() }}</strong>
          <div class="spacer"></div>
          <button class="bell-btn" type="button" (click)="toggleBell()">
            <ion-icon name="notifications-outline"></ion-icon>
            @if (notifications.unread() > 0) {
              <span class="bell-badge">{{ notifications.unread() > 99 ? '99+' : notifications.unread() }}</span>
            }
          </button>
        </header>

        <section class="page-container">
          <ion-router-outlet></ion-router-outlet>
        </section>

        <!-- FLOATING BELL (desktop) -->
        <button class="bell-fab" type="button" (click)="toggleBell()" [class.hidden]="bellOpen()">
          <ion-icon name="notifications-outline"></ion-icon>
          @if (notifications.unread() > 0) {
            <span class="bell-badge">{{ notifications.unread() > 99 ? '99+' : notifications.unread() }}</span>
          }
        </button>

        <!-- FLOATING PANEL -->
        @if (bellOpen()) {
          <div class="bell-overlay" (click)="closeBell()"></div>
          <div class="bell-panel">
            <header class="bell-head">
              <div class="bell-tabs">
                <button type="button" class="bell-tab" [class.active]="bellTab() === 'inbox'" (click)="bellTab.set('inbox')">
                  Inbox
                  @if (notifications.unread() > 0) {
                    <span class="tab-count">{{ notifications.unread() }}</span>
                  }
                </button>
                @if (isAdmin()) {
                  <button type="button" class="bell-tab" [class.active]="bellTab() === 'send'" (click)="bellTab.set('send')">
                    Send
                  </button>
                }
              </div>
              <button class="bell-close" type="button" (click)="closeBell()">
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </header>

            @if (bellTab() === 'inbox') {
              <div class="bell-body">
                @if (bellLoading()) {
                  <div class="bell-loading"><ion-spinner name="crescent"></ion-spinner></div>
                } @else if (!bellItems().length) {
                  <div class="bell-empty">
                    <ion-icon name="notifications-off-outline"></ion-icon>
                    <p>All caught up</p>
                  </div>
                } @else {
                  @if (notifications.unread() > 0) {
                    <button type="button" class="mark-all" (click)="markAllRead()">
                      Mark all as read
                    </button>
                  }
                  @for (n of bellItems(); track n.id) {
                    <div
                      class="notif-row"
                      [class.unread]="!n.is_read"
                      (click)="openNotif(n)">
                      <div class="notif-icon" [attr.data-type]="n.type">
                        <ion-icon [name]="notifIcon(n.type)"></ion-icon>
                      </div>
                      <div class="notif-content">
                        <div class="notif-title">{{ n.title }}</div>
                        <div class="notif-msg">{{ n.message }}</div>
                        <div class="notif-when">{{ n.created_at | date:'MMM d, h:mm a' }}</div>
                      </div>
                      @if (!n.is_read) {
                        <span class="notif-dot"></span>
                      }
                    </div>
                  }
                }
              </div>
            } @else {
              <div class="bell-body">
                <div class="send-form">
                  <label class="send-label">Type</label>
                  <ion-item lines="none" class="send-field">
                    <ion-select [(ngModel)]="bType" [disabled]="bSending()">
                      <ion-select-option value="promotion">Promotion</ion-select-option>
                      <ion-select-option value="system">System</ion-select-option>
                      <ion-select-option value="message">Message</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <label class="send-label">Audience</label>
                  <ion-item lines="none" class="send-field">
                    <ion-select [(ngModel)]="bAudience" [disabled]="bSending()">
                      <ion-select-option value="patients">All patients</ion-select-option>
                      <ion-select-option value="staff">Staff & dentists</ion-select-option>
                      <ion-select-option value="all">Everyone</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <label class="send-label">Title *</label>
                  <ion-item lines="none" class="send-field">
                    <ion-input [(ngModel)]="bTitle" placeholder="Announcement title" [disabled]="bSending()"></ion-input>
                  </ion-item>

                  <label class="send-label">Message *</label>
                  <ion-item lines="none" class="send-field send-field-textarea">
                    <ion-textarea
                      [(ngModel)]="bMessage"
                      placeholder="Write the announcement..."
                      [autoGrow]="true"
                      rows="4"
                      [disabled]="bSending()">
                    </ion-textarea>
                  </ion-item>

                  <label class="send-label">Link (optional)</label>
                  <ion-item lines="none" class="send-field">
                    <ion-input [(ngModel)]="bLink" placeholder="/app/services" [disabled]="bSending()"></ion-input>
                  </ion-item>

                  @if (bError()) {
                    <div class="send-err">{{ bError() }}</div>
                  }

                  <button type="button" class="send-btn" (click)="broadcast()" [disabled]="bSending()">
                    @if (bSending()) {
                      <ion-spinner name="crescent"></ion-spinner>
                    } @else {
                      Send Announcement
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .admin-shell {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background: #f5f8fb;
      position: relative;
    }

    /* SIDEBAR */
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: 260px;
      display: flex;
      flex-direction: column;
      background: #0A1E29;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      z-index: 1000;
    }
    .admin-shell.sidebar-open .sidebar { transform: translateX(0); }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 22px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { display: flex; flex-direction: column; color: #ffffff; }
    .brand strong { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .accent { color: #4EBE7D; }
    .brand span { font-size: 11px; opacity: 0.6; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

    .close-button {
      display: flex; border: 0; background: transparent;
      color: #ffffff; font-size: 24px; cursor: pointer; padding: 4px;
    }

    .nav {
      display: flex; flex-direction: column; gap: 4px;
      padding: 14px 12px; flex: 1; overflow-y: auto;
    }
    .nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 12px;
      color: #b8c4ce; text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.06); color: #ffffff; }
    .nav-link.active { background: #4EBE7D; color: #ffffff; font-weight: 600; }
    .nav-link ion-icon { font-size: 20px; }

    .sidebar-bottom { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .who { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #4EBE7D; color: #ffffff;
      display: grid; place-items: center;
      font-size: 13px; font-weight: 700; flex: 0 0 auto;
    }
    .who-name { font-size: 13px; font-weight: 600; color: #ffffff; }
    .who-role { font-size: 11px; color: #93D5ED; text-transform: capitalize; }

    .logout-button {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      background: transparent; color: #ffffff;
      cursor: pointer; font-size: 13px;
      transition: background 0.15s;
    }
    .logout-button:hover { background: rgba(255,255,255,0.08); }
    .logout-button ion-icon { font-size: 18px; }

    /* MAIN */
    .main {
      flex: 1; min-width: 0; min-height: 100vh;
      display: flex; flex-direction: column; position: relative;
    }
    .mobile-header {
      height: 60px; display: flex; align-items: center; gap: 14px;
      padding: 0 18px; background: #ffffff;
      border-bottom: 1px solid #e5e9ec;
    }
    .mobile-header strong { color: #0A1E29; font-size: 16px; }
    .spacer { flex: 1; }

    .hamburger {
      display: flex; align-items: center; justify-content: center;
      width: 42px; height: 42px;
      border: 0; background: transparent;
      color: #0A1E29; font-size: 25px; cursor: pointer;
    }

    .bell-btn {
      position: relative;
      width: 42px; height: 42px;
      border: 0; background: #f2f8fc;
      border-radius: 50%;
      color: #0A1E29; font-size: 22px;
      display: grid; place-items: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .bell-btn:hover { background: #e6f4fb; }

    .page-container {
      flex: 1; min-width: 0; min-height: 0; position: relative;
    }
    ion-router-outlet { display: block; width: 100%; height: 100%; }

    .sidebar-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 900;
    }

    /* FLOATING BELL */
    .bell-fab {
      position: fixed;
      top: 24px;
      right: 32px;
      z-index: 500;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 0;
      background: #ffffff;
      color: #0A1E29;
      font-size: 24px;
      cursor: pointer;
      display: grid; place-items: center;
      box-shadow: 0 4px 16px rgba(10,30,41,0.12);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .bell-fab:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(10,30,41,0.16); }
    .bell-fab.hidden { display: none; }

    .bell-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 9999px;
      background: #e74c6b;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      display: grid; place-items: center;
      border: 2px solid #ffffff;
    }

    /* PANEL */
    .bell-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10,30,41,0.25);
      z-index: 1400;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .bell-panel {
      position: fixed;
      top: 24px;
      right: 32px;
      width: 420px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(10,30,41,0.24);
      z-index: 1500;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }

    .bell-head {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid #eef3f8;
    }
    .bell-tabs { display: flex; gap: 6px; flex: 1; }
    .bell-tab {
      position: relative;
      padding: 8px 14px;
      border: 0;
      background: transparent;
      color: #7a8a97;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border-radius: 9999px;
      font-family: inherit;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .bell-tab:hover { background: #f2f8fc; color: #0A1E29; }
    .bell-tab.active { background: #0A1E29; color: #ffffff; }
    .tab-count {
      background: #e74c6b; color: #ffffff;
      font-size: 10px; font-weight: 700;
      padding: 1px 6px;
      border-radius: 9999px;
      min-width: 16px;
      text-align: center;
    }

    .bell-close {
      width: 32px; height: 32px;
      border: 0; background: transparent;
      color: #7a8a97;
      border-radius: 50%;
      cursor: pointer;
      display: grid; place-items: center;
      font-size: 20px;
    }
    .bell-close:hover { background: #f2f8fc; color: #0A1E29; }

    .bell-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .bell-loading { padding: 40px; display: grid; place-items: center; }
    .bell-empty {
      text-align: center;
      padding: 40px 20px;
      color: #7a8a97;
    }
    .bell-empty ion-icon { font-size: 40px; color: #b0bcc6; }
    .bell-empty p { font-size: 13px; margin: 8px 0 0; }

    .mark-all {
      display: block;
      width: calc(100% - 8px);
      margin: 4px;
      padding: 10px;
      background: #f0f9f4;
      color: #1e6b3d;
      border: 0;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    .mark-all:hover { background: #d7f0e0; }

    .notif-row {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;
    }
    .notif-row:hover { background: #f7fafc; }
    .notif-row.unread { background: #f0f9f4; }
    .notif-row.unread:hover { background: #e6f4eb; }

    .notif-icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: grid; place-items: center;
      font-size: 18px; flex: 0 0 auto;
      background: #eef3f8; color: #4a6272;
    }
    .notif-icon[data-type="booking"]   { background: #d9f0fb; color: #1a5a7a; }
    .notif-icon[data-type="status"]    { background: #d7f0e0; color: #1e6b3d; }
    .notif-icon[data-type="treatment"] { background: #f0f9f4; color: #1e6b3d; }
    .notif-icon[data-type="promotion"] { background: #fff4d6; color: #8a6d00; }
    .notif-icon[data-type="message"]   { background: #ece0ff; color: #5a3d8a; }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 700; color: #0A1E29; margin-bottom: 2px; }
    .notif-msg { font-size: 12px; color: #4a6272; line-height: 1.4; margin-bottom: 4px; }
    .notif-when { font-size: 10px; color: #7a8a97; }

    .notif-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4EBE7D;
      flex: 0 0 auto;
      margin-top: 6px;
    }

    /* SEND FORM */
    .send-form { padding: 12px; }
    .send-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #0A1E29;
      margin: 12px 0 6px 4px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .send-field {
      --background: #f2f8fc;
      --border-radius: 12px;
      --padding-start: 12px;
      --inner-padding-end: 12px;
      --color: #0A1E29;
      --min-height: 44px;
      border-radius: 12px;
      border: 1px solid #e6eef5;
    }
    .send-field ion-input,
    .send-field ion-textarea,
    .send-field ion-select {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 13px;
      --color: #0A1E29;
    }
    .send-field-textarea { --min-height: 80px; align-items: flex-start; padding: 6px 0; }

    .send-err {
      margin-top: 12px;
      padding: 10px 12px;
      background: #ffe0e0;
      color: #8a1a1a;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
    }

    .send-btn {
      width: 100%;
      height: 44px;
      margin-top: 16px;
      background: #0A1E29;
      color: #ffffff;
      border: 0;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
      display: grid; place-items: center;
    }
    .send-btn:hover { background: #142635; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .send-btn ion-spinner { --color: #ffffff; width: 18px; height: 18px; }

    /* DESKTOP */
    @media (min-width: 1024px) {
      .sidebar { transform: translateX(0); }
      .sidebar-overlay { display: none; }
      .close-button { display: none; }
      .main { margin-left: 260px; }
      .mobile-header { display: none; }
    }

    @media (max-width: 640px) {
      .bell-panel {
        top: 8px; right: 8px; left: 8px; bottom: 8px;
        width: auto; max-width: none; max-height: none;
        border-radius: 16px;
      }
      .bell-fab { top: 12px; right: 12px; width: 46px; height: 46px; font-size: 22px; }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);

  // Bell state
  bellOpen = signal(false);
  bellTab = signal<'inbox' | 'send'>('inbox');
  bellItems = signal<Notification[]>([]);
  bellLoading = signal(false);

  // Send form
  bType = 'system';
  bAudience = 'patients';
  bTitle = '';
  bMessage = '';
  bLink = '';
  bSending = signal(false);
  bError = signal<string | null>(null);

  private navItems: NavItem[] = [
    { path: '/ea-admin/dashboard',    icon: 'grid-outline',        label: 'Dashboard',    roles: ['admin', 'staff', 'dentist'] },
    { path: '/ea-admin/appointments', icon: 'calendar-outline',    label: 'Appointments', roles: ['admin', 'staff', 'dentist'] },
    { path: '/ea-admin/patients',     icon: 'person-outline',      label: 'Patients',     roles: ['admin', 'staff', 'dentist'] },
    { path: '/ea-admin/users',        icon: 'people-outline',      label: 'Users',        roles: ['admin'] },
    { path: '/ea-admin/services',     icon: 'construct-outline',   label: 'Services',     roles: ['admin', 'staff', 'dentist'] },
    { path: '/ea-admin/reviews',      icon: 'star-outline',        label: 'Reviews',      roles: ['admin'] },
    { path: '/ea-admin/inventory',    icon: 'cube-outline',        label: 'Inventory',    roles: ['admin', 'staff'] },
    { path: '/ea-admin/reports',      icon: 'stats-chart-outline', label: 'Reports',      roles: ['admin'] },
    { path: '/ea-admin/banners',      icon: 'images-outline',      label: 'Banners',      roles: ['admin'] },
    { path: '/ea-admin/faqs',         icon: 'help-circle-outline', label: 'FAQs',         roles: ['admin'] },
    { path: '/ea-admin/settings',     icon: 'settings-outline',    label: 'Settings',     roles: ['admin'] },
    { path: '/ea-admin/audit',        icon: 'document-text-outline', label: 'Audit Trail', roles: ['admin'] }
  ];

  visibleNav = computed(() => {
    const role = this.auth.user()?.role;
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  });

  roleLabel = computed(() => {
    const role = this.auth.user()?.role;
    if (role === 'admin')   return 'Admin';
    if (role === 'dentist') return 'Dentist';
    if (role === 'staff')   return 'Staff';
    return '';
  });

  isAdmin = computed(() => this.auth.user()?.role === 'admin');

  constructor(
    public auth: AdminAuthService,
    private router: Router,
    public notifications: AdminNotificationsApi,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {
    if (this.auth.token()) {
      this.notifications.refreshCount();
    }
  }

  toggleSidebar() { this.sidebarOpen.update(open => !open); }
  closeSidebar() { this.sidebarOpen.set(false); }

  initials(first: string, last: string): string {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  }

  async toggleBell() {
    const next = !this.bellOpen();
    this.bellOpen.set(next);
    if (next && this.bellTab() === 'inbox') {
      await this.loadBellItems();
    }
  }

  closeBell() {
    this.bellOpen.set(false);
  }

  async loadBellItems() {
    this.bellLoading.set(true);
    try {
      const list = await this.notifications.list();
      this.bellItems.set(list);
    } catch {
      this.bellItems.set([]);
    } finally {
      this.bellLoading.set(false);
    }
  }

  async openNotif(n: Notification) {
    if (!n.is_read) {
      await this.notifications.markRead(n.id);
      this.bellItems.update(list =>
        list.map(x => x.id === n.id ? { ...x, is_read: true } : x)
      );
    }
    if (n.link) {
      this.closeBell();
      this.router.navigateByUrl(n.link);
    }
  }

  async markAllRead() {
    await this.notifications.markAllRead();
    this.bellItems.update(list => list.map(x => ({ ...x, is_read: true })));
  }

  notifIcon(type: string): string {
    switch (type) {
      case 'booking':   return 'calendar-outline';
      case 'status':    return 'checkmark-circle-outline';
      case 'treatment': return 'medical-outline';
      case 'promotion': return 'pricetag-outline';
      case 'message':   return 'chatbubble-outline';
      default:          return 'notifications-outline';
    }
  }

  async broadcast() {
    this.bError.set(null);
    if (!this.bTitle.trim()) { this.bError.set('Title is required'); return; }
    if (!this.bMessage.trim()) { this.bError.set('Message is required'); return; }

    this.bSending.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<{ ok: boolean; sent: number }>(
          `${environment.apiUrl}/admin/notifications/broadcast`,
          {
            type: this.bType,
            audience: this.bAudience,
            title: this.bTitle.trim(),
            message: this.bMessage.trim(),
            link: this.bLink.trim() || undefined
          }
        )
      );
      const t = await this.toastCtrl.create({
        message: `Sent to ${res.sent} user${res.sent === 1 ? '' : 's'}`,
        duration: 2000, position: 'bottom', color: 'success'
      });
      await t.present();
      this.bTitle = '';
      this.bMessage = '';
      this.bLink = '';
    } catch (e: any) {
      this.bError.set(e?.error?.error || 'Failed to send');
    } finally {
      this.bSending.set(false);
    }
  }

  logout() {
    this.closeSidebar();
    this.auth.logout();
    this.router.navigateByUrl('/ea-admin/login', { replaceUrl: true });
  }
}