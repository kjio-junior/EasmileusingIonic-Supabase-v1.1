import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem, IonFooter, IonToggle,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { AdminApi } from '../../../core/admin-api.service';
import { Faq } from '../../../core/faqs.service';

interface FormState {
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: boolean;
}

const EMPTY: FormState = {
  question: '',
  answer: '',
  category: 'general',
  order: 0,
  is_active: true
};

const CATEGORIES = ['general', 'booking', 'payment', 'services', 'security', 'account'];

@Component({
  standalone: true,
  selector: 'app-admin-faqs',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonItem, IonFooter, IonToggle
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>FAQs</h1>
            <p class="sub">Manage frequently asked questions</p>
          </div>
          <button type="button" class="new-btn" (click)="openNew()">
            <ion-icon name="add-outline"></ion-icon>
            <span>New FAQ</span>
          </button>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!faqs().length) {
          <div class="empty-state">
            <ion-icon name="help-circle-outline"></ion-icon>
            <h3>No FAQs yet</h3>
            <p>Create your first FAQ so customers can find answers.</p>
          </div>
        } @else {
          <div class="list">
            @for (f of faqs(); track f.id) {
              <div class="faq-card" [class.inactive]="!f.is_active">
                <div class="faq-head">
                  <div class="order-chip">#{{ f.order }}</div>
                  <div class="category-chip" [attr.data-category]="f.category">{{ f.category }}</div>
                  @if (!f.is_active) {
                    <div class="inactive-chip">Inactive</div>
                  }
                </div>

                <div class="faq-question">{{ f.question }}</div>
                <div class="faq-answer">{{ f.answer }}</div>

                <div class="actions">
                  <button type="button" class="icon-btn" (click)="openEdit(f)" title="Edit">
                    <ion-icon name="create-outline"></ion-icon>
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    [class.danger]="f.is_active"
                    [class.success]="!f.is_active"
                    (click)="toggleActive(f)"
                    [title]="f.is_active ? 'Deactivate' : 'Activate'">
                    <ion-icon [name]="f.is_active ? 'ban-outline' : 'checkmark-circle-outline'"></ion-icon>
                  </button>
                  <button type="button" class="icon-btn danger" (click)="confirmDelete(f)" title="Delete">
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>

    <ion-modal [isOpen]="editorOpen()" (didDismiss)="closeEditor()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>{{ editingId() ? 'Edit FAQ' : 'New FAQ' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeEditor()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          <div class="form-wrap">

            <div class="field-group">
              <label class="field-label">Question *</label>
              <ion-item lines="none" class="field">
                <ion-input
                  [(ngModel)]="form.question"
                  placeholder="How do I book an appointment?"
                  [disabled]="saving()">
                </ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Answer *</label>
              <ion-item lines="none" class="field field-textarea">
                <ion-textarea
                  [(ngModel)]="form.answer"
                  placeholder="Provide a clear and helpful answer..."
                  [autoGrow]="true"
                  rows="5"
                  [disabled]="saving()">
                </ion-textarea>
              </ion-item>
            </div>

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">Category</label>
                <ion-item lines="none" class="field">
                  <ion-select [(ngModel)]="form.category" [disabled]="saving()">
                    @for (c of categories; track c) {
                      <ion-select-option [value]="c">{{ c }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              </div>
              <div class="field-group">
                <label class="field-label">Order</label>
                <ion-item lines="none" class="field">
                  <ion-input type="number" [(ngModel)]="form.order" [disabled]="saving()"></ion-input>
                </ion-item>
              </div>
            </div>

            <ion-item lines="none" class="field toggle-field">
              <ion-toggle [(ngModel)]="form.is_active" [disabled]="saving()">
                Active (shown to customers)
              </ion-toggle>
            </ion-item>

            @if (formError()) {
              <div class="err-box">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ formError() }}</span>
              </div>
            }

          </div>
        </ion-content>

        <ion-footer class="ion-no-border">
          <ion-toolbar class="modal-footer">
            <ion-button expand="block" class="save-btn" (click)="save()" [disabled]="saving()">
              @if (saving()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                {{ editingId() ? 'Save Changes' : 'Create FAQ' }}
              }
            </ion-button>
          </ion-toolbar>
        </ion-footer>
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

    .new-btn {
      display: flex; align-items: center; gap: 6px;
      background: #0A1E29; color: #ffffff;
      border: 0; border-radius: 9999px;
      padding: 10px 18px;
      font-size: 13px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
      white-space: nowrap;
    }
    .new-btn:hover { background: #142635; }
    .new-btn ion-icon { font-size: 18px; }

    .list { display: flex; flex-direction: column; gap: 12px; }

    .faq-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .faq-card.inactive { opacity: 0.6; }

    .faq-head {
      display: flex; gap: 8px; align-items: center; margin-bottom: 10px;
    }
    .order-chip {
      font-size: 11px; font-weight: 700; color: #7a8a97;
      background: #f2f8fc; padding: 3px 9px; border-radius: 9999px;
    }
    .category-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #e6f4fb; color: #1a5a7a;
    }
    .category-chip[data-category="booking"] { background: #d7f0e0; color: #1e6b3d; }
    .category-chip[data-category="payment"] { background: #fff4d6; color: #8a6d00; }
    .category-chip[data-category="security"] { background: #ece0ff; color: #5a3d8a; }
    .category-chip[data-category="services"] { background: #d6e8ff; color: #1a4f8a; }
    .category-chip[data-category="account"] { background: #ffe0d0; color: #8a3d1a; }
    .inactive-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #ffd7d7; color: #8a1a1a;
      margin-left: auto;
    }

    .faq-question {
      font-size: 15px; font-weight: 700; color: #0A1E29;
      line-height: 1.35; margin-bottom: 8px;
    }
    .faq-answer {
      font-size: 13px; color: #4a6272; line-height: 1.5;
    }

    .actions {
      display: flex; gap: 6px; margin-top: 14px; padding-top: 12px;
      border-top: 1px solid #eef3f8;
    }
    .icon-btn {
      width: 38px; height: 38px; border-radius: 50%;
      border: 0; background: #f2f8fc; color: #0A1E29;
      display: grid; place-items: center;
      font-size: 18px; cursor: pointer;
      transition: background 0.15s;
    }
    .icon-btn:hover { background: #e6f4fb; }
    .icon-btn.danger { color: #c0392b; }
    .icon-btn.danger:hover { background: #ffe0e0; }
    .icon-btn.success { color: #1e6b3d; }
    .icon-btn.success:hover { background: #d7f0e0; }

    .loading { display: grid; place-items: center; padding: 60px; }

    .empty-state {
      text-align: center; padding: 60px 20px;
      background: #ffffff; border-radius: 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .empty-state ion-icon { font-size: 48px; color: #b0bcc6; }
    .empty-state h3 { font-size: 16px; margin: 12px 0 6px; color: #0A1E29; }
    .empty-state p { font-size: 13px; color: #7a8a97; margin: 0; }

    /* MODAL */
    .modal-bar { --background: #0A1E29; --color: #ffffff; }
    .modal-bar ion-title { color: #ffffff; font-weight: 600; }
    .modal-bar ion-button { --color: #93D5ED; }
    .modal-bg { --background: #ffffff; --color: #0A1E29; }
    .form-wrap { padding: 20px 20px 32px; }

    .field-group { margin-bottom: 16px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px; letter-spacing: 0.3px;
    }

    .grid-2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .grid-2 .field-group { margin-bottom: 16px; }

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
    .field ion-textarea,
    .field ion-select {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 14px;
      --color: #0A1E29;
    }
    .field-textarea { --min-height: 100px; align-items: flex-start; padding: 6px 0; }

    .toggle-field {
      --background: transparent;
      --padding-start: 4px;
      font-size: 14px;
      color: #0A1E29;
    }

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
      height: 48px; font-weight: 600;
    }
    .save-btn::part(native) { color: #ffffff; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .list { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminFaqsPage implements OnInit {
  faqs = signal<Faq[]>([]);
  loading = signal(true);

  editorOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form: FormState = { ...EMPTY };
  categories = CATEGORIES;

  constructor(
    private api: AdminApi,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      this.faqs.set(await this.api.listFaqs());
    } catch {
      this.faqs.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openNew() {
    this.editingId.set(null);
    this.form = { ...EMPTY };
    this.formError.set(null);
    this.editorOpen.set(true);
  }

  openEdit(f: Faq) {
    this.editingId.set(f.id);
    this.form = {
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order,
      is_active: f.is_active
    };
    this.formError.set(null);
    this.editorOpen.set(true);
  }

  closeEditor() {
    this.editorOpen.set(false);
  }

  async save() {
    this.formError.set(null);
    if (!this.form.question.trim()) { this.formError.set('Question is required'); return; }
    if (!this.form.answer.trim()) { this.formError.set('Answer is required'); return; }

    this.saving.set(true);
    try {
      const payload: Partial<Faq> = {
        question: this.form.question.trim(),
        answer: this.form.answer.trim(),
        category: this.form.category,
        order: Number(this.form.order) || 0,
        is_active: this.form.is_active
      };

      if (this.editingId()) {
        const updated = await this.api.updateFaq(this.editingId()!, payload);
        this.faqs.update(list => list.map(x => x.id === updated.id ? updated : x));
        await this.toast('FAQ updated');
      } else {
        const created = await this.api.createFaq(payload);
        this.faqs.update(list => [...list, created].sort((a, b) => a.order - b.order));
        await this.toast('FAQ created');
      }
      this.closeEditor();
    } catch (e: any) {
      this.formError.set(e?.error?.error || 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(f: Faq) {
    try {
      const updated = await this.api.updateFaq(f.id, { is_active: !f.is_active });
      this.faqs.update(list => list.map(x => x.id === updated.id ? updated : x));
      await this.toast(updated.is_active ? 'FAQ activated' : 'FAQ deactivated');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Failed', 'danger');
    }
  }

  async confirmDelete(f: Faq) {
    const a = await this.alertCtrl.create({
      header: 'Delete FAQ?',
      message: `"${f.question}" will be removed. This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive' }
      ]
    });
    await a.present();
    const res = await a.onDidDismiss();
    if (res.role !== 'destructive') return;

    try {
      await this.api.deleteFaq(f.id);
      this.faqs.update(list => list.filter(x => x.id !== f.id));
      await this.toast('FAQ deleted');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Failed', 'danger');
    }
  }

  private async toast(message: string, color = 'success') {
    const t = await this.toastCtrl.create({
      message, duration: 1600, position: 'bottom', color
    });
    await t.present();
  }
}