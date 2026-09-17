import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonSearchbar
} from '@ionic/angular/standalone';
import { AdminApi, AuditLog } from '../../../core/admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-audit',
  host: { 'class': 'ion-page' },
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner, IonSearchbar],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Audit Trail</h1>
            <p class="sub">Every action performed by admins, staff, and dentists</p>
          </div>
          <div class="count-pill">{{ filtered().length }} entries</div>
        </div>

        <div class="filters">
          @for (e of entities; track e.value) {
            <button
              type="button"
              class="chip-filter"
              [class.active]="activeEntity === e.value"
              (click)="setEntity(e.value)">
              {{ e.label }}
            </button>
          }
        </div>

        <ion-searchbar
          class="search"
          placeholder="Search by action, user, or IP..."
          [(ngModel)]="searchQuery"
          [debounce]="150">
        </ion-searchbar>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!filtered().length) {
          <p class="empty">No audit entries match your filters.</p>
        } @else {
          <div class="list">
            @for (log of filtered(); track log.id) {
              <div class="log-card">
                <div class="log-left">
                  <div class="action-badge" [attr.data-entity]="log.entity">
                    <ion-icon [name]="iconFor(log.entity)"></ion-icon>
                  </div>
                </div>

                <div class="log-body">
                  <div class="log-action">{{ humanAction(log.action) }}</div>

                  <div class="log-who">
                    @if (log.user; as u) {
                      <span class="who-name">{{ u.first_name }} {{ u.last_name }}</span>
                      <span class="who-role" [attr.data-role]="u.role">{{ u.role }}</span>
                    } @else {
                      <span class="who-name muted">System</span>
                    }
                  </div>

                  @if (log.changes && hasChanges(log.changes)) {
                    <div class="changes">
                      @for (entry of changeEntries(log.changes); track entry.key) {
                        <span class="change-chip">
                          <strong>{{ entry.key }}:</strong> {{ entry.value }}
                        </span>
                      }
                    </div>
                  }

                  <div class="log-meta">
                    <span>{{ log.created_at | date:'MMM d, y · h:mm a' }}</span>
                    @if (log.ip_address) {
                      <span class="dot">·</span>
                      <span>{{ log.ip_address }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .admin-bg { --background: #f5f8fb; --color: #0A1E29; }
    .page-inner { padding: 20px; }

    .head {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
    }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }
    .count-pill {
      background: #e6f4fb; color: #0A1E29;
      padding: 6px 14px; border-radius: 9999px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }

    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .chip-filter {
      background: #ffffff;
      border: 1px solid #e6eef5;
      color: #4a6272;
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip-filter:hover { border-color: #4EBE7D; color: #0A1E29; }
    .chip-filter.active { background: #0A1E29; color: #ffffff; border-color: #0A1E29; }

    .search {
      --background: #ffffff;
      --border-radius: 9999px;
      --box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      --color: #0A1E29;
      padding: 0 0 12px;
    }

    .list { display: flex; flex-direction: column; gap: 10px; }

    .log-card {
      display: flex; gap: 12px;
      background: #ffffff;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }

    .log-left { flex: 0 0 auto; }

    .action-badge {
      width: 40px; height: 40px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 18px;
      background: #eef3f8; color: #4a6272;
    }
    .action-badge[data-entity="user"]        { background: #ece0ff; color: #5a3d8a; }
    .action-badge[data-entity="appointment"] { background: #d9f0fb; color: #1a5a7a; }
    .action-badge[data-entity="service"]     { background: #d7f0e0; color: #1e6b3d; }
    .action-badge[data-entity="setting"]     { background: #fff4d6; color: #8a6d00; }

    .log-body { flex: 1; min-width: 0; }

    .log-action {
      font-size: 14px; font-weight: 700; color: #0A1E29;
      line-height: 1.3;
    }

    .log-who {
      display: flex; gap: 8px; align-items: center;
      margin-top: 6px;
      flex-wrap: wrap;
    }
    .who-name { font-size: 13px; color: #0A1E29; font-weight: 600; }
    .who-name.muted { color: #7a8a97; font-style: italic; font-weight: 400; }
    .who-role {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 8px; border-radius: 9999px;
      background: #eef3f8; color: #4a6272;
    }
    .who-role[data-role="admin"]   { background: #ece0ff; color: #5a3d8a; }
    .who-role[data-role="dentist"] { background: #d7f0e0; color: #1e6b3d; }
    .who-role[data-role="staff"]   { background: #fff4d6; color: #8a6d00; }

    .changes {
      display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;
    }
    .change-chip {
      font-size: 11px; padding: 3px 10px; border-radius: 9999px;
      background: #f2f8fc; color: #1a5a7a;
      font-weight: 500;
      max-width: 100%;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .change-chip strong { color: #0A1E29; }

    .log-meta {
      font-size: 11px; color: #7a8a97; margin-top: 8px;
      display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
    }
    .dot { opacity: 0.5; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
    }
  `]
})
export class AdminAuditPage implements OnInit {
  logs = signal<AuditLog[]>([]);
  loading = signal(true);
  searchQuery = '';
  activeEntity = '';

  entities = [
    { label: 'All',         value: '' },
    { label: 'Users',       value: 'user' },
    { label: 'Appointments',value: 'appointment' },
    { label: 'Services',    value: 'service' },
    { label: 'Settings',    value: 'setting' }
  ];

  constructor(private api: AdminApi) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.listAuditLogs({
        entity: this.activeEntity || undefined
      });
      this.logs.set(list);
    } catch {
      this.logs.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  setEntity(entity: string) {
    this.activeEntity = entity;
    this.load();
  }

  filtered(): AuditLog[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.logs();
    if (!q) return list;

    return list.filter(l => {
      if (l.action.toLowerCase().includes(q)) return true;
      if (l.ip_address?.toLowerCase().includes(q)) return true;
      if (l.user) {
        const name = `${l.user.first_name} ${l.user.last_name}`.toLowerCase();
        if (name.includes(q)) return true;
        if (l.user.email.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  iconFor(entity: string): string {
    switch (entity) {
      case 'user':        return 'people-outline';
      case 'appointment': return 'calendar-outline';
      case 'service':     return 'construct-outline';
      case 'setting':     return 'settings-outline';
      default:            return 'document-text-outline';
    }
  }

  humanAction(action: string): string {
    return action
      .split('.')
      .map(part => part.replace('_', ' '))
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' → ');
  }

  hasChanges(changes: any): boolean {
    if (!changes || typeof changes !== 'object') return false;
    return Object.keys(changes).length > 0;
  }

  changeEntries(changes: any): { key: string; value: string }[] {
    if (!changes || typeof changes !== 'object') return [];
    return Object.entries(changes)
      .slice(0, 4)
      .map(([key, value]) => ({
        key: key.replace(/_/g, ' '),
        value: this.formatValue(value)
      }));
  }

  private formatValue(v: any): string {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'yes' : 'no';
    if (typeof v === 'object') return JSON.stringify(v).slice(0, 60);
    return String(v).slice(0, 60);
  }
}