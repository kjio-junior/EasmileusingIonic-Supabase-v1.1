import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonSpinner, IonItem, IonInput
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';
import { AuthService } from '../../../core/auth.service';

type PaymentMethod = 'card' | 'gcash' | 'qr' | 'cash';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [
    CommonModule, FormsModule, RouterLink,
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
          <p class="sub">Demo checkout — no real money is transferred.</p>
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

        <!-- Method selector -->
        <section class="block">
          <h2>Payment method</h2>
          <div class="method-grid">
            @for (m of methods; track m.value) {
              <button
                type="button"
                class="method-card"
                [class.active]="method === m.value"
                (click)="method = m.value"
                [disabled]="processing()">
                <div class="method-icon" [attr.data-method]="m.value">
                  <ion-icon [name]="m.icon"></ion-icon>
                </div>
                <div class="method-label">{{ m.label }}</div>
              </button>
            }
          </div>
        </section>

        <!-- ============ CARD ============ -->
        @if (method === 'card') {
          <section class="block">
            <div class="card-preview">
              <div class="card-chip"></div>
              <div class="card-number">{{ cardNumber || '•••• •••• •••• ••••' }}</div>
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
                <ion-input placeholder="Name on card" [(ngModel)]="cardName" [disabled]="processing()"></ion-input>
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
          </section>
        }

        <!-- ============ GCASH ============ -->
        @if (method === 'gcash') {
          <section class="block">
            <div class="gcash-card">
              <div class="gcash-head">
                <div class="gcash-logo">G</div>
                <div>
                  <div class="gcash-brand">GCash</div>
                  <div class="gcash-sub">Send to this number</div>
                </div>
              </div>

              <div class="gcash-number">{{ gcashNumber }}</div>
              <div class="gcash-name">EAsmile Dental Clinic</div>

              <div class="gcash-amount-row">
                <span>Amount to send</span>
                <span class="gcash-amount">₱{{ a.total_amount }}</span>
              </div>

              <div class="gcash-ref">
                <span class="ref-label">Reference</span>
                <span class="ref-value">{{ referenceCode }}</span>
              </div>
            </div>

            <div class="instruction-box">
              <p><strong>Steps:</strong></p>
              <ol>
                <li>Open your GCash app</li>
                <li>Send <strong>₱{{ a.total_amount }}</strong> to <strong>{{ gcashNumber }}</strong></li>
                <li>Use <strong>{{ referenceCode }}</strong> as the reference</li>
                <li>Come back here and tap Confirm</li>
              </ol>
            </div>

            <p class="demo-note">
              <ion-icon name="information-circle-outline"></ion-icon>
              In a real deployment, this would verify against the GCash API.
            </p>
          </section>
        }

        <!-- ============ QR ============ -->
        @if (method === 'qr') {
          <section class="block">
            <div class="qr-wrap">
              <div class="qr-box">
                <img
                  [src]="qrCodeUrl()"
                  alt="Payment QR code"
                  class="qr-img" />
              </div>
              <p class="qr-caption">Scan this QR code with your banking app</p>

              <div class="qr-details">
                <div class="qr-row">
                  <span>Amount</span>
                  <strong>₱{{ a.total_amount }}</strong>
                </div>
                <div class="qr-row">
                  <span>Payee</span>
                  <strong>EAsmile Dental Clinic</strong>
                </div>
                <div class="qr-row">
                  <span>Reference</span>
                  <strong>{{ referenceCode }}</strong>
                </div>
              </div>
            </div>

            <p class="demo-note">
              <ion-icon name="information-circle-outline"></ion-icon>
              This is a demo QR. A real deployment would encode your bank's payment URI.
            </p>
          </section>
        }

        <!-- ============ CASH AT CLINIC ============ -->
        @if (method === 'cash') {
          <section class="block">
            <div class="cash-card">
              <div class="cash-icon"><ion-icon name="storefront-outline"></ion-icon></div>
              <h3>Pay at the clinic</h3>
              <p>
                You can settle your payment in person when you arrive for your appointment.
                We accept cash, cards, and GCash at the front desk.
              </p>
              <div class="cash-info">
                <div class="cash-row">
                  <span>Amount due</span>
                  <strong>₱{{ a.total_amount }}</strong>
                </div>
                <div class="cash-row">
                  <span>Appointment</span>
                  <strong>{{ a.appointment_date | date:'MMM d, h:mm a' }}</strong>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- Error -->
        @if (error()) {
          <div class="err-box">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>{{ error() }}</span>
          </div>
        }

                <!-- CTA -->
        <section class="cta-block">
          @if (method === 'cash') {
            <ion-button expand="block" class="pay-btn" (click)="confirmCash()" [disabled]="processing()">
              @if (processing()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
                I'll pay at the clinic
              }
            </ion-button>
          } @else if (method === 'card') {
            <ion-button expand="block" class="pay-btn" (click)="pay()" [disabled]="processing()">
              @if (processing()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                <ion-icon slot="start" name="lock-closed-outline"></ion-icon>
                Pay ₱{{ a.total_amount }}
              }
            </ion-button>
          } @else {
            <ion-button expand="block" class="pay-btn" (click)="confirm()" [disabled]="processing()">
              @if (processing()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
                I've sent the payment
              }
            </ion-button>
          }

          <ion-button expand="block" fill="clear" class="cancel-btn" routerLink="/app/appointments" [disabled]="processing()">
            Cancel
          </ion-button>
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
      display: flex; justify-content: space-between; align-items: baseline;
      padding-top: 12px; font-size: 14px; font-weight: 700; color: #0A1E29;
    }
    .total-amount { font-size: 20px; font-weight: 800; }

    .block { padding: 0 20px 24px; }
    h2 { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 12px; }

    /* METHOD SELECTOR */
    .method-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .method-card {
      background: #ffffff;
      border: 2px solid #e6eef5;
      border-radius: 14px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .method-card:hover:not(:disabled) { border-color: #93D5ED; }
    .method-card.active {
      border-color: #4EBE7D;
      background: #f0f9f4;
    }
    .method-card:disabled { opacity: 0.6; cursor: not-allowed; }

    .method-icon {
      width: 40px; height: 40px; border-radius: 50%;
      background: #f2f8fc; color: #4a6272;
      display: grid; place-items: center;
      font-size: 20px;
    }
    .method-icon[data-method="card"]  { background: #d9f0fb; color: #1a5a7a; }
    .method-icon[data-method="gcash"] { background: #d6e8ff; color: #1a4f8a; }
    .method-icon[data-method="qr"]    { background: #ece0ff; color: #5a3d8a; }
    .method-icon[data-method="cash"]  { background: #d7f0e0; color: #1e6b3d; }

    .method-label { font-size: 12.5px; font-weight: 700; color: #0A1E29; }

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
    .card-chip {
      width: 38px; height: 28px; border-radius: 6px;
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
    .card-meta { display: flex; gap: 32px; font-size: 11px; }
    .card-label {
      text-transform: uppercase; letter-spacing: 1px;
      opacity: 0.65; margin-bottom: 3px;
    }
    .card-value {
      font-size: 13px; font-weight: 600;
      letter-spacing: 0.5px; text-transform: uppercase;
    }

    /* GCASH */
    .gcash-card {
      background: linear-gradient(135deg, #0071CE 0%, #00A0E9 100%);
      color: #ffffff;
      border-radius: 18px;
      padding: 20px 22px;
      margin-bottom: 16px;
      box-shadow: 0 12px 32px rgba(0,113,206,0.25);
    }
    .gcash-head {
      display: flex; gap: 12px; align-items: center;
      margin-bottom: 20px;
    }
    .gcash-logo {
      width: 40px; height: 40px; border-radius: 50%;
      background: #ffffff; color: #0071CE;
      display: grid; place-items: center;
      font-size: 24px; font-weight: 800;
    }
    .gcash-brand { font-size: 16px; font-weight: 800; }
    .gcash-sub { font-size: 11px; opacity: 0.8; margin-top: 1px; }

    .gcash-number {
      font-size: 26px; font-weight: 800;
      letter-spacing: 2px; margin-bottom: 4px;
    }
    .gcash-name { font-size: 12px; opacity: 0.85; margin-bottom: 18px; }

    .gcash-amount-row {
      display: flex; justify-content: space-between; align-items: baseline;
      padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.25);
    }
    .gcash-amount { font-size: 22px; font-weight: 800; }

    .gcash-ref {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-top: 12px; padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.15);
      font-size: 12px;
    }
    .ref-label { opacity: 0.75; }
    .ref-value {
      font-family: 'Courier New', monospace;
      font-weight: 700; font-size: 14px;
      letter-spacing: 1px;
    }

    /* QR */
    .qr-wrap { text-align: center; }
    .qr-box {
      background: #ffffff;
      border: 2px solid #e6eef5;
      border-radius: 20px;
      padding: 20px;
      display: inline-block;
      margin-bottom: 14px;
      box-shadow: 0 4px 16px rgba(10,30,41,0.06);
    }
    .qr-img { width: 220px; height: 220px; display: block; }
    .qr-caption {
      font-size: 13px; color: #7a8a97;
      margin: 0 0 20px;
    }
    .qr-details {
      background: #f7fafc;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 10px;
      text-align: left;
    }
    .qr-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #4a6272;
    }
    .qr-row strong { color: #0A1E29; }

    /* CASH */
    .cash-card {
      background: #f0f9f4;
      border-radius: 18px;
      padding: 24px;
      text-align: center;
    }
    .cash-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: #ffffff; color: #1e6b3d;
      display: grid; place-items: center;
      font-size: 30px;
      margin: 0 auto 14px;
    }
    .cash-card h3 { font-size: 18px; font-weight: 800; color: #0A1E29; margin: 0 0 8px; }
    .cash-card p { font-size: 13.5px; color: #4a6272; line-height: 1.5; margin: 0 0 18px; }
    .cash-info {
      background: #ffffff;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .cash-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #4a6272;
    }
    .cash-row strong { color: #0A1E29; font-size: 14px; }

    /* INSTRUCTIONS */
    .instruction-box {
      background: #f7fafc;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 13px;
      color: #4a6272;
      line-height: 1.55;
      margin-bottom: 14px;
    }
    .instruction-box p { margin: 0 0 8px; color: #0A1E29; }
    .instruction-box ol { margin: 0; padding-left: 20px; }
    .instruction-box li { margin-bottom: 4px; }
    .instruction-box strong { color: #0A1E29; }

    .demo-note {
      display: flex; gap: 8px; align-items: flex-start;
      font-size: 11.5px; color: #7a8a97;
      line-height: 1.4; margin: 0;
    }
    .demo-note ion-icon { font-size: 14px; flex: 0 0 auto; margin-top: 2px; }

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
      transition: border-color 0.15s;
    }
    .field:focus-within { border-color: #4EBE7D; background: #ffffff; }
    .field.invalid {
      --background: #fff5f5;
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 4px rgba(231,76,60,0.14);
    }
    .field-icon { color: #7a8a97; font-size: 18px; margin-right: 8px; }
    .field ion-input {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 14px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      color: #8a1a1a; border-radius: 12px;
      font-size: 13px; font-weight: 600;
      margin: 0 20px 16px;
    }
    .err-box ion-icon { font-size: 18px; }

    /* CTA */
    .cta-block { padding: 8px 20px 40px; }
    .pay-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-disabled: #ffffff;
      height: 52px;
      font-weight: 700;
      font-size: 15px;
      --box-shadow: 0 8px 24px rgba(10,30,41,0.18);
    }
    .pay-btn::part(native) { color: #ffffff; }
    .cancel-btn {
      --color: #7a8a97;
      margin-top: 8px;
      text-transform: none;
      font-weight: 600;
    }

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

  method: PaymentMethod = 'card';

  // Card fields
  cardNumber = '';
  cardName = '';
  expiry = '';
  cvc = '';

  // Fake clinic info
  gcashNumber = '0917 123 4567';
  referenceCode = '';

  methods = [
    { value: 'card' as PaymentMethod,  label: 'Card',           icon: 'card-outline' },
    { value: 'gcash' as PaymentMethod, label: 'GCash',          icon: 'phone-portrait-outline' },
    { value: 'qr' as PaymentMethod,    label: 'QR Code',        icon: 'qr-code-outline' },
    { value: 'cash' as PaymentMethod,  label: 'Cash at Clinic', icon: 'storefront-outline' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AppointmentsApi,
    public auth: AuthService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    // Generate a short stable-ish reference code
    this.referenceCode = 'EA-' + Math.random().toString(36).slice(2, 8).toUpperCase();

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
    this.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  onExpiryChange(value: string) {
    const digits = String(value).replace(/\D/g, '').slice(0, 4);
    this.expiry = digits.length <= 2 ? digits : digits.slice(0, 2) + '/' + digits.slice(2);
  }

  onCvcChange(value: string) {
    this.cvc = String(value).replace(/\D/g, '').slice(0, 4);
  }

  get validCard(): boolean {
    return /^\d{13,19}$/.test(this.cardNumber.replace(/\s/g, ''));
  }
  get validExpiry(): boolean {
    if (!/^\d{2}\/\d{2}$/.test(this.expiry)) return false;
    const mm = Number(this.expiry.slice(0, 2));
    return mm >= 1 && mm <= 12;
  }
  get validCvc(): boolean {
    return /^\d{3,4}$/.test(this.cvc);
  }

  // ---------- QR CODE ----------

  qrCodeUrl(): string {
    const a = this.appt();
    if (!a) return '';

    // Build a payment payload for the QR (a real bank would use its own schema)
    const payload = [
      'EASMILE PAYMENT',
      `Amount: PHP ${Number(a.total_amount).toFixed(2)}`,
      `Payee: EAsmile Dental Clinic`,
      `Reference: ${this.referenceCode}`,
      `Appointment: ${a.id}`
    ].join('\n');

    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(payload)}`;
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
        payment_method: 'card',
        card_number: this.cardNumber.replace(/\s/g, ''),
        card_name: this.cardName.trim(),
        expiry: this.expiry,
        cvc: this.cvc
      });
      this.router.navigateByUrl(
        `/app/thank-you?appt=${a.id}&txn=${res.transaction_id}&method=card`,
        { replaceUrl: true }
      );
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Payment failed. Try again.');
    } finally {
      this.processing.set(false);
    }
  }

  async confirm() {
    const a = this.appt();
    if (!a) return;

    this.processing.set(true);
    try {
      const res = await this.api.pay(a.id, { payment_method: this.method });
      this.router.navigateByUrl(
        `/app/thank-you?appt=${a.id}&txn=${res.transaction_id}&method=${this.method}`,
        { replaceUrl: true }
      );
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Could not record payment. Try again.');
    } finally {
      this.processing.set(false);
    }
  }

  async confirmCash() {
    const a = this.appt();
    if (!a) return;

    this.processing.set(true);
    try {
      await this.api.pay(a.id, { payment_method: 'cash' });

      const t = await this.toastCtrl.create({
        message: "We'll collect payment when you arrive",
        duration: 2200,
        position: 'bottom',
        color: 'success'
      });
      await t.present();

      this.router.navigateByUrl('/app/appointments', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Could not save. Try again.');
    } finally {
      this.processing.set(false);
    }
  }
}