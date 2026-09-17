import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { AdminApi, AdminAppointment } from '../../../core/admin-api.service';
import { AdminAuthService } from '../../../core/admin-auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-appointments',
  host: { 'class': 'ion-page' },
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Appointments</h1>
            <p class="sub">Manage bookings and update statuses</p>
          </div>
          <div class="count-pill">{{ appointments().length }} total</div>
        </div>

        <div class="filters">
          @for (s of statuses; track s.value) {
            <button
              type="button"
              class="chip-filter"
              [class.active]="activeStatus === s.value"
              (click)="setStatus(s.value)">
              {{ s.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!appointments().length) {
          <p class="empty">No appointments match your filters.</p>
        } @else {
          <div class="list">
            @for (a of appointments(); track a.id) {
              <div class="appt-card" [attr.data-status]="a.status">

                <div class="appt-top">
                  <div class="date-block">
                    <span class="dow">{{ a.appointment_date | date:'EEE' }}</span>
                    <span class="day">{{ a.appointment_date | date:'d' }}</span>
                    <span class="mon">{{ a.appointment_date | date:'MMM' }}</span>
                  </div>

                  <div class="appt-body">
                    <div class="appt-time">{{ a.appointment_date | date:'h:mm a' }}</div>
                    @if (a.patient; as p) {
                      <div class="appt-patient">{{ p.first_name }} {{ p.last_name }}</div>
                      <div class="appt-contact">{{ p.phone || p.email }}</div>
                    } @else {
                      <div class="appt-patient muted">Deleted user</div>
                    }
                    <div class="appt-services">
                      @for (item of a.items; track item.id) {
                        <span class="service-chip">{{ item.service?.name || 'Service' }}</span>
                      }
                    </div>
                    @if (a.notes) {
                      <div class="appt-notes">"{{ a.notes }}"</div>
                    }
                    @if (a.treatment_notes) {
                      <div class="appt-notes treatment">
                        <strong>Treatment:</strong> {{ a.treatment_notes }}
                      </div>
                    }
                  </div>

                  <div class="appt-right">
                    <span class="status-chip" [attr.data-status]="a.status">{{ a.status }}</span>
                    <div class="amount">₱{{ a.total_amount }}</div>
                    <div class="payment">{{ a.payment_status }}</div>
                  </div>
                </div>

                <div class="appt-actions">
                  @for (s of nextStatuses(a.status); track s.value) {
                    <button
                      type="button"
                      class="action-btn"
                      [attr.data-variant]="s.variant"
                      (click)="changeStatus(a, s.value)">
                      {{ s.label }}
                    </button>
                  }
                  @if (canEditNotes() && a.status === 'completed') {
                    <button
                      type="button"
                      class="action-btn notes-btn"
                      (click)="editNotes(a)">
                      <ion-icon name="create-outline"></ion-icon>
                      <span>{{ a.treatment_notes ? 'Edit notes' : 'Add treatment notes' }}</span>
                    </button>
                  }
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
      gap: 16px; margin-bottom: 20px;
    }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }
    .count-pill {
      background: #e6f4fb; color: #0A1E29;
      padding: 6px 14px; border-radius: 9999px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
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

    .list { display: flex; flex-direction: column; gap: 12px; }

    .appt-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      border-left: 4px solid #e6eef5;
    }
    .appt-card[data-status="pending"]     { border-left-color: #f0c14b; }
    .appt-card[data-status="confirmed"]   { border-left-color: #4EBE7D; }
    .appt-card[data-status="in-progress"] { border-left-color: #5b8def; }
    .appt-card[data-status="completed"]   { border-left-color: #93D5ED; }
    .appt-card[data-status="cancelled"]   { border-left-color: #e57373; opacity: 0.7; }
    .appt-card[data-status="no-show"]     { border-left-color: #e57373; opacity: 0.7; }

    .appt-top { display: flex; gap: 14px; align-items: flex-start; }

    .date-block {
      width: 56px; height: 62px; border-radius: 12px;
      background: #f2f8fc;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      flex: 0 0 auto;
    }
    .dow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #7a8a97; }
    .day { font-size: 22px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .mon { font-size: 10px; text-transform: uppercase; color: #4EBE7D; font-weight: 600; }

    .appt-body { flex: 1; min-width: 0; }
    .appt-time { font-size: 15px; font-weight: 700; color: #0A1E29; }
    .appt-patient { font-size: 13px; color: #0A1E29; font-weight: 600; margin-top: 2px; }
    .appt-patient.muted { color: #7a8a97; font-style: italic; font-weight: 400; }
    .appt-contact { font-size: 11px; color: #7a8a97; margin-top: 1px; }
    .appt-services { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .service-chip {
      font-size: 11px; padding: 3px 10px; border-radius: 9999px;
      background: #e6f4fb; color: #1a5a7a; font-weight: 600;
    }
    .appt-notes {
      font-size: 12px; color: #4a6272; font-style: italic;
      margin-top: 8px; padding: 8px 12px;
      background: #f7fafc; border-radius: 10px;
    }
    .appt-notes.treatment {
      background: #f0f9f4;
      border-left: 3px solid #4EBE7D;
      font-style: normal;
      color: #0A1E29;
    }
    .appt-notes.treatment strong { color: #1e6b3d; }

    .appt-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex: 0 0 auto; }
    .status-chip {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 4px 10px; border-radius: 9999px;
      background: #eef3f8; color: #4a6272;
    }
    .status-chip[data-status="pending"]     { background: #fff4d6; color: #8a6d00; }
    .status-chip[data-status="confirmed"]   { background: #d7f0e0; color: #1e6b3d; }
    .status-chip[data-status="in-progress"] { background: #d6e8ff; color: #1a4f8a; }
    .status-chip[data-status="completed"]   { background: #d9f0fb; color: #0A1E29; }
    .status-chip[data-status="cancelled"]   { background: #ffd7d7; color: #8a1a1a; }
    .status-chip[data-status="no-show"]     { background: #ffd7d7; color: #8a1a1a; }

    .amount { font-size: 14px; font-weight: 700; color: #0A1E29; }
    .payment { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #7a8a97; }

    .appt-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
      margin-top: 14px; padding-top: 12px;
      border-top: 1px solid #eef3f8;
    }
    .action-btn {
      padding: 7px 14px;
      border-radius: 9999px;
      border: 1px solid #e6eef5;
      background: #ffffff;
      color: #0A1E29;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .action-btn:hover { background: #f2f8fc; }
    .action-btn[data-variant="primary"] {
      background: #0A1E29; color: #ffffff; border-color: #0A1E29;
    }
    .action-btn[data-variant="primary"]:hover { background: #142635; }
    .action-btn[data-variant="success"] {
      background: #4EBE7D; color: #ffffff; border-color: #4EBE7D;
    }
    .action-btn[data-variant="success"]:hover { background: #3ea66b; }
    .action-btn[data-variant="danger"] {
      border-color: #ffd7d7; color: #c0392b;
    }
    .action-btn[data-variant="danger"]:hover { background: #ffe0e0; }

    .notes-btn {
      border-color: #4EBE7D;
      color: #1e6b3d;
    }
    .notes-btn:hover { background: #f0f9f4; }
    .notes-btn ion-icon { font-size: 14px; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
    }
  `]
})
export class AdminAppointmentsPage implements OnInit {
  appointments = signal<AdminAppointment[]>([]);
  loading = signal(true);
  activeStatus = '';

  statuses = [
    { label: 'All',         value: '' },
    { label: 'Pending',     value: 'pending' },
    { label: 'Confirmed',   value: 'confirmed' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed',   value: 'completed' },
    { label: 'Cancelled',   value: 'cancelled' }
  ];

  canEditNotes = () => {
    const role = this.adminAuth.user()?.role;
    return role === 'admin' || role === 'dentist';
  };

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
      const list = await this.api.listAppointments({
        status: this.activeStatus || undefined
      });
      this.appointments.set(list);
    } catch {
      this.appointments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  setStatus(s: string) {
    this.activeStatus = s;
    this.load();
  }

  nextStatuses(current: string): { label: string; value: string; variant: string }[] {
    switch (current) {
      case 'pending':
        return [
          { label: 'Confirm',  value: 'confirmed',   variant: 'success' },
          { label: 'Cancel',   value: 'cancelled',   variant: 'danger' }
        ];
      case 'confirmed':
        return [
          { label: 'Start',    value: 'in-progress', variant: 'primary' },
          { label: 'No Show',  value: 'no-show',     variant: 'danger' }
        ];
      case 'in-progress':
        return [
          { label: 'Complete', value: 'completed',   variant: 'success' },
          { label: 'Cancel',   value: 'cancelled',   variant: 'danger' }
        ];
      default:
        return [];
    }
  }

  async changeStatus(a: AdminAppointment, status: string) {
    const label = this.nextStatuses(a.status).find(s => s.value === status)?.label || 'Update';
    const confirm = await this.alertCtrl.create({
      header: `${label} appointment?`,
      message: `${a.patient?.first_name ?? 'Patient'} ${a.patient?.last_name ?? ''} — ${new Date(a.appointment_date).toLocaleString()}`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: label, role: 'confirm' }
      ]
    });
    await confirm.present();
    const res = await confirm.onDidDismiss();
    if (res.role !== 'confirm') return;

    try {
      const updated = await this.api.updateAppointmentStatus(a.id, status);
      this.appointments.update(list =>
        list.map(x => x.id === updated.id ? { ...x, status: updated.status as any } : x)
      );
      const t = await this.toastCtrl.create({
        message: `Marked as ${status}`, duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Update failed', duration: 2000, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }

  async editNotes(a: AdminAppointment) {
    const alert = await this.alertCtrl.create({
      header: a.treatment_notes ? 'Edit treatment notes' : 'Add treatment notes',
      subHeader: `${new Date(a.appointment_date).toLocaleDateString()} — ${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`,
      inputs: [
        {
          name: 'treatment_notes',
          type: 'textarea',
          placeholder: 'Describe the treatment performed, medications, follow-up...',
          value: a.treatment_notes ?? '',
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
      const updated = await this.api.addTreatmentNotes(a.id, notes);
      this.appointments.update(list =>
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