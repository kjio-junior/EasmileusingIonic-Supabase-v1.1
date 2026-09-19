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
import { Banner } from '../../../core/banners.service';

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  button_text: string;
  position: 'hero' | 'featured' | 'sidebar' | 'footer';
  order: number;
  is_active: boolean;
}

const EMPTY: FormState = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  link_url: '',
  button_text: '',
  position: 'hero',
  order: 0,
  is_active: true
};

@Component({
  standalone: true,
  selector: 'app-admin-banners',
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
            <h1>Banners</h1>
            <p class="sub">Manage promotional content shown on the landing page</p>
          </div>
          <button type="button" class="new-btn" (click)="openNew()">
            <ion-icon name="add-outline"></ion-icon>
            <span>New Banner</span>
          </button>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!banners().length) {
          <div class="empty-state">
            <ion-icon name="images-outline"></ion-icon>
            <h3>No banners yet</h3>
            <p>Create your first promotional banner for the landing page.</p>
          </div>
        } @else {
          <div class="grid">
            @for (b of banners(); track b.id) {
              <div class="banner-card" [class.inactive]="!b.is_active">
                <div class="banner-img" [style.background-image]="'url(' + b.image_url + ')'">
                  <span class="order-chip">#{{ b.order }}</span>
                  @if (!b.is_active) {
                    <span class="inactive-chip">Inactive</span>
                  }
                  <span class="position-chip" [attr.data-position]="b.position">{{ b.position }}</span>
                </div>

                <div class="banner-body">
                  <div class="banner-title">{{ b.title }}</div>
                  @if (b.subtitle) {
                    <div class="banner-sub">{{ b.subtitle }}</div>
                  }
                  @if (b.link_url) {
                    <div class="banner-link">
                      <ion-icon name="link-outline"></ion-icon>
                      <span>{{ b.link_url }}</span>
                    </div>
                  }
                </div>

                <div class="banner-actions">
                  <button type="button" class="icon-btn" (click)="openEdit(b)" title="Edit">
                    <ion-icon name="create-outline"></ion-icon>
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    [class.danger]="b.is_active"
                    [class.success]="!b.is_active"
                    (click)="toggleActive(b)"
                    [title]="b.is_active ? 'Deactivate' : 'Activate'">
                    <ion-icon [name]="b.is_active ? 'ban-outline' : 'checkmark-circle-outline'"></ion-icon>
                  </button>
                  <button type="button" class="icon-btn danger" (click)="confirmDelete(b)" title="Delete">
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
            <ion-title>{{ editingId() ? 'Edit Banner' : 'New Banner' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeEditor()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          <div class="form-wrap">

            <div class="field-group">
              <label class="field-label">Title *</label>
              <ion-item lines="none" class="field">
                <ion-input [(ngModel)]="form.title" placeholder="Take Care of Your Smile" [disabled]="saving()"></ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Subtitle</label>
              <ion-item lines="none" class="field">
                <ion-input [(ngModel)]="form.subtitle" placeholder="Optional short headline" [disabled]="saving()"></ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Description</label>
              <ion-item lines="none" class="field field-textarea">
                <ion-textarea [(ngModel)]="form.description" [autoGrow]="true" rows="2" [disabled]="saving()" placeholder="Optional longer description"></ion-textarea>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Image URL *</label>
              <ion-item lines="none" class="field">
                <ion-input [(ngModel)]="form.image_url" placeholder="https://..." [disabled]="saving()"></ion-input>
              </ion-item>
              @if (form.image_url) {
                <div class="preview" [style.background-image]="'url(' + form.image_url + ')'"></div>
              }
            </div>

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">Link URL</label>
                <ion-item lines="none" class="field">
                  <ion-input [(ngModel)]="form.link_url" placeholder="/app/services" [disabled]="saving()"></ion-input>
                </ion-item>
              </div>
              <div class="field-group">
                <label class="field-label">Button Text</label>
                <ion-item lines="none" class="field">
                  <ion-input [(ngModel)]="form.button_text" placeholder="Book Now" [disabled]="saving()"></ion-input>
                </ion-item>
              </div>
            </div>

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">Position</label>
                <ion-item lines="none" class="field">
                  <ion-select [(ngModel)]="form.position" [disabled]="saving()">
                    <ion-select-option value="hero">Hero</ion-select-option>
                    <ion-select-option value="featured">Featured</ion-select-option>
                    <ion-select-option value="sidebar">Sidebar</ion-select-option>
                    <ion-select-option value="footer">Footer</ion-select-option>
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
                Active (shown on landing page)
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
                {{ editingId() ? 'Save Changes' : 'Create Banner' }}
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

    .grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr; } }

    .banner-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .banner-card.inactive { opacity: 0.6; }

    .banner-img {
      position: relative;
      aspect-ratio: 16 / 9;
      background-size: cover;
      background-position: center;
      background-color: #e6f4fb;
    }
    .order-chip, .inactive-chip, .position-chip {
      position: absolute;
      top: 10px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      backdrop-filter: blur(6px);
    }
    .order-chip { left: 10px; background: rgba(10,30,41,0.7); color: #ffffff; }
    .inactive-chip { right: 10px; background: rgba(192,57,43,0.85); color: #ffffff; }
    .position-chip {
      bottom: 10px;
      top: auto;
      right: 10px;
      background: rgba(255,255,255,0.9);
      color: #0A1E29;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .banner-body { padding: 14px 16px 8px; }
    .banner-title { font-size: 15px; font-weight: 700; color: #0A1E29; }
    .banner-sub { font-size: 12px; color: #7a8a97; margin-top: 2px; }
    .banner-link {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: #4EBE7D; margin-top: 6px;
    }
    .banner-link ion-icon { font-size: 12px; }

    .banner-actions {
      display: flex; gap: 6px;
      padding: 8px 16px 14px;
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
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;
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
    .field-textarea { --min-height: 70px; align-items: flex-start; padding: 6px 0; }

    .toggle-field {
      --background: transparent;
      --padding-start: 4px;
      font-size: 14px;
      color: #0A1E29;
    }

    .preview {
      margin-top: 8px;
      aspect-ratio: 16 / 9;
      border-radius: 14px;
      background-size: cover;
      background-position: center;
      background-color: #e6f4fb;
      border: 1px solid #e6eef5;
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
  `]
})
export class AdminBannersPage implements OnInit {
  banners = signal<Banner[]>([]);
  loading = signal(true);

  editorOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form: FormState = { ...EMPTY };

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
      this.banners.set(await this.api.listBanners());
    } catch {
      this.banners.set([]);
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

  openEdit(b: Banner) {
    this.editingId.set(b.id);
    this.form = {
      title: b.title,
      subtitle: b.subtitle ?? '',
      description: b.description ?? '',
      image_url: b.image_url,
      link_url: b.link_url ?? '',
      button_text: b.button_text ?? '',
      position: b.position,
      order: b.order,
      is_active: b.is_active
    };
    this.formError.set(null);
    this.editorOpen.set(true);
  }

  closeEditor() {
    this.editorOpen.set(false);
  }

  async save() {
    this.formError.set(null);
    if (!this.form.title.trim()) { this.formError.set('Title is required'); return; }
    if (!this.form.image_url.trim()) { this.formError.set('Image URL is required'); return; }

    this.saving.set(true);
    try {
      const payload: Partial<Banner> = {
        title: this.form.title.trim(),
        subtitle: this.form.subtitle.trim() || null,
        description: this.form.description.trim() || null,
        image_url: this.form.image_url.trim(),
        link_url: this.form.link_url.trim() || null,
        button_text: this.form.button_text.trim() || null,
        position: this.form.position,
        order: Number(this.form.order) || 0,
        is_active: this.form.is_active
      };

      if (this.editingId()) {
        const updated = await this.api.updateBanner(this.editingId()!, payload);
        this.banners.update(list => list.map(x => x.id === updated.id ? updated : x));
        await this.toast('Banner updated');
      } else {
        const created = await this.api.createBanner(payload);
        this.banners.update(list => [created, ...list]);
        await this.toast('Banner created');
      }
      this.closeEditor();
    } catch (e: any) {
      this.formError.set(e?.error?.error || 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(b: Banner) {
    try {
      const updated = await this.api.updateBanner(b.id, { is_active: !b.is_active });
      this.banners.update(list => list.map(x => x.id === updated.id ? updated : x));
      await this.toast(updated.is_active ? 'Banner activated' : 'Banner deactivated');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Failed', 'danger');
    }
  }

  async confirmDelete(b: Banner) {
    const a = await this.alertCtrl.create({
      header: 'Delete banner?',
      message: `"${b.title}" will be removed. This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive' }
      ]
    });
    await a.present();
    const res = await a.onDidDismiss();
    if (res.role !== 'destructive') return;

    try {
      await this.api.deleteBanner(b.id);
      this.banners.update(list => list.filter(x => x.id !== b.id));
      await this.toast('Banner deleted');
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