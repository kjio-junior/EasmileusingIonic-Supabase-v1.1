import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonSearchbar,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonToggle,
  IonItem, IonFooter, IonList, IonLabel,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { AdminApi, AdminService } from '../../../core/admin-api.service';

interface FormState {
  name: string;
  description: string;
  price: number;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'surgical' | 'diagnostic';
  duration_minutes: number;
  image_url: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: 0,
  category: 'preventive',
  duration_minutes: 30,
  image_url: '',
  is_active: true
};

@Component({
  standalone: true,
  selector: 'app-admin-services',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonSearchbar,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonToggle,
    IonItem, IonFooter, IonList, IonLabel
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Services</h1>
            <p class="sub">Manage the dental services catalog</p>
          </div>
          <button class="new-btn" type="button" (click)="openNew()">
            <ion-icon name="add-outline"></ion-icon>
            <span>New Service</span>
          </button>
        </div>

        <ion-searchbar
          class="search"
          placeholder="Search services..."
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          [debounce]="250">
        </ion-searchbar>

        <div class="filters">
          @for (c of categories; track c.value) {
            <button
              type="button"
              class="chip-filter"
              [class.active]="activeCategory === c.value"
              (click)="setCategory(c.value)">
              {{ c.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!services().length) {
          <p class="empty">No services match your filters.</p>
        } @else {
          <div class="grid">
            @for (s of services(); track s.id) {
              <div class="service-card" [class.inactive]="!s.is_active">
                <div class="card-top">
                  <div
                    class="icon-circle"
                    [attr.data-category]="s.category"
                    [style.background-image]="s.image_url ? 'url(' + s.image_url + ')' : null">
                    @if (!s.image_url) {
                      <ion-icon [name]="iconFor(s.category)"></ion-icon>
                    }
                  </div>
                  @if (!s.is_active) {
                    <span class="inactive-badge">Inactive</span>
                  }
                </div>

                <h3 class="name">{{ s.name }}</h3>
                <p class="desc">{{ s.description }}</p>

                <div class="meta">
                  <span class="cat-chip" [attr.data-category]="s.category">{{ s.category }}</span>
                  <span class="duration">{{ s.duration_minutes }} min</span>
                </div>

                <div class="price-row">
                  <span class="price">₱{{ s.price }}</span>
                  <span class="stock">Stock: {{ s.stock }}</span>
                </div>

                <div class="actions">
                  <button type="button" class="icon-btn" (click)="openEdit(s)" title="Edit">
                    <ion-icon name="create-outline"></ion-icon>
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    [class.danger]="s.is_active"
                    [class.success]="!s.is_active"
                    (click)="toggleActive(s)"
                    [title]="s.is_active ? 'Deactivate' : 'Activate'">
                    <ion-icon [name]="s.is_active ? 'ban-outline' : 'checkmark-circle-outline'"></ion-icon>
                  </button>
                  <button type="button" class="icon-btn danger" (click)="confirmDelete(s)" title="Delete">
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>

    <!-- EDIT / CREATE MODAL -->
    <ion-modal [isOpen]="editorOpen()" (didDismiss)="closeEditor()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>{{ editingId() ? 'Edit Service' : 'New Service' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeEditor()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          <div class="form-wrap">

            <ion-item lines="none" class="field">
              <ion-input
                label="Name"
                labelPlacement="floating"
                [(ngModel)]="form.name"
                [disabled]="saving()">
              </ion-input>
            </ion-item>

            <ion-item lines="none" class="field field-textarea">
              <ion-textarea
                label="Description"
                labelPlacement="floating"
                [(ngModel)]="form.description"
                [autoGrow]="true"
                rows="3"
                [disabled]="saving()">
              </ion-textarea>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-input
                label="Price (₱)"
                labelPlacement="floating"
                type="number"
                [(ngModel)]="form.price"
                [disabled]="saving()">
              </ion-input>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-select
                label="Category"
                labelPlacement="floating"
                [(ngModel)]="form.category"
                [disabled]="saving()">
                <ion-select-option value="preventive">Preventive</ion-select-option>
                <ion-select-option value="restorative">Restorative</ion-select-option>
                <ion-select-option value="cosmetic">Cosmetic</ion-select-option>
                <ion-select-option value="surgical">Surgical</ion-select-option>
                <ion-select-option value="diagnostic">Diagnostic</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-input
                label="Duration (minutes)"
                labelPlacement="floating"
                type="number"
                [(ngModel)]="form.duration_minutes"
                [disabled]="saving()">
              </ion-input>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-input
                label="Image URL"
                labelPlacement="floating"
                type="url"
                [(ngModel)]="form.image_url"
                [disabled]="saving()">
              </ion-input>
            </ion-item>

            @if (form.image_url) {
              <div class="img-preview" [style.background-image]="'url(' + form.image_url + ')' "></div>
            }

            <ion-item lines="none" class="field toggle-field">
              <ion-toggle [(ngModel)]="form.is_active" [disabled]="saving()">
                Active (visible to customers)
              </ion-toggle>
            </ion-item>

            @if (formError()) {
              <p class="err">{{ formError() }}</p>
            }

          </div>
        </ion-content>

        <ion-footer class="ion-no-border">
          <ion-toolbar class="modal-footer">
            <ion-button expand="block" class="save-btn" (click)="save()" [disabled]="saving()">
              @if (saving()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                {{ editingId() ? 'Save Changes' : 'Create Service' }}
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
      gap: 16px; margin-bottom: 16px;
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
      white-space: nowrap;
    }
    .new-btn:hover { background: #142635; }
    .new-btn ion-icon { font-size: 18px; }

    .search {
      --background: #ffffff;
      --border-radius: 9999px;
      --box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      --color: #0A1E29;
      padding: 0 0 12px;
    }

    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
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

    .grid { display: grid; grid-template-columns: 1fr; gap: 12px; }

    .service-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      display: flex; flex-direction: column;
    }
    .service-card.inactive { opacity: 0.6; }

    .card-top {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .icon-circle {
      width: 56px; height: 56px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 22px; color: #4EBE7D;
      background: #e6f4fb;
      background-size: cover;
      background-position: center;
    }
    .icon-circle[data-category="preventive"]  { background: #d7f0e0; color: #1e6b3d; }
    .icon-circle[data-category="restorative"] { background: #d6e8ff; color: #1a4f8a; }
    .icon-circle[data-category="cosmetic"]    { background: #ece0ff; color: #5a3d8a; }
    .icon-circle[data-category="surgical"]    { background: #ffe0d0; color: #8a3d1a; }
    .icon-circle[data-category="diagnostic"]  { background: #fff4d6; color: #8a6d00; }

    .inactive-badge {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #ffd7d7; color: #8a1a1a;
    }

    .name { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 4px; }
    .desc {
      font-size: 12px; color: #4a6272; line-height: 1.4;
      margin: 0 0 10px;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }

    .meta { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
    .cat-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #eef3f8; color: #4a6272;
    }
    .cat-chip[data-category="preventive"]  { background: #d7f0e0; color: #1e6b3d; }
    .cat-chip[data-category="restorative"] { background: #d6e8ff; color: #1a4f8a; }
    .cat-chip[data-category="cosmetic"]    { background: #ece0ff; color: #5a3d8a; }
    .cat-chip[data-category="surgical"]    { background: #ffe0d0; color: #8a3d1a; }
    .cat-chip[data-category="diagnostic"]  { background: #fff4d6; color: #8a6d00; }
    .duration { font-size: 11px; color: #7a8a97; }

    .price-row {
      display: flex; align-items: baseline; justify-content: space-between;
      margin-top: auto; padding-top: 10px;
      border-top: 1px solid #eef3f8;
    }
    .price { font-size: 17px; font-weight: 700; color: #0A1E29; }
    .stock { font-size: 11px; color: #7a8a97; }

    .actions {
      display: flex; gap: 6px; margin-top: 12px;
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
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    /* MODAL */
    .modal-bar { --background: #0A1E29; --color: #ffffff; }
    .modal-bar ion-title { color: #ffffff; font-weight: 600; }
    .modal-bar ion-button { --color: #93D5ED; }
    .modal-bg { --background: #ffffff; --color: #0A1E29; }
    .form-wrap { padding: 16px 16px 32px; }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 16px;
      --inner-padding-end: 16px;
      --color: #0A1E29;
      margin-bottom: 12px;
      border-radius: 14px;
    }
    .field-textarea { --padding-start: 16px; align-items: flex-start; }
    .toggle-field {
      --background: transparent;
      --padding-start: 4px;
      font-size: 14px;
      color: #0A1E29;
    }

    .img-preview {
      margin: 0 0 12px;
      aspect-ratio: 16 / 9;
      border-radius: 14px;
      background-size: cover;
      background-position: center;
      background-color: #e6f4fb;
      border: 1px solid #e6eef5;
    }

    .err { color: #c0392b; font-size: 13px; margin: 4px 4px 0; }

    .modal-footer { --background: #ffffff; padding: 12px 16px 20px; }
    .save-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-activated: #ffffff;
      --color-disabled: #ffffff;
      height: 46px;
      font-weight: 600;
    }
    .save-btn::part(native) { color: #ffffff; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .grid { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 1400px) {
      .grid { grid-template-columns: 1fr 1fr 1fr; }
    }
  `]
})
export class AdminServicesPage implements OnInit {
  services = signal<AdminService[]>([]);
  loading = signal(true);
  searchQuery = '';
  activeCategory = '';

  editorOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  form: FormState = { ...EMPTY_FORM };

  categories = [
    { label: 'All',          value: '' },
    { label: 'Preventive',   value: 'preventive' },
    { label: 'Restorative',  value: 'restorative' },
    { label: 'Cosmetic',     value: 'cosmetic' },
    { label: 'Surgical',     value: 'surgical' },
    { label: 'Diagnostic',   value: 'diagnostic' }
  ];

  private searchTimer?: any;

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
      const list = await this.api.listServices({
        category: this.activeCategory || undefined,
        q: this.searchQuery.trim() || undefined
      });
      this.services.set(list);
    } catch {
      this.services.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 250);
  }

  setCategory(c: string) {
    this.activeCategory = c;
    this.load();
  }

  iconFor(category: string): string {
    switch (category) {
      case 'preventive':  return 'sparkles-outline';
      case 'restorative': return 'construct-outline';
      case 'cosmetic':    return 'color-wand-outline';
      case 'surgical':    return 'medical-outline';
      case 'diagnostic':  return 'eye-outline';
      default:            return 'ellipsis-horizontal-outline';
    }
  }

  // ---------- EDITOR ----------

  openNew() {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.formError.set(null);
    this.editorOpen.set(true);
  }

  openEdit(s: AdminService) {
    this.editingId.set(s.id);
    this.form = {
      name: s.name,
      description: s.description,
      price: s.price,
      category: s.category,
      duration_minutes: s.duration_minutes,
      image_url: s.image_url ?? '',
      is_active: s.is_active
    };
    this.formError.set(null);
    this.editorOpen.set(true);
  }

  closeEditor() {
    this.editorOpen.set(false);
  }

  async save() {
    this.formError.set(null);

    if (!this.form.name.trim()) {
      this.formError.set('Name is required');
      return;
    }
    if (!this.form.description.trim()) {
      this.formError.set('Description is required');
      return;
    }
    if (!this.form.category) {
      this.formError.set('Category is required');
      return;
    }
    if (this.form.price == null || this.form.price < 0) {
      this.formError.set('Price must be a positive number');
      return;
    }

    this.saving.set(true);
    try {
      const payload = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: Number(this.form.price),
        category: this.form.category,
        duration_minutes: Number(this.form.duration_minutes) || 30,
        image_url: this.form.image_url.trim() || null,
        is_active: this.form.is_active
      };

      if (this.editingId()) {
        const updated = await this.api.updateService(this.editingId()!, payload);
        this.services.update(list => list.map(x => x.id === updated.id ? updated : x));
        await this.toast('Service updated', 'success');
      } else {
        const created = await this.api.createService(payload);
        this.services.update(list => [created, ...list]);
        await this.toast('Service created', 'success');
      }
      this.closeEditor();
    } catch (e: any) {
      this.formError.set(e?.error?.error || e?.message || 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(s: AdminService) {
    try {
      const updated = await this.api.updateService(s.id, { is_active: !s.is_active });
      this.services.update(list => list.map(x => x.id === updated.id ? updated : x));
      await this.toast(updated.is_active ? 'Activated' : 'Deactivated', 'success');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Failed', 'danger');
    }
  }

  async confirmDelete(s: AdminService) {
    const a = await this.alertCtrl.create({
      header: 'Delete service?',
      message: `"${s.name}" will be removed from the catalog. Existing appointments that reference it are not affected.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive' }
      ]
    });
    await a.present();
    const res = await a.onDidDismiss();
    if (res.role !== 'destructive') return;

    try {
      await this.api.deleteService(s.id);
      this.services.update(list => list.filter(x => x.id !== s.id));
      await this.toast('Service deleted', 'success');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Delete failed', 'danger');
    }
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({
      message, duration: 1800, position: 'bottom', color
    });
    await t.present();
  }
}