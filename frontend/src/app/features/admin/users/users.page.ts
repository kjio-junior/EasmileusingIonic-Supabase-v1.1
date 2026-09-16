import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonSearchbar,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonInput, IonSelect, IonSelectOption, IonItem, IonFooter,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { AdminApi, AdminUser } from '../../../core/admin-api.service';
import { AdminAuthService } from '../../../core/admin-auth.service';

interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

const EMPTY_NEW_USER: NewUserForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'patient'
};

@Component({
  standalone: true,
  selector: 'app-admin-users',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonSearchbar,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonInput, IonSelect, IonSelectOption, IonItem, IonFooter
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Users</h1>
            <p class="sub">Manage patients, staff, and administrators</p>
          </div>
          <button class="new-btn" type="button" (click)="openNew()">
            <ion-icon name="add-outline"></ion-icon>
            <span>New User</span>
          </button>
        </div>

        <div class="tools">
          <ion-searchbar
            class="search"
            placeholder="Search by name or email..."
            [(ngModel)]="searchQuery"
            (ionInput)="onSearch()"
            [debounce]="250">
          </ion-searchbar>

          <div class="filters">
            @for (r of roles; track r) {
              <button
                type="button"
                class="chip-filter"
                [class.active]="activeRole === r.value"
                (click)="setRole(r.value)">
                {{ r.label }}
              </button>
            }
          </div>
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!users().length) {
          <p class="empty">No users match your filters.</p>
        } @else {
          <div class="list">
            @for (u of users(); track u.id) {
              <div class="user-card">
                <div class="avatar" [attr.data-role]="u.role">{{ initials(u) }}</div>

                <div class="user-body">
                  <div class="user-name">
                    {{ u.first_name }} {{ u.last_name }}
                    @if (!u.is_active) {
                      <span class="badge inactive">Inactive</span>
                    }
                  </div>
                  <div class="user-email">{{ u.email }}</div>
                  <div class="user-meta">
                    <span class="role-chip" [attr.data-role]="u.role">{{ u.role }}</span>
                    @if (u.phone) {
                      <span class="phone">{{ u.phone }}</span>
                    }
                  </div>
                </div>

                <div class="actions">
                  <button
                    type="button"
                    class="icon-btn"
                    [class.danger]="u.is_active"
                    [class.success]="!u.is_active"
                    (click)="toggleActive(u)"
                    [title]="u.is_active ? 'Deactivate' : 'Activate'">
                    <ion-icon [name]="u.is_active ? 'ban-outline' : 'checkmark-circle-outline'"></ion-icon>
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    (click)="changeRole(u)"
                    title="Change role">
                    <ion-icon name="create-outline"></ion-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </ion-content>

    <!-- NEW USER MODAL -->
    <ion-modal [isOpen]="modalOpen()" (didDismiss)="closeModal()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>New User</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeModal()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          <div class="form-wrap">

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">First name</label>
                <ion-item lines="none" class="field">
                  <ion-input [(ngModel)]="form.first_name" [disabled]="saving()" placeholder="Jane"></ion-input>
                </ion-item>
              </div>
              <div class="field-group">
                <label class="field-label">Last name</label>
                <ion-item lines="none" class="field">
                  <ion-input [(ngModel)]="form.last_name" [disabled]="saving()" placeholder="Doe"></ion-input>
                </ion-item>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Email</label>
              <ion-item lines="none" class="field">
                <ion-input type="email" [(ngModel)]="form.email" [disabled]="saving()" placeholder="jane@easmile.com"></ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Phone</label>
              <ion-item lines="none" class="field">
                <ion-input type="tel" [(ngModel)]="form.phone" [disabled]="saving()" placeholder="+63 912 345 6789"></ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Role</label>
              <ion-item lines="none" class="field">
                <ion-select [(ngModel)]="form.role" [disabled]="saving()" interface="popover">
                  <ion-select-option value="patient">Patient — book appointments</ion-select-option>
                  <ion-select-option value="staff">Staff / Receptionist — front desk</ion-select-option>
                  <ion-select-option value="dentist">Dentist — manage patients & treatment notes</ion-select-option>
                  <ion-select-option value="admin">Admin — full system control</ion-select-option>
                </ion-select>
              </ion-item>
              <p class="role-hint">{{ roleDescription(form.role) }}</p>
            </div>

            <div class="field-group">
              <label class="field-label">Temporary Password</label>
              <ion-item lines="none" class="field">
                <ion-input type="text" [(ngModel)]="form.password" [disabled]="saving()" placeholder="At least 6 characters"></ion-input>
              </ion-item>
              <p class="hint">Share this with the user. They can change it after first login.</p>
            </div>

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
                Create User
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
      gap: 16px; margin-bottom: 20px;
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

    .tools { margin-bottom: 16px; }
    .search {
      --background: #ffffff;
      --border-radius: 9999px;
      --box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      --color: #0A1E29;
      padding: 0 0 10px;
    }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
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

    .list { display: flex; flex-direction: column; gap: 10px; }

    .user-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .avatar {
      width: 46px; height: 46px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 15px; font-weight: 700;
      background: #d9f0fb; color: #1a5a7a;
      flex: 0 0 auto;
    }
    .avatar[data-role="admin"]   { background: #ece0ff; color: #5a3d8a; }
    .avatar[data-role="dentist"] { background: #d7f0e0; color: #1e6b3d; }
    .avatar[data-role="staff"]   { background: #fff4d6; color: #8a6d00; }
    .avatar[data-role="patient"] { background: #d9f0fb; color: #1a5a7a; }
    .avatar[data-role="guest"]   { background: #eef3f8; color: #7a8a97; }

    .user-body { flex: 1; min-width: 0; }
    .user-name {
      font-size: 14px; font-weight: 700; color: #0A1E29;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .user-email {
      font-size: 12px; color: #7a8a97; margin: 2px 0 6px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .user-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .role-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #eef3f8; color: #4a6272;
    }
    .role-chip[data-role="admin"]   { background: #ece0ff; color: #5a3d8a; }
    .role-chip[data-role="dentist"] { background: #d7f0e0; color: #1e6b3d; }
    .role-chip[data-role="staff"]   { background: #fff4d6; color: #8a6d00; }
    .role-chip[data-role="patient"] { background: #d9f0fb; color: #1a5a7a; }
    .phone { font-size: 11px; color: #7a8a97; }
    .badge.inactive {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 8px; border-radius: 9999px;
      background: #ffd7d7; color: #8a1a1a;
    }

    .actions { display: flex; gap: 6px; flex: 0 0 auto; }
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
    .form-wrap { padding: 20px 20px 32px; }

    .field-group { margin-bottom: 16px; }
    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #0A1E29;
      margin: 0 0 8px 4px;
      letter-spacing: 0.3px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .grid-2 .field-group { margin-bottom: 0; }

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
    .field ion-select {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 15px;
      --color: #0A1E29;
    }

    .role-hint {
      font-size: 12px;
      color: #7a8a97;
      margin: 8px 4px 0;
      font-style: italic;
    }
    .hint { font-size: 12px; color: #7a8a97; margin: 8px 4px 0; }

    .err-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #ffe0e0;
      border-radius: 12px;
      color: #8a1a1a;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
    }
    .err-box ion-icon { font-size: 18px; flex: 0 0 auto; }

    .modal-footer { --background: #ffffff; padding: 12px 20px 20px; }
    .save-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-activated: #ffffff;
      --color-disabled: #ffffff;
      height: 48px;
      font-weight: 600;
    }
    .save-btn::part(native) { color: #ffffff; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .list { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminUsersPage implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  searchQuery = '';
  activeRole = '';

  modalOpen = signal(false);
  saving = signal(false);
  formError = signal<string | null>(null);
  form: NewUserForm = { ...EMPTY_NEW_USER };

  roles = [
    { label: 'All',      value: '' },
    { label: 'Patients', value: 'patient' },
    { label: 'Dentists', value: 'dentist' },
    { label: 'Staff',    value: 'staff' },
    { label: 'Admins',   value: 'admin' }
  ];

  private searchTimer?: any;

  constructor(
    private api: AdminApi,
    private adminAuth: AdminAuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.listUsers({
        role: this.activeRole || undefined,
        q: this.searchQuery.trim() || undefined
      });
      this.users.set(list);
    } catch {
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 250);
  }

  setRole(role: string) {
    this.activeRole = role;
    this.load();
  }

  initials(u: AdminUser): string {
    return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
  }

  roleDescription(role: string): string {
    switch (role) {
      case 'admin':   return 'Full system control — manages users, settings, and all data.';
      case 'dentist': return 'Manages appointments, views patient records, adds treatment notes.';
      case 'staff':   return 'Schedules and manages appointments — front desk duties.';
      case 'patient': return 'Books appointments and views their own history.';
      default:        return '';
    }
  }

  // ---------- NEW USER MODAL ----------

  openNew() {
    this.form = { ...EMPTY_NEW_USER };
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  async save() {
    this.formError.set(null);

    if (!this.form.first_name.trim() || !this.form.last_name.trim()) {
      this.formError.set('Enter first and last name');
      return;
    }
    if (!this.form.email.trim()) {
      this.formError.set('Enter an email');
      return;
    }
    if (!this.form.phone.trim()) {
      this.formError.set('Enter a phone number');
      return;
    }
    if (this.form.password.length < 6) {
      this.formError.set('Password must be at least 6 characters');
      return;
    }

    this.saving.set(true);
    try {
      const created = await this.api.createUser({
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        password: this.form.password,
        role: this.form.role
      });
      this.users.update(list => [created, ...list]);
      const t = await this.toastCtrl.create({
        message: `${created.role} account created`,
        duration: 1800, position: 'bottom', color: 'success'
      });
      await t.present();
      this.closeModal();
    } catch (e: any) {
      this.formError.set(e?.error?.error || e?.message || 'Failed to create user');
    } finally {
      this.saving.set(false);
    }
  }

  // ---------- EXISTING ACTIONS ----------

  async toggleActive(u: AdminUser) {
    const me = this.adminAuth.user();
    if (me && me.id === u.id && u.is_active) {
      const a = await this.alertCtrl.create({
        header: 'Not allowed',
        message: 'You cannot deactivate your own account.',
        buttons: ['OK']
      });
      await a.present();
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: u.is_active ? 'Deactivate user?' : 'Activate user?',
      message: `${u.first_name} ${u.last_name} will be ${u.is_active ? 'unable to log in' : 'able to log in again'}.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: u.is_active ? 'Deactivate' : 'Activate', role: 'confirm' }
      ]
    });
    await confirm.present();
    const choice = await confirm.onDidDismiss();
    if (choice.role !== 'confirm') return;

    try {
      const updated = await this.api.updateUser(u.id, { is_active: !u.is_active });
      this.users.update(list => list.map(x => x.id === updated.id ? { ...x, is_active: updated.is_active } : x));
      const t = await this.toastCtrl.create({
        message: `User ${updated.is_active ? 'activated' : 'deactivated'}`,
        duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed', duration: 2000, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }

  async changeRole(u: AdminUser) {
    const a = await this.alertCtrl.create({
      header: 'Change role',
      inputs: [
        { name: 'role', type: 'radio', label: 'Patient', value: 'patient', checked: u.role === 'patient' },
        { name: 'role', type: 'radio', label: 'Dentist', value: 'dentist', checked: u.role === 'dentist' },
        { name: 'role', type: 'radio', label: 'Staff',   value: 'staff',   checked: u.role === 'staff' },
        { name: 'role', type: 'radio', label: 'Admin',   value: 'admin',   checked: u.role === 'admin' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Save', role: 'confirm' }
      ]
    });
    await a.present();
    const res = await a.onDidDismiss();
    if (res.role !== 'confirm' || !res.data) return;

    try {
      const updated = await this.api.updateUser(u.id, { role: res.data });
      this.users.update(list => list.map(x => x.id === updated.id ? { ...x, role: updated.role } : x));
      const t = await this.toastCtrl.create({
        message: 'Role updated', duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed', duration: 2000, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }
}