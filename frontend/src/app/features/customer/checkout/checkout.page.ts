import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonSpinner, IonItem, IonInput
} from '@ionic/angular/standalone';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
    IonContent, IonSpinner, IonItem, IonInput
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/appointments" text=""></ion-back-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (appt(); as a) {

        <section class="head">
          <h1>Complete your payment</h1>
          <p class="sub">Secure checkout — this is a demo, no real charge is made.</p>
        </section>

        <!-- Order summary -->
        <section class="summary">
          <div class="summary-label">Your appointment</div>
          <div class="summary-date">{{ a.appointment_date | date:'EEEE, MMM d · h:mm a' }}</div>

          <div class="summary-items">
            @for (item of a.items; track item.id) {
              <div class="item-row">
                <span>{{ item.service?.name || 'Service' }}</span>
                <span>₱{{ item.price }}</span>
              </div>
            }
          </div>

          <div class="total-row">
            <span>Total</span>
            <span class="total-amount">₱{{ a.total_amount }}</span>
          </div>
        </section>

        <!-- Card form -->
        <section class="block">
          <h2>Card details</h2>

          <div class="card-preview">
            <div class="card-chip"></div>
            <div class="card-number">{{ formatDisplay(cardNumber) || '•••• •••• •••• ••••' }}</div>
            <div class="card-meta">
              <div>
                <div class="card-label">Cardholder</div>
                <div class="card-value">{{ cardName || 'YOUR NAME' }}</div>
              </div>
              <div>
                <div class="card-label">Expires</div>
                <div class="card-value">{{ expiry || 'MM/YY' }}</div>
              </div>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Card number <span class="req">*</span></label>
            <ion-item lines="none" class="field" [class.invalid]="submitted() && !validCard">
              <ion-icon slot="start" name="card-outline" class="field-icon"></ion-icon>
              <ion-input
                inputmode="numeric"
                placeholder="4242 4242 4242 4242"
                [(ngModel)]="cardNumber"
                (ngModelChange)="onCardChange($event)"
                [disabled]="processing()">
              </ion-input>
            </ion-item>
          </div>

          <div class="field-group">
            <label class="field-label">Cardholder name <span class="req">*</span></label>
            <ion-item lines="none" class="field" [class.invalid]="submitted() && !cardName.trim()">
              <ion-icon slot="start" name="person-outline" class="field-icon"></ion-icon>
              <ion-input
                placeholder="Name on card"
                [(ngModel)]="cardName"
                [disabled]="processing()">
              </ion-input>
            </ion-item>
          </div>

          <div class="grid-2">
            <div class="field-group">
              <label class="field-label">Expiry <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="submitted() && !validExpiry">
                <ion-input
                  inputmode="numeric"
                  placeholder="MM/YY"
                  [(ngModel)]="expiry"
                  (ngModelChange)="onExpiryChange($event)"
                  [disabled]="processing()">
                </ion-input>
              </ion-item>
            </div>
            <div class="field-group">
              <label class="field-label">CVC <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="submitted() && !validCvc">
                <ion-input
                  inputmode="numeric"
                  placeholder="123"
                  [(ngModel)]="cvc"
                  (ngModelChange)="onCvcChange($event)"
                  [disabled]="processing()">
                </ion-input>
              </ion-item>
            </div>
          </div>

          <div class="secure-row">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <span>Demo checkout — no real card is charged.</span>
          </div>

          @if (error()) {
            <div class="err-box">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <ion-button
            expand="block"
            class="pay-btn"
            (click)="pay()"
            [disabled]="processing()">
            @if (processing()) {
              <ion-spinner name="crescent"></ion-spinner>
              <span style="margin-left: 8px;">Processing...</span>
            } @else {
              <ion-icon slot="start" name="lock-closed-outline"></ion-icon>
              Pay ₱{{ a.total_amount }}
            }
          </ion-button>

          <button type="button" class="later-btn" (click)="payLater()" [disabled]="processing()">
            Pay at the clinic instead
          </button>
        </section>

      } @else {
        <p class="err">Appointment not found.</p>
      }
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .head { padding: 20px 20px 8px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #0A1E29; letter-spacing: -0.5px; }
    .sub { color: #7a8a97; font-size: 13px; margin: 0; }

    .summary {
      background: #f2f8fc;
      border-radius: 16px;
      padding: 16px 18px;
      margin: 16px 20px 24px;
    }
    .summary-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #7a8a97;
    }
    .summary-date {
      font-size: 15px; font-weight: 700; color: #0A1E29;
      margin: 4px 0 14px;
    }
    .summary-items {
      display: flex; flex-direction: column; gap: 8px;
      padding: 12px 0;
      border-top: 1px solid #e6eef5;
      border-bottom: 1px solid #e6eef5;
    }
    .item-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #4a6272;
    }
    .total-row {
      display: flex; justify-content: space-between;
      align-items: baseline;
      padding-top: 12px;
      font-size: 14px;
      font-weight: 700;
      color: #0A1E29;
    }
    .total-amount {
      font-size: 20px;
      font-weight: 800;
    }

    .block { padding: 0 20px 40px; }
    h2 { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 12px; }

    /* CARD PREVIEW */
    .card-preview {
      position: relative;
      background: linear-gradient(135deg, #0A1E29 0%, #1a3a52 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 20px 22px;
      margin-bottom: 22px;
      box-shadow: 0 12px 32px rgba(10,30,41,0.25);
      overflow: hidden;
    }
    .card-preview::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -20%;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(78,190,125,0.35), transparent 70%);
      pointer-events: none;
    }
    .card-chip {
      width: 38px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #d4b968 0%, #f0d98a 100%);
      margin-bottom: 20px;
    }
    .card-number {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      letter-spacing: 2px;
      margin-bottom: 18px;
      font-weight: 700;
    }
    .card-meta {
      display: flex; gap: 32px;
      font-size: 11px;
    }
    .card-label {
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.65;
      margin-bottom: 3px;
    }
    .card-value {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* FIELDS */
    .field-group { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px;
    }
    .req { color: #e74c3c; margin-left: 2px; }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 14px;
      --color: #0A1E29;
      --min-height: 48px;
      border-radius: 14px;
      border: 1px solid #e6eef5;
      transition: border-color 0.15s, background 0.15s;
    }
    .field:focus-within { border-color: #4EBE7D; background: #ffffff; }
    .field.invalid {
      --background: #fff5f5;
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 4px rgba(231,76,60,0.14);
    }
    .field-icon {
      color: #7a8a97;
      font-size: 18px;
      margin-right: 8px;
    }
    .field ion-input {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 14px;
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .secure-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #7a8a97;
      background: #f0f9f4;
      padding: 10px 14px;
      border-radius: 12px;
      margin: 18px 0 8px;
    }
    .secure-row ion-icon { color: #4EBE7D; font-size: 16px; }

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      color: #8a1a1a; border-radius: 12px;
      font-size: 13px; font-weight: 600;
      margin: 12px 0;
    }
    .err-box ion-icon { font-size: 18px; }

    .pay-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-disabled: #ffffff;
      height: 52px;
      font-weight: 700;
      font-size: 15px;
      margin-top: 12px;
      --box-shadow: 0 8px 24px rgba(10,30,41,0.18);
    }
    .pay-btn::part(native) { color: #ffffff; }

    .later-btn {
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 12px;
      background: transparent;
      border: 0;
      color: #7a8a97;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      text-decoration: underline;
    }
    .later-btn:hover { color: #0A1E29; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .err { text-align: center; color: #7a8a97; padding: 40px; }
  `]
})
export class CheckoutPage implements OnInit {
  appt = signal<Appointment | null>(null);
  loading = signal(true);
  processing = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  // Form fields
  cardNumber = '';
  cardName = '';
  expiry = '';
  cvc = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AppointmentsApi
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    try {
      const a = await this.api.getOne(id);
      this.appt.set(a);
    } catch {
      this.appt.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  // ---------- INPUT FORMATTERS ----------

  onCardChange(value: string) {
    const digits = String(value).replace(/\D/g, '').slice(0, 19);
    const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber = grouped;
  }

  onExpiryChange(value: string) {
    const digits = String(value).replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) this.expiry = digits;
    else this.expiry = digits.slice(0, 2) + '/' + digits.slice(2);
  }

  onCvcChange(value: string) {
    this.cvc = String(value).replace(/\D/g, '').slice(0, 4);
  }

  // ---------- VALIDATION ----------

  get validCard(): boolean {
    const digits = this.cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(digits);
  }
  get validExpiry(): boolean {
    if (!/^\d{2}\/\d{2}$/.test(this.expiry)) return false;
    const mm = Number(this.expiry.slice(0, 2));
    return mm >= 1 && mm <= 12;
  }
  get validCvc(): boolean {
    return /^\d{3,4}$/.test(this.cvc);
  }

  formatDisplay(num: string): string {
    return num;
  }

  // ---------- ACTIONS ----------

  async pay() {
    this.submitted.set(true);
    this.error.set(null);

    const a = this.appt();
    if (!a) return;

    if (!this.validCard) { this.error.set('Enter a valid card number'); return; }
    if (!this.cardName.trim()) { this.error.set('Enter the cardholder name'); return; }
    if (!this.validExpiry) { this.error.set('Enter a valid expiry (MM/YY)'); return; }
    if (!this.validCvc) { this.error.set('Enter a valid CVC'); return; }

    this.processing.set(true);
    try {
      const res = await this.api.pay(a.id, {
        card_number: this.cardNumber.replace(/\s/g, ''),
        card_name: this.cardName.trim(),
        expiry: this.expiry,
        cvc: this.cvc
      });

      this.router.navigateByUrl(
        `/app/thank-you?appt=${a.id}&txn=${res.transaction_id}`,
        { replaceUrl: true }
      );
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Payment failed. Try again.');
    } finally {
      this.processing.set(false);
    }
  }

  payLater() {
    this.router.navigateByUrl('/app/appointments', { replaceUrl: true });
  }
}