import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonIcon, IonSpinner, IonContent } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Stats {
  total_patients: number;
  total_appointments: number;
  today_appointments: number;
  pending_appointments: number;
  total_revenue: number;
}

interface RecentAppt {
  id: string;
  appointment_date: string;
  status: string;
  total_amount: number;
  patient: { id: string; first_name: string; last_name: string } | null;
}

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  host: { 'class': 'ion-page' },
  imports: [CommonModule, IonIcon, IonSpinner, IonContent],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <h1>Dashboard</h1>
          <p class="sub">Overview of your clinic's activity</p>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (stats(); as s) {
          <div class="stats">
            <div class="stat-card">
              <div class="stat-icon mint"><ion-icon name="people-outline"></ion-icon></div>
              <div class="stat-body">
                <div class="stat-value">{{ s.total_patients }}</div>
                <div class="stat-label">Total Patients</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon sky"><ion-icon name="calendar-outline"></ion-icon></div>
              <div class="stat-body">
                <div class="stat-value">{{ s.total_appointments }}</div>
                <div class="stat-label">All Appointments</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon butter"><ion-icon name="time-outline"></ion-icon></div>
              <div class="stat-body">
                <div class="stat-value">{{ s.today_appointments }}</div>
                <div class="stat-label">Today</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon coral"><ion-icon name="alert-circle-outline"></ion-icon></div>
              <div class="stat-body">
                <div class="stat-value">{{ s.pending_appointments }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>

            <div class="stat-card wide">
              <div class="stat-icon lilac"><ion-icon name="cash-outline"></ion-icon></div>
              <div class="stat-body">
                <div class="stat-value">₱{{ s.total_revenue | number:'1.0-0' }}</div>
                <div class="stat-label">Total Revenue (completed)</div>
              </div>
            </div>
          </div>

          <section class="recent">
            <h2>Recent Appointments</h2>
            @if (!recent().length) {
              <p class="empty">No appointments yet.</p>
            } @else {
              <div class="table">
                <div class="row header">
                  <span>Patient</span>
                  <span>Date &amp; Time</span>
                  <span>Status</span>
                  <span class="right">Amount</span>
                </div>
                @for (a of recent(); track a.id) {
                  <div class="row">
                    <span>
                      @if (a.patient; as p) { {{ p.first_name }} {{ p.last_name }} }
                      @else { <em>Deleted user</em> }
                    </span>
                    <span>{{ a.appointment_date | date:'MMM d, h:mm a' }}</span>
                    <span><span class="chip" [attr.data-status]="a.status">{{ a.status }}</span></span>
                    <span class="right">₱{{ a.total_amount }}</span>
                  </div>
                }
              </div>
            }
          </section>
        } @else {
          <p class="empty">Could not load dashboard.</p>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .admin-bg { --background: #f5f8fb; --color: #0A1E29; }
    .page-inner { padding: 20px; }

    .head { margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .stat-card.wide { grid-column: span 2; }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 22px; color: #0A1E29; flex: 0 0 auto;
    }
    .stat-icon.mint    { background: #d7f0e0; color: #1e6b3d; }
    .stat-icon.sky     { background: #d9f0fb; color: #1a5a7a; }
    .stat-icon.butter  { background: #fff4d6; color: #8a6d00; }
    .stat-icon.coral   { background: #ffe0d0; color: #8a3d1a; }
    .stat-icon.lilac   { background: #ece0ff; color: #5a3d8a; }

    .stat-value { font-size: 22px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .stat-label { font-size: 12px; color: #7a8a97; margin-top: 4px; }

    .recent h2 { font-size: 16px; font-weight: 700; color: #0A1E29; margin: 0 0 12px; }
    .table {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .row {
      display: grid;
      grid-template-columns: 1.4fr 1.4fr 0.9fr 0.7fr;
      gap: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #4a6272;
      border-top: 1px solid #eef3f8;
      align-items: center;
    }
    .row.header {
      background: #f7fafc;
      color: #7a8a97;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-top: none;
    }
    .row .right { text-align: right; }

    .chip {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 9px;
      border-radius: 9999px;
      background: #eef3f8;
      color: #4a6272;
    }
    .chip[data-status="pending"]     { background: #fff4d6; color: #8a6d00; }
    .chip[data-status="confirmed"]   { background: #d7f0e0; color: #1e6b3d; }
    .chip[data-status="in-progress"] { background: #d6e8ff; color: #1a4f8a; }
    .chip[data-status="completed"]   { background: #d9f0fb; color: #0A1E29; }
    .chip[data-status="cancelled"]   { background: #ffd7d7; color: #8a1a1a; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .stats { grid-template-columns: repeat(5, 1fr); }
      .stat-card.wide { grid-column: span 1; }
    }
  `]
})
export class AdminDashboardPage implements OnInit {
  stats = signal<Stats | null>(null);
  recent = signal<RecentAppt[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {
    console.log('%c[DASHBOARD] constructor ran', 'color:#4EBE7D;font-weight:bold');
  }

  async ngOnInit() {
    try {
      const res = await firstValueFrom(
        this.http.get<{ stats: Stats; recent_appointments: RecentAppt[] }>(
          `${environment.apiUrl}/admin/dashboard`
        )
      );
      this.stats.set(res.stats);
      this.recent.set(res.recent_appointments);
    } catch {
      this.stats.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}