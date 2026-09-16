import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { AdminAuthService } from '../../../core/admin-auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonRouterOutlet,
    IonIcon
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
            <span>Admin</span>
          </div>
          <button class="close-button" type="button" (click)="closeSidebar()">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>

        <nav class="nav">
          <a class="nav-link" routerLink="/ea-admin/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }" (click)="closeSidebar()">
            <ion-icon name="grid-outline"></ion-icon>
            <span>Dashboard</span>
          </a>
          <a class="nav-link" routerLink="/ea-admin/appointments" routerLinkActive="active" (click)="closeSidebar()">
            <ion-icon name="calendar-outline"></ion-icon>
            <span>Appointments</span>
          </a>
          <a class="nav-link" routerLink="/ea-admin/users" routerLinkActive="active" (click)="closeSidebar()">
            <ion-icon name="people-outline"></ion-icon>
            <span>Users</span>
          </a>
          <a class="nav-link" routerLink="/ea-admin/services" routerLinkActive="active" (click)="closeSidebar()">
            <ion-icon name="construct-outline"></ion-icon>
            <span>Services</span>
          </a>
          <a class="nav-link" routerLink="/ea-admin/reports" routerLinkActive="active" (click)="closeSidebar()">
            <ion-icon name="stats-chart-outline"></ion-icon>
            <span>Reports</span>
          </a>
          <a class="nav-link" routerLink="/ea-admin/settings" routerLinkActive="active" (click)="closeSidebar()">
            <ion-icon name="settings-outline"></ion-icon>
            <span>Settings</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          @if (auth.user(); as u) {
            <div class="who">
              <div class="avatar">{{ initials(u.first_name, u.last_name) }}</div>
              <div class="who-text">
                <div class="who-name">{{ u.first_name }} {{ u.last_name }}</div>
                <div class="who-role">Administrator</div>
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
          <strong>EA<span class="accent">smile</span> Admin</strong>
        </header>

        <section class="page-container">
          <ion-router-outlet></ion-router-outlet>
        </section>

      </main>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

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
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { display: flex; flex-direction: column; color: #ffffff; }
    .brand strong { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .accent { color: #4EBE7D; }
    .brand span { font-size: 11px; opacity: 0.6; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

    .close-button {
      display: flex;
      border: 0;
      background: transparent;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
    }

    /* NAV */
    .nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 12px;
      flex: 1;
      overflow-y: auto;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 12px;
      color: #b8c4ce;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.06); color: #ffffff; }
    .nav-link.active { background: #4EBE7D; color: #ffffff; font-weight: 600; }
    .nav-link ion-icon { font-size: 20px; }

    /* SIDEBAR BOTTOM */
    .sidebar-bottom {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .who {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #4EBE7D;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 13px;
      font-weight: 700;
      flex: 0 0 auto;
    }
    .who-name { font-size: 13px; font-weight: 600; color: #ffffff; }
    .who-role { font-size: 11px; color: #93D5ED; }

    .logout-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      background: transparent;
      color: #ffffff;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s;
    }
    .logout-button:hover { background: rgba(255,255,255,0.08); }
    .logout-button ion-icon { font-size: 18px; }

    /* MAIN */
    .main {
      flex: 1;
      min-width: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .mobile-header {
      height: 60px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 0 18px;
      background: #ffffff;
      border-bottom: 1px solid #e5e9ec;
    }
    .mobile-header strong { color: #0A1E29; font-size: 16px; }

    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px; height: 42px;
      border: 0;
      background: transparent;
      color: #0A1E29;
      font-size: 25px;
      cursor: pointer;
    }

    .page-container {
      flex: 1;
      min-width: 0;
      min-height: 0;
      position: relative;
    }

    ion-router-outlet {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* OVERLAY */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 900;
    }

    /* DESKTOP */
    @media (min-width: 1024px) {
      .sidebar { transform: translateX(0); }
      .sidebar-overlay { display: none; }
      .close-button { display: none; }
      .main { margin-left: 260px; }
      .mobile-header { display: none; }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);

  constructor(public auth: AdminAuthService, private router: Router) {}

  toggleSidebar() { this.sidebarOpen.update(open => !open); }
  closeSidebar() { this.sidebarOpen.set(false); }

  initials(first: string, last: string): string {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  }

  logout() {
    this.closeSidebar();
    this.auth.logout();
    this.router.navigateByUrl('/ea-admin/login', { replaceUrl: true });
  }
}