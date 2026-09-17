import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonSearchbar,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonInput, IonTextarea, IonItem, IonFooter,
  ToastController
} from '@ionic/angular/standalone';
import { AdminApi, InventoryItem, InventoryLog } from '../../../core/admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-inventory',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonSearchbar,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonInput, IonTextarea, IonItem, IonFooter
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Inventory</h1>
            <p class="sub">Track service stock levels and restock history</p>
          </div>
          <div class="kpis">
            <div class="kpi" [class.alert]="lowCount() > 0">
              <span class="kpi-value">{{ lowCount() }}</span>
              <span class="kpi-label">Low stock</span>
            </div>
            <div class="kpi">
              <span class="kpi-value">{{ totalItems() }}</span>
              <span class="kpi-label">Total items</span>
            </div>
          </div>
        </div>

        <div class="tools">
          <ion-searchbar
            class="search"
            placeholder="Search services..."
            [(ngModel)]="searchQuery"
            [debounce]="150">
          </ion-searchbar>

          <button
            type="button"
            class="toggle-btn"
            [class.active]="lowOnly()"
            (click)="toggleLowOnly()">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>Low stock only</span>
          </button>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!filtered().length) {
          <p class="empty">No items match your filters.</p>
        } @else {
          <div class="list">
            @for (item of filtered(); track item.id) {
              <div class="stock-card" [class.low]="item.is_low">
                <div class="stock-left">
                  <div class="stock-name">
                    {{ item.name }}
                    @if (item.is_low) {
                      <span class="low-badge">Low</span>
                    }
                  </div>
                  <div class="stock-meta">
                    <span class="category-chip">{{ item.category }}</span>
                    <span class="threshold">Threshold: {{ item.low_stock_threshold }}</span>
                  </div>
                </div>

                <div class="stock-right">
                  <div class="stock-count">
                    <span class="count-value">{{ item.stock }}</span>
                    <span class="count-label">in stock</span>
                  </div>
                  <button type="button" class="restock-btn" (click)="openRestock(item)">
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Adjust</span>
                  </button>
                  <button type="button" class="history-btn" (click)="openHistory(item)" title="History">
                    <ion-icon name="time-outline"></ion-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>

    <!-- RESTOCK MODAL -->
    <ion-modal [isOpen]="restockOpen()" (didDismiss)="closeRestock()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>Adjust Stock</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeRestock()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          @if (selected(); as s) {
            <div class="form-wrap">
              <div class="modal-item">
                <div class="modal-item-name">{{ s.name }}</div>
                <div class="modal-item-sub">Current: {{ s.stock }} in stock · Threshold: {{ s.low_stock_threshold }}</div>
              </div>

              <div class="field-group">
                <label class="field-label">New stock value</label>
                <ion-item lines="none" class="field">
                  <ion-input
                    type="number"
                    [(ngModel)]="newStock"
                    [disabled]="saving()">
                  </ion-input>
                </ion-item>
                @if (delta() !== null) {
                  <p class="delta-hint" [class.positive]="delta()! > 0" [class.negative]="delta()! < 0">
                    Change: {{ delta()! > 0 ? '+' : '' }}{{ delta() }}
                  </p>
                }
              </div>

              <div class="field-group">
                <label class="field-label">Reason</label>
                <ion-item lines="none" class="field">
                  <ion-input
                    [(ngModel)]="reason"
                    placeholder="e.g. Restock, Usage, Damage"
                    [disabled]="saving()">
                  </ion-input>
                </ion-item>
              </div>

              <div class="field-group">
                <label class="field-label">Notes (optional)</label>
                <ion-item lines="none" class="field field-textarea">
                  <ion-textarea
                    [(ngModel)]="notes"
                    [autoGrow]="true"
                    rows="2"
                    placeholder="Any extra details..."
                    [disabled]="saving()">
                  </ion-textarea>
                </ion-item>
              </div>

              @if (formError()) {
                <div class="err-box">
                  <ion-icon name="alert-circle-outline"></ion-icon>
                  <span>{{ formError() }}</span>
                </div>
              }
            </div>
          }
        </ion-content>

        <ion-footer class="ion-no-border">
          <ion-toolbar class="modal-footer">
            <ion-button expand="block" class="save-btn" (click)="saveStock()" [disabled]="saving()">
              @if (saving()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Save Changes
              }
            </ion-button>
          </ion-toolbar>
        </ion-footer>
      </ng-template>
    </ion-modal>

    <!-- HISTORY MODAL -->
    <ion-modal [isOpen]="historyOpen()" (didDismiss)="closeHistory()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>Stock History</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeHistory()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          <div class="history-wrap">
            @if (historyLoading()) {
              <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
            } @else if (!history().length) {
              <p class="empty">No history yet for this item.</p>
            } @else {
              @for (log of history(); track log.id) {
                <div class="log-row">
                  <div class="log-delta"
                       [class.positive]="log.change_amount > 0"
                       [class.negative]="log.change_amount < 0">
                    {{ log.change_amount > 0 ? '+' : '' }}{{ log.change_amount }}
                  </div>
                  <div class="log-body">
                    <div class="log-line">
                      <span class="log-from">{{ log.previous_stock }}</span>
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                      <span class="log-to">{{ log.new_stock }}</span>
                      <span class="log-reason">{{ log.reason }}</span>
                    </div>
                    @if (log.notes) {
                      <div class="log-notes">{{ log.notes }}</div>
                    }
                    <div class="log-meta">
                      {{ log.created_at | date:'MMM d, y · h:mm a' }}
                      @if (log.performed_by_user; as u) {
                        · {{ u.first_name }} {{ u.last_name }}
                      }
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .admin-bg { --background: #f5f8fb; --color: #0A1E29; }
    .page-inner { padding: 20px; }

    .head {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
    }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }

    .kpis { display: flex; gap: 10px; }
    .kpi {
      background: #ffffff;
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 84px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .kpi.alert { background: #fff4d6; }
    .kpi-value { font-size: 20px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .kpi.alert .kpi-value { color: #8a6d00; }
    .kpi-label {
      font-size: 10px; color: #7a8a97;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-top: 4px; font-weight: 600;
    }

    .tools { margin-bottom: 18px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .search {
      --background: #ffffff;
      --border-radius: 9999px;
      --box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      --color: #0A1E29;
      flex: 1;
      min-width: 220px;
      padding: 0;
    }
    .toggle-btn {
      display: flex; align-items: center; gap: 8px;
      background: #ffffff;
      border: 1px solid #e6eef5;
      color: #4a6272;
      padding: 10px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .toggle-btn:hover { border-color: #4EBE7D; color: #0A1E29; }
    .toggle-btn.active {
      background: #fff4d6;
      color: #8a6d00;
      border-color: #f0c14b;
    }
    .toggle-btn ion-icon { font-size: 18px; }

    .list { display: flex; flex-direction: column; gap: 10px; }

    .stock-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      border-left: 4px solid transparent;
    }
    .stock-card.low {
      border-left-color: #f0c14b;
      background: #fffbef;
    }

    .stock-left { flex: 1; min-width: 0; }
    .stock-name {
      font-size: 15px; font-weight: 700; color: #0A1E29;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .low-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 8px; border-radius: 9999px;
      background: #f0c14b; color: #ffffff;
    }
    .stock-meta { display: flex; gap: 10px; align-items: center; margin-top: 6px; flex-wrap: wrap; }
    .category-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #e6f4fb; color: #1a5a7a;
    }
    .threshold { font-size: 11px; color: #7a8a97; }

    .stock-right {
      display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
    }
    .stock-count { text-align: right; margin-right: 6px; }
    .count-value { font-size: 22px; font-weight: 800; color: #0A1E29; line-height: 1; display: block; }
    .stock-card.low .count-value { color: #8a6d00; }
    .count-label {
      font-size: 10px; color: #7a8a97;
      text-transform: uppercase; letter-spacing: 0.5px;
      font-weight: 600;
    }

    .restock-btn {
      display: flex; align-items: center; gap: 6px;
      background: #0A1E29; color: #ffffff;
      border: 0; border-radius: 9999px;
      padding: 9px 14px;
      font-size: 12px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .restock-btn:hover { background: #142635; }
    .restock-btn ion-icon { font-size: 16px; }

    .history-btn {
      width: 38px; height: 38px; border-radius: 50%;
      border: 0; background: #f2f8fc; color: #0A1E29;
      display: grid; place-items: center;
      font-size: 18px; cursor: pointer;
      transition: background 0.15s;
    }
    .history-btn:hover { background: #e6f4fb; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    /* MODAL */
    .modal-bar { --background: #0A1E29; --color: #ffffff; }
    .modal-bar ion-title { color: #ffffff; font-weight: 600; }
    .modal-bar ion-button { --color: #93D5ED; }
    .modal-bg { --background: #ffffff; --color: #0A1E29; }
    .form-wrap { padding: 20px 20px 32px; }

    .modal-item {
      background: #f2f8fc;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .modal-item-name { font-size: 16px; font-weight: 700; color: #0A1E29; }
    .modal-item-sub { font-size: 12px; color: #7a8a97; margin-top: 4px; }

    .field-group { margin-bottom: 16px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px; letter-spacing: 0.3px;
    }
    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 14px;
      --color: #0A1E29;
      --min-height: 48px;
      border-radius: 14px;
      border: 1px solid #e6eef5;
    }
    .field ion-input,
    .field ion-textarea {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 15px;
      --color: #0A1E29;
    }
    .field-textarea { --min-height: 60px; align-items: flex-start; padding: 6px 0; }

    .delta-hint {
      font-size: 12px;
      font-weight: 600;
      margin: 8px 4px 0;
      color: #7a8a97;
    }
    .delta-hint.positive { color: #1e6b3d; }
    .delta-hint.negative { color: #c0392b; }

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      border-radius: 12px; color: #8a1a1a;
      font-size: 13px; font-weight: 600;
      margin-top: 8px;
    }
    .err-box ion-icon { font-size: 18px; flex: 0 0 auto; }

    .modal-footer { --background: #ffffff; padding: 12px 20px 20px; }
    .save-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-disabled: #ffffff;
      height: 48px;
      font-weight: 600;
    }
    .save-btn::part(native) { color: #ffffff; }

    /* HISTORY */
    .history-wrap { padding: 16px 20px 32px; }
    .log-row {
      display: flex; gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #eef3f8;
      align-items: flex-start;
    }
    .log-row:last-child { border-bottom: 0; }
    .log-delta {
      font-size: 14px; font-weight: 700;
      background: #eef3f8; color: #4a6272;
      padding: 4px 10px; border-radius: 9999px;
      flex: 0 0 auto;
      min-width: 44px;
      text-align: center;
    }
    .log-delta.positive { background: #d7f0e0; color: #1e6b3d; }
    .log-delta.negative { background: #ffe0e0; color: #8a1a1a; }
    .log-body { flex: 1; min-width: 0; }
    .log-line {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: #0A1E29;
      flex-wrap: wrap;
    }
    .log-line ion-icon { font-size: 14px; color: #7a8a97; }
    .log-reason {
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding: 3px 8px; border-radius: 9999px;
      background: #e6f4fb; color: #1a5a7a;
      margin-left: 6px;
    }
    .log-notes {
      font-size: 12px; color: #4a6272; margin-top: 6px;
      font-style: italic;
    }
    .log-meta {
      font-size: 11px; color: #7a8a97; margin-top: 6px;
    }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
    }
  `]
})
export class AdminInventoryPage implements OnInit {
  items = signal<InventoryItem[]>([]);
  loading = signal(true);
  searchQuery = '';
  lowOnly = signal(false);

  // Restock modal
  restockOpen = signal(false);
  selected = signal<InventoryItem | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  newStock: number | null = null;
  reason = '';
  notes = '';

  // History modal
  historyOpen = signal(false);
  historyLoading = signal(false);
  history = signal<InventoryLog[]>([]);

  constructor(
    private api: AdminApi,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.listInventory(this.lowOnly());
      this.items.set(list);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  filtered(): InventoryItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.items();
    if (!q) return list;
    return list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  }

  totalItems = computed(() => this.items().length);
  lowCount = computed(() => this.items().filter(i => i.is_low).length);

  toggleLowOnly() {
    this.lowOnly.update(v => !v);
    this.load();
  }

  // ---------- RESTOCK ----------

  openRestock(item: InventoryItem) {
    this.selected.set(item);
    this.newStock = item.stock;
    this.reason = '';
    this.notes = '';
    this.formError.set(null);
    this.restockOpen.set(true);
  }

  closeRestock() {
    this.restockOpen.set(false);
  }

  delta = computed(() => {
    const s = this.selected();
    if (!s || this.newStock == null) return null;
    return Number(this.newStock) - s.stock;
  });

  async saveStock() {
    this.formError.set(null);
    const s = this.selected();
    if (!s) return;

    if (this.newStock == null || isNaN(Number(this.newStock))) {
      this.formError.set('Enter a valid stock number');
      return;
    }
    if (Number(this.newStock) < 0) {
      this.formError.set('Stock cannot be negative');
      return;
    }
    if (Number(this.newStock) === s.stock) {
      this.formError.set('Stock is unchanged');
      return;
    }

    this.saving.set(true);
    try {
      const res = await this.api.updateStock(
        s.id,
        Number(this.newStock),
        this.reason.trim() || 'manual_adjustment',
        this.notes.trim() || undefined
      );

      // Update in list
      this.items.update(list =>
        list.map(x => x.id === res.item.id ? { ...x, ...res.item } : x)
      );

      // If we're in low-only mode and the item is no longer low, remove it
      if (this.lowOnly() && !res.item.is_low) {
        this.items.update(list => list.filter(x => x.id !== res.item.id));
      }

      const t = await this.toastCtrl.create({
        message: 'Stock updated',
        duration: 1600,
        position: 'bottom',
        color: 'success'
      });
      await t.present();
      this.closeRestock();
    } catch (e: any) {
      this.formError.set(e?.error?.error || e?.message || 'Failed to update');
    } finally {
      this.saving.set(false);
    }
  }

  // ---------- HISTORY ----------

  async openHistory(item: InventoryItem) {
    this.selected.set(item);
    this.history.set([]);
    this.historyOpen.set(true);
    this.historyLoading.set(true);
    try {
      const logs = await this.api.getInventoryHistory(item.id);
      this.history.set(logs);
    } catch {
      this.history.set([]);
    } finally {
      this.historyLoading.set(false);
    }
  }

  closeHistory() {
    this.historyOpen.set(false);
  }
}