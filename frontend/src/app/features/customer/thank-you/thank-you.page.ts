import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';

@Component({
  standalone: true,
  selector: 'app-thank-you',
  imports: [CommonModule, RouterLink, IonContent, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-content class="bg">
      <div class="wrap">
        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else {
          <div class="check-circle">
            <ion-icon name="checkmark"></ion-icon>
          </div>

          <h1>Payment successful</h1>
          <p class="sub">Thanks! Your appointment is confirmed and paid.</p>

          @if (appt(); as a) {
            <div class="summary">
              <div class="summary-row">
                <span class="label">Amount paid</span>
                <span class="value">₱{{ a.total_amount }}</span>
              </div>
              <div class="summary-row">
                <span class="label">Appointment</span>
                <span class="value">{{ a.appointment_date | date:'MMM d, y · h:mm a' }}</span>
              </div>
              @if (txnId()) {
                <div class="summary-row">
                  <span class="label">Transaction ID</span>
                  <span class="value mono">{{ txnId() }}</span>
                </div>
              }
            </div>

            <p class="note">
              We've sent a confirmation to your notifications. See you soon!
            </p>
          }

          <ion-button expand="block" class="btn-primary" routerLink="/app/appointments">
            <ion-icon slot="start" name="calendar-outline"></ion-icon>
            View My Appointments
          </ion-button>

          <ion-button expand="block" fill="outline" class="btn-outline" routerLink="/app/services">
            Book another service
          </ion-button>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .bg { --background: #ffffff; }
    .wrap {
      max-width: 480px;
      margin: 8vh auto 0;
      padding: 0 24px 40px;
      text-align: center;
    }

    .check-circle {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: #d7f0e0;
      color: #1e6b3d;
      display: grid; place-items: center;
      font-size: 52px;
      margin: 0 auto 24px;
      box-shadow: 0 8px 32px rgba(30,107,61,0.18);
    }
    .check-circle ion-icon {
      animation: pop 0.4s ease-out;
    }
    @keyframes pop {
      from { transform: scale(0); }
      50%  { transform: scale(1.15); }
      to   { transform: scale(1); }
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0A1E29;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }
    .sub { color: #7a8a97; font-size: 14px; margin: 0 0 28px; }

    .summary {
      background: #f2f8fc;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 22px;
      text-align: left;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #e6eef5;
    }
    .summary-row:last-child { border-bottom: 0; }
    .label { font-size: 12px; color: #7a8a97; font-weight: 600; }
    .value { font-size: 14px; color: #0A1E29; font-weight: 700; }
    .mono { font-family: 'Courier New', monospace; font-size: 12px; }

    .note {
      font-size: 13px;
      color: #4a6272;
      line-height: 1.5;
      margin: 0 0 28px;
    }

    .btn-primary {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 50px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .btn-outline {
      --border-color: #0A1E29;
      --color: #0A1E29;
      --border-radius: 9999px;
      --border-width: 1.5px;
      height: 50px;
      font-weight: 700;
    }

    .loading { display: grid; place-items: center; padding: 60px; }
  `]
})
export class ThankYouPage implements OnInit {
  appt = signal<Appointment | null>(null);
  txnId = signal<string>('');
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private api: AppointmentsApi
  ) {}

  async ngOnInit() {
    const apptId = this.route.snapshot.queryParamMap.get('appt') || '';
    const txn = this.route.snapshot.queryParamMap.get('txn') || '';
    this.txnId.set(txn);

    if (!apptId) { this.loading.set(false); return; }

    try {
      const a = await this.api.getOne(apptId);
      this.appt.set(a);
    } catch {
      this.appt.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}