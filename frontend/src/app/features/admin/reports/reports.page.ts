import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AdminApi, ReportsSummary } from '../../../core/admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-reports',
  host: { 'class': 'ion-page' },
  imports: [CommonModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Reports</h1>
            <p class="sub">Performance overview — last 90 days</p>
          </div>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (data(); as d) {

          <!-- KPI CARDS -->
          <div class="kpis">
            <div class="kpi">
              <div class="kpi-icon mint"><ion-icon name="cash-outline"></ion-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">₱{{ d.stats.total_revenue | number:'1.0-0' }}</div>
                <div class="kpi-label">Revenue</div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-icon sky"><ion-icon name="checkmark-circle-outline"></ion-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ d.stats.completed_count }}</div>
                <div class="kpi-label">Completed</div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-icon butter"><ion-icon name="calendar-outline"></ion-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ d.stats.total_appointments }}</div>
                <div class="kpi-label">Appointments</div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-icon lilac"><ion-icon name="trending-up-outline"></ion-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">₱{{ d.stats.avg_ticket | number:'1.0-0' }}</div>
                <div class="kpi-label">Avg Ticket</div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-icon coral"><ion-icon name="people-outline"></ion-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ d.stats.total_patients }}</div>
                <div class="kpi-label">Patients</div>
              </div>
            </div>
          </div>

          <!-- REVENUE CHART -->
          <section class="block">
            <h2>Revenue — Last 30 Days</h2>
            @if (maxRevenue(d) === 0) {
              <p class="empty">No completed appointments yet.</p>
            } @else {
              <div class="chart-wrap">
                <div class="chart">
                  @for (day of d.revenue_by_day; track day.date) {
                    <div class="bar-slot">
                      <div
                        class="bar"
                        [style.height.%]="barHeight(day.revenue, maxRevenue(d))"
                        [class.has-revenue]="day.revenue > 0">
                      </div>
                      <div class="tip">
                        <strong>{{ day.date | date:'MMM d' }}</strong>
                        <span>₱{{ day.revenue | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  }
                </div>
                <div class="chart-axis">
                  <span>{{ d.revenue_by_day[0]?.date | date:'MMM d' }}</span>
                  <span>{{ d.revenue_by_day[29]?.date | date:'MMM d' }}</span>
                </div>
              </div>
            }
          </section>

          <div class="two-col">

            <!-- STATUS BREAKDOWN -->
            <section class="block">
              <h2>Status Breakdown</h2>
              @if (!statusEntries(d).length) {
                <p class="empty">No appointments.</p>
              } @else {
                <div class="status-list">
                  @for (s of statusEntries(d); track s.key) {
                    <div class="status-row">
                      <span class="status-dot" [attr.data-status]="s.key"></span>
                      <span class="status-name">{{ s.key }}</span>
                      <span class="status-bar-wrap">
                        <span
                          class="status-bar"
                          [attr.data-status]="s.key"
                          [style.width.%]="(s.value / d.stats.total_appointments) * 100">
                        </span>
                      </span>
                      <span class="status-count">{{ s.value }}</span>
                    </div>
                  }
                </div>
              }
            </section>

            <!-- TOP SERVICES -->
            <section class="block">
              <h2>Top Services</h2>
              @if (!d.top_services.length) {
                <p class="empty">No services booked yet.</p>
              } @else {
                <div class="top-services">
                  @for (s of d.top_services; track s.name; let i = $index) {
                    <div class="svc-row">
                      <div class="svc-rank">#{{ i + 1 }}</div>
                      <div class="svc-info">
                        <div class="svc-name">{{ s.name }}</div>
                        <div class="svc-meta">{{ s.count }} bookings</div>
                      </div>
                      <div class="svc-revenue">₱{{ s.revenue | number:'1.0-0' }}</div>
                    </div>
                  }
                </div>
              }
            </section>

          </div>

        } @else {
          <p class="empty">Could not load reports.</p>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .admin-bg { --background: #f5f8fb; --color: #0A1E29; }
    .page-inner { padding: 20px; }

    .head { margin-bottom: 22px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }

    /* KPI */
    .kpis {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi {
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .kpi-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 20px; flex: 0 0 auto;
    }
    .kpi-icon.mint   { background: #d7f0e0; color: #1e6b3d; }
    .kpi-icon.sky    { background: #d9f0fb; color: #1a5a7a; }
    .kpi-icon.butter { background: #fff4d6; color: #8a6d00; }
    .kpi-icon.lilac  { background: #ece0ff; color: #5a3d8a; }
    .kpi-icon.coral  { background: #ffe0d0; color: #8a3d1a; }
    .kpi-value { font-size: 20px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .kpi-label { font-size: 11px; color: #7a8a97; margin-top: 4px; }

    /* BLOCK */
    .block {
      background: #ffffff;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      margin-bottom: 16px;
    }
    .block h2 {
      font-size: 14px;
      font-weight: 700;
      color: #0A1E29;
      margin: 0 0 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* CHART */
    .chart-wrap { padding: 4px 0 0; }
    .chart {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 140px;
      padding: 0 4px;
    }
    .bar-slot {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: flex-end;
      position: relative;
      cursor: pointer;
    }
    .tip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translate(-50%, -8px);
      background: #0A1E29;
      color: #ffffff;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      line-height: 1.2;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.12s ease;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(10,30,41,0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .tip strong { font-weight: 600; }
    .tip span { color: #93D5ED; font-weight: 700; }
    .tip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #0A1E29;
    }

    .bar-slot:hover .tip {
      opacity: 1;
    }

    /* On touch devices, show the tooltip for whichever bar was last tapped.
       Long-press on mobile reveals the same thing. */
    .bar-slot:active .tip {
      opacity: 1;
    }
    .bar {
      width: 100%;
      min-height: 3px;
      background: #e6eef5;
      border-radius: 3px 3px 0 0;
      transition: background 0.15s;
    }
    .bar.has-revenue {
      background: linear-gradient(180deg, #4EBE7D 0%, #93D5ED 100%);
    }
    .chart-axis {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #7a8a97;
      margin-top: 8px;
      padding: 0 4px;
    }

    /* STATUS */
    .status-list { display: flex; flex-direction: column; gap: 10px; }
    .status-row {
      display: grid;
      grid-template-columns: 14px 90px 1fr 40px;
      gap: 10px;
      align-items: center;
      font-size: 13px;
    }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #e6eef5;
    }
    .status-dot[data-status="pending"]     { background: #f0c14b; }
    .status-dot[data-status="confirmed"]   { background: #4EBE7D; }
    .status-dot[data-status="in-progress"] { background: #5b8def; }
    .status-dot[data-status="completed"]   { background: #93D5ED; }
    .status-dot[data-status="cancelled"]   { background: #e57373; }
    .status-dot[data-status="no-show"]     { background: #e57373; }

    .status-name { color: #4a6272; text-transform: capitalize; font-size: 12px; }
    .status-bar-wrap {
      background: #f2f8fc;
      border-radius: 9999px;
      height: 8px;
      overflow: hidden;
      display: block;
    }
    .status-bar {
      display: block;
      height: 100%;
      background: #93D5ED;
      border-radius: 9999px;
    }
    .status-bar[data-status="pending"]     { background: #f0c14b; }
    .status-bar[data-status="confirmed"]   { background: #4EBE7D; }
    .status-bar[data-status="in-progress"] { background: #5b8def; }
    .status-bar[data-status="completed"]   { background: #93D5ED; }
    .status-bar[data-status="cancelled"]   { background: #e57373; }
    .status-bar[data-status="no-show"]     { background: #e57373; }

    .status-count { font-weight: 700; color: #0A1E29; text-align: right; font-size: 12px; }

    /* TOP SERVICES */
    .top-services { display: flex; flex-direction: column; gap: 8px; }
    .svc-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #f7fafc;
      border-radius: 12px;
    }
    .svc-rank {
      font-size: 11px;
      font-weight: 700;
      color: #4EBE7D;
      background: #ffffff;
      width: 30px; height: 30px;
      border-radius: 50%;
      display: grid; place-items: center;
      flex: 0 0 auto;
    }
    .svc-info { flex: 1; min-width: 0; }
    .svc-name { font-size: 13px; font-weight: 600; color: #0A1E29; }
    .svc-meta { font-size: 11px; color: #7a8a97; }
    .svc-revenue { font-size: 13px; font-weight: 700; color: #0A1E29; }

    /* LAYOUT */
    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 13px; text-align: center; padding: 16px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .kpis { grid-template-columns: repeat(5, 1fr); }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
      .chart { height: 180px; }
    }
  `]
})
export class AdminReportsPage implements OnInit {
  data = signal<ReportsSummary | null>(null);
  loading = signal(true);

  constructor(private api: AdminApi) {}

  async ngOnInit() {
    try {
      const res = await this.api.getReportsSummary();
      this.data.set(res);
    } catch {
      this.data.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  maxRevenue(d: ReportsSummary): number {
    return Math.max(...d.revenue_by_day.map(x => x.revenue), 1);
  }

  barHeight(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max((value / max) * 100, value > 0 ? 4 : 2);
  }

  statusEntries(d: ReportsSummary): { key: string; value: number }[] {
    const order = ['pending','confirmed','in-progress','completed','cancelled','no-show'];
    return order
      .filter(k => d.status_counts[k] > 0)
      .map(k => ({ key: k, value: d.status_counts[k] }));
  }
}