import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonInput, IonTextarea, IonItem,
  ToastController
} from '@ionic/angular/standalone';
import { AdminApi, AdminSetting } from '../../../core/admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-settings',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonInput, IonTextarea, IonItem
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <h1>Settings</h1>
          <p class="sub">Clinic information and preferences</p>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!settings().length) {
          <p class="empty">No settings found. Run <code>npm run seed:settings</code> in the backend.</p>
        } @else {
          @for (cat of categories(); track cat) {
            <section class="block">
              <h2>{{ cat }}</h2>
              <div class="rows">
                @for (s of grouped()[cat]; track s.key) {
                  <div class="row" [class.dirty]="isDirty(s)">
                    <div class="row-head">
                      <label class="row-label">{{ labelFor(s.key) }}</label>
                      @if (s.description) {
                        <span class="row-desc">{{ s.description }}</span>
                      }
                    </div>

                    @if (isLongText(s.value)) {
                      <ion-item lines="none" class="field field-textarea">
                        <ion-textarea
                          [(ngModel)]="edits[s.key]"
                          [autoGrow]="true"
                          rows="2"
                          [disabled]="savingKey() === s.key">
                        </ion-textarea>
                      </ion-item>
                    } @else {
                      <ion-item lines="none" class="field">
                        <ion-input
                          [(ngModel)]="edits[s.key]"
                          [type]="isNumber(s.value) ? 'number' : 'text'"
                          [disabled]="savingKey() === s.key">
                        </ion-input>
                      </ion-item>
                    }

                    <div class="row-actions">
                      @if (isDirty(s)) {
                        <button type="button" class="btn ghost" (click)="reset(s)">Reset</button>
                        <button
                          type="button"
                          class="btn primary"
                          (click)="save(s)"
                          [disabled]="savingKey() === s.key">
                          @if (savingKey() === s.key) {
                            <ion-spinner name="crescent"></ion-spinner>
                          } @else {
                            Save
                          }
                        </button>
                      } @else {
                        <span class="saved-tag">Saved</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </section>
          }
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

    .block {
      background: #ffffff;
      border-radius: 16px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      margin-bottom: 16px;
    }
    .block h2 {
      font-size: 12px;
      font-weight: 700;
      color: #4EBE7D;
      margin: 0 0 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .rows { display: flex; flex-direction: column; gap: 14px; }

    .row {
      padding: 14px;
      border-radius: 12px;
      background: #f7fafc;
      transition: background 0.15s;
    }
    .row.dirty {
      background: #fff8e6;
      border-left: 3px solid #f0c14b;
    }

    .row-head { margin-bottom: 8px; }
    .row-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #0A1E29;
    }
    .row-desc {
      display: block;
      font-size: 11px;
      color: #7a8a97;
      margin-top: 2px;
    }

    .field {
      --background: #ffffff;
      --border-radius: 10px;
      --padding-start: 12px;
      --inner-padding-end: 12px;
      --color: #0A1E29;
      --min-height: 42px;
      border-radius: 10px;
      border: 1px solid #e6eef5;
      margin: 0;
    }
    .field-textarea { --min-height: 60px; align-items: flex-start; padding: 6px 0; }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
      min-height: 32px;
      align-items: center;
    }
    .btn {
      padding: 7px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 0;
      transition: background 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn.ghost {
      background: transparent;
      color: #7a8a97;
      border: 1px solid #e6eef5;
    }
    .btn.ghost:hover { background: #eef3f8; }
    .btn.primary {
      background: #0A1E29;
      color: #ffffff;
    }
    .btn.primary:hover { background: #142635; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn ion-spinner { width: 14px; height: 14px; --color: #ffffff; }

    .saved-tag {
      font-size: 11px;
      color: #4EBE7D;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty {
      color: #7a8a97;
      font-size: 13px;
      text-align: center;
      padding: 40px;
    }
    .empty code {
      background: #f2f8fc;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .rows { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminSettingsPage implements OnInit {
  settings = signal<AdminSetting[]>([]);
  loading = signal(true);
  savingKey = signal<string | null>(null);

  // key -> editable string version
  edits: Record<string, string> = {};

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
      const list = await this.api.listSettings();
      this.settings.set(list);

      // Seed the edits map with string form of each value
      this.edits = {};
      for (const s of list) {
        this.edits[s.key] = this.toStringValue(s.value);
      }
    } catch {
      this.settings.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  grouped = computed(() => {
    const g: Record<string, AdminSetting[]> = {};
    for (const s of this.settings()) {
      const cat = s.category || 'general';
      if (!g[cat]) g[cat] = [];
      g[cat].push(s);
    }
    return g;
  });

  categories = computed(() => Object.keys(this.grouped()));

  labelFor(key: string): string {
    return key
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  isLongText(value: any): boolean {
    return typeof value === 'string' && value.length > 40;
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  toStringValue(value: any): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }

  isDirty(s: AdminSetting): boolean {
    return this.edits[s.key] !== this.toStringValue(s.value);
  }

  reset(s: AdminSetting) {
    this.edits[s.key] = this.toStringValue(s.value);
  }

  async save(s: AdminSetting) {
    const raw = this.edits[s.key];
    const value = this.parseValue(raw, s.value);

    this.savingKey.set(s.key);
    try {
      const updated = await this.api.upsertSetting(s.key, value);
      // Replace in list
      this.settings.update(list => list.map(x => x.key === updated.key ? updated : x));
      this.edits[s.key] = this.toStringValue(updated.value);

      const t = await this.toastCtrl.create({
        message: 'Setting saved', duration: 1400, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed to save', duration: 2000, position: 'bottom', color: 'danger'
      });
      await t.present();
    } finally {
      this.savingKey.set(null);
    }
  }

  private parseValue(raw: string, original: any): any {
    if (typeof original === 'number') {
      const n = Number(raw);
      return isNaN(n) ? 0 : n;
    }
    if (typeof original === 'boolean') {
      return raw === 'true' || raw === '1';
    }
    return raw;
  }
}