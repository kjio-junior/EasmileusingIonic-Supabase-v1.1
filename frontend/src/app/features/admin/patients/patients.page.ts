import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner, IonSearchbar,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import {
  AdminApi, PatientListItem, PatientSummary, PatientHistoryAppointment
} from '../../../core/admin-api.service';
import { AdminAuthService } from '../../../core/admin-auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-patients',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonSearchbar,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton
  ],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Patients</h1>
            <p class="sub">View patient profiles and treatment history</p>
          </div>
          <div class="count-pill">{{ patients().length }} total</div>
        </div>

        <ion-searchbar
          class="search"
          placeholder="Search by name, email, or phone..."
          [(ngModel)]="searchQuery"
          (ionInput)="onSearch()"
          [debounce]="250">
        </ion-searchbar>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!patients().length) {
          <p class="empty">No patients match your search.</p>
        } @else {
          <div class="list">
            @for (p of patients(); track p.id) {
              <button type="button" class="patient-card" (click)="openPatient(p)">
                <div class="avatar">
                  @if (p.profile_image) {
                    <img [src]="p.profile_image" alt="" />
                  } @else {
                    {{ initials(p) }}
                  }
                </div>
                <div class="body">
                  <div class="name">
                    {{ p.first_name }} {{ p.last_name }}
                    @if (!p.is_active) {
                      <span class="badge inactive">Inactive</span>
                    }
                  </div>
                  <div class="email">{{ p.email }}</div>
                  <div class="meta">
                    @if (p.phone) { <span>{{ p.phone }}</span> }
                    <span class="dot">·</span>
                    <span>Joined {{ p.created_at | date:'MMM y' }}</span>
                  </div>
                </div>
                <ion-icon name="chevron-forward-outline" class="chev"></ion-icon>
              </button>
            }
          </div>
        }

      </div>
    </ion-content>

    <!-- PATIENT DETAIL MODAL -->
    <ion-modal [isOpen]="modalOpen()" (didDismiss)="closeModal()">
      <ng-template>
        <ion-header class="ion-no-border">
          <ion-toolbar class="modal-bar">
            <ion-title>Patient Details</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeModal()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="modal-bg">
          @if (detailLoading()) {
            <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
          } @else if (selectedPatient(); as p) {

            <div class="profile-head">
              <div class="profile-avatar">
                @if (p.profile_image) {
                  <img [src]="p.profile_image" alt="" />
                } @else {
                  {{ initials(p) }}
                }
              </div>
              <div class="profile-name">{{ p.first_name }} {{ p.last_name }}</div>
              <div class="profile-contact">{{ p.email }}</div>
              @if (p.phone) {
                <div class="profile-contact">{{ p.phone }}</div>
              }
              @if (p.address) {
                <div class="profile-contact small">{{ p.address }}</div>
              }
            </div>

            <div class="summary-row">
              <div class="summary-cell">
                <div class="summary-value">{{ summary()?.total ?? 0 }}</div>
                <div class="summary-label">Total</div>
              </div>
              <div class="summary-cell">
                <div class="summary-value">{{ summary()?.completed ?? 0 }}</div>
                <div class="summary-label">Completed</div>
              </div>
              <div class="summary-cell">
                <div class="summary-value">{{ summary()?.upcoming ?? 0 }}</div>
                <div class="summary-label">Upcoming</div>
              </div>
            </div>

            <div class="history-section">
              <h3 class="history-title">Treatment History</h3>

              @if (!history().length) {
                <p class="empty">No appointments yet.</p>
              } @else {
                <div class="history-list">
                  @for (a of history(); track a.id) {
                    <div class="appt-card" [attr.data-status]="a.status">
                      <div class="appt-head">
                        <div>
                          <div class="appt-date">{{ a.appointment_date | date:'MMM d, y · h:mm a' }}</div>
                          @if (a.dentist; as d) {
                            <div class="appt-dentist">Dr. {{ d.first_name }} {{ d.last_name }}</div>
                          }
                        </div>
                        <span class="status-chip" [attr.data-status]="a.status">{{ a.status }}</span>
                      </div>

                      <div class="appt-services">
                        @for (item of a.items; track item.id) {
                          <span class="service-chip">{{ item.service?.name || 'Service' }}</span>
                        }
                      </div>

                      @if (a.notes) {
                        <div class="note-row">
                          <div class="note-label">Patient note</div>
                          <div class="note-text">{{ a.notes }}</div>
                        </div>
                      }

                      @if (a.treatment_notes) {
                        <div class="note-row treatment">
                          <div class="note-label">Treatment notes</div>
                          <div class="note-text">{{ a.treatment_notes }}</div>
                        </div>
                      }

                      @if (canEditNotes() && a.status === 'completed') {
                        <div class="appt-actions">
                          <button
                            type="button"
                            class="action-btn"
                            (click)="editNotes(a)">
                            <ion-icon name="create-outline"></ion-icon>
                            <span>{{ a.treatment_notes ? 'Edit treatment notes' : 'Add treatment notes' }}</span>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

          }
        </ion-content>
      </ng-template>
    </ion-modal>
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

    .patient-card {
      display: flex; align-items: center; gap: 14px;
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      border: 0;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, transform 0.15s;
      width: 100%;
      font-family: inherit;
    }
    .patient-card:hover { background: #f7fafc; transform: translateY(-1px); }

    .avatar {
      width: 46px; height: 46px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 15px; font-weight: 700;
      background: #d9f0fb; color: #1a5a7a;
      flex: 0 0 auto;
      overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }

    .body { flex: 1; min-width: 0; }
    .name {
      font-size: 14px; font-weight: 700; color: #0A1E29;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .email {
      font-size: 12px; color: #7a8a97; margin: 2px 0 4px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .meta {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: #7a8a97; flex-wrap: wrap;
    }
    .dot { opacity: 0.5; }
    .badge.inactive {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 8px; border-radius: 9999px;
      background: #ffd7d7; color: #8a1a1a;
    }
    .chev { color: #b0bcc6; font-size: 18px; flex: 0 0 auto; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    /* MODAL */
    .modal-bar { --background: #0A1E29; --color: #ffffff; }
    .modal-bar ion-title { color: #ffffff; font-weight: 600; }
    .modal-bar ion-button { --color: #93D5ED; }
    .modal-bg { --background: #ffffff; --color: #0A1E29; }

    .profile-head {
      text-align: center;
      padding: 28px 20px 20px;
      background: #f2f8fc;
      border-radius: 0 0 24px 24px;
    }
    .profile-avatar {
      width: 84px; height: 84px; border-radius: 50%;
      background: #d9f0fb; color: #1a5a7a;
      display: grid; place-items: center;
      font-size: 26px; font-weight: 700;
      margin: 0 auto 12px;
      overflow: hidden;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(10,30,41,0.08);
    }
    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-name { font-size: 18px; font-weight: 700; color: #0A1E29; }
    .profile-contact { font-size: 13px; color: #4a6272; margin-top: 4px; }
    .profile-contact.small { font-size: 12px; color: #7a8a97; }

    .summary-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
      padding: 20px;
    }
    .summary-cell {
      background: #f7fafc;
      border-radius: 14px;
      padding: 12px;
      text-align: center;
    }
    .summary-value { font-size: 20px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .summary-label {
      font-size: 10px; font-weight: 600; color: #7a8a97;
      text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;
    }

    .history-section { padding: 8px 20px 32px; }
    .history-title {
      font-size: 14px; font-weight: 700; color: #0A1E29;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin: 12px 0 12px;
    }

    .history-list { display: flex; flex-direction: column; gap: 12px; }

    .appt-card {
      background: #ffffff;
      border: 1px solid #e6eef5;
      border-left: 4px solid #e6eef5;
      border-radius: 14px;
      padding: 14px;
    }
    .appt-card[data-status="completed"] { border-left-color: #4EBE7D; }
    .appt-card[data-status="cancelled"] { border-left-color: #e57373; opacity: 0.7; }
    .appt-card[data-status="no-show"]   { border-left-color: #e57373; opacity: 0.7; }
    .appt-card[data-status="pending"]   { border-left-color: #f0c14b; }
    .appt-card[data-status="confirmed"] { border-left-color: #93D5ED; }
    .appt-card[data-status="in-progress"] { border-left-color: #5b8def; }

    .appt-head {
      display: flex; justify-content: space-between;
      align-items: flex-start; gap: 8px; margin-bottom: 10px;
    }
    .appt-date { font-size: 14px; font-weight: 700; color: #0A1E29; }
    .appt-dentist { font-size: 12px; color: #7a8a97; margin-top: 2px; }
    .status-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 3px 9px; border-radius: 9999px;
      background: #eef3f8; color: #4a6272; white-space: nowrap;
    }
    .status-chip[data-status="pending"]     { background: #fff4d6; color: #8a6d00; }
    .status-chip[data-status="confirmed"]   { background: #d7f0e0; color: #1e6b3d; }
    .status-chip[data-status="in-progress"] { background: #d6e8ff; color: #1a4f8a; }
    .status-chip[data-status="completed"]   { background: #d9f0fb; color: #0A1E29; }
    .status-chip[data-status="cancelled"]   { background: #ffd7d7; color: #8a1a1a; }
    .status-chip[data-status="no-show"]     { background: #ffd7d7; color: #8a1a1a; }

    .appt-services { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .service-chip {
      font-size: 11px; padding: 3px 10px; border-radius: 9999px;
      background: #e6f4fb; color: #1a5a7a; font-weight: 600;
    }

    .note-row {
      background: #f7fafc;
      border-radius: 10px;
      padding: 10px 12px;
      margin-top: 8px;
    }
    .note-row.treatment {
      background: #f0f9f4;
      border-left: 3px solid #4EBE7D;
    }
    .note-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #7a8a97; margin-bottom: 4px;
    }
    .note-row.treatment .note-label { color: #1e6b3d; }
    .note-text { font-size: 13px; color: #0A1E29; line-height: 1.4; }

    .appt-actions {
      margin-top: 12px;
      display: flex;
      justify-content: flex-end;
    }
    .action-btn {
      display: flex; align-items: center; gap: 6px;
      background: transparent;
      border: 1px solid #4EBE7D;
      border-radius: 9999px;
      color: #1e6b3d;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 14px;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }
    .action-btn:hover { background: #f0f9f4; }
    .action-btn ion-icon { font-size: 16px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .list { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminPatientsPage implements OnInit {
  patients = signal<PatientListItem[]>([]);
  loading = signal(true);
  searchQuery = '';

  modalOpen = signal(false);
  detailLoading = signal(false);
  selectedPatient = signal<PatientListItem | null>(null);
  summary = signal<PatientSummary | null>(null);
  history = signal<PatientHistoryAppointment[]>([]);

  canEditNotes = () => {
    const role = this.adminAuth.user()?.role;
    return role === 'admin' || role === 'dentist';
  };

  private searchTimer?: any;

  constructor(
    private api: AdminApi,
    private adminAuth: AdminAuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.listPatients(this.searchQuery.trim() || undefined);
      this.patients.set(list);
    } catch {
      this.patients.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 250);
  }

  initials(p: PatientListItem): string {
    return `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase();
  }

  async openPatient(p: PatientListItem) {
    this.selectedPatient.set(p);
    this.summary.set(null);
    this.history.set([]);
    this.detailLoading.set(true);
    this.modalOpen.set(true);

    try {
      const [detail, hist] = await Promise.all([
        this.api.getPatient(p.id),
        this.api.getPatientHistory(p.id)
      ]);
      this.selectedPatient.set(detail.patient);
      this.summary.set(detail.summary);
      this.history.set(hist);
    } catch {
      // leave as empty
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  async editNotes(appt: PatientHistoryAppointment) {
    const alert = await this.alertCtrl.create({
      header: appt.treatment_notes ? 'Edit treatment notes' : 'Add treatment notes',
      subHeader: `${new Date(appt.appointment_date).toLocaleDateString()} — ${appt.items.map(i => i.service?.name).filter(Boolean).join(', ')}`,
      inputs: [
        {
          name: 'treatment_notes',
          type: 'textarea',
          placeholder: 'Describe the treatment performed, medications, follow-up...',
          value: appt.treatment_notes ?? '',
          attributes: { rows: 5 }
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Save', role: 'confirm' }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role !== 'confirm' || !result.data) return;

    const notes = (result.data.values?.treatment_notes ?? '').trim();

    try {
      const updated = await this.api.addTreatmentNotes(appt.id, notes);
      this.history.update(list =>
        list.map(x => x.id === updated.id ? { ...x, treatment_notes: updated.treatment_notes } : x)
      );
      const t = await this.toastCtrl.create({
        message: notes ? 'Treatment notes saved' : 'Treatment notes cleared',
        duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed to save', duration: 2000, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }
}