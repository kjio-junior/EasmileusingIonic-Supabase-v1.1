import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
  ],
  template: `
    <ion-content class="auth-bg" [fullscreen]="true" [scrollY]="false">
      <div class="shell">

        <!-- LEFT: BRAND PANEL -->
        <aside class="brand-panel">
          <div class="brand-photo"></div>
          <div class="brand-overlay"></div>

          <div class="brand-top">
            <span class="brand-ea">EA</span><span class="brand-smile">smile</span>
          </div>

          <div class="brand-body">
            <h2 class="brand-headline">Welcome<br/>back.</h2>
            <p class="brand-copy">
              Your smile deserves the best care. Book a visit,
              track appointments, and stay in control — all in one place.
            </p>

            <div class="brand-features">
              <div class="feature">
                <div class="feature-dot"></div>
                <span>Book in seconds</span>
              </div>
              <div class="feature">
                <div class="feature-dot"></div>
                <span>Manage appointments</span>
              </div>
              <div class="feature">
                <div class="feature-dot"></div>
                <span>Track your dental health</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- RIGHT: FORM PANEL -->
        <main class="form-panel">

          <button type="button" class="back-link" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span>Back</span>
          </button>

          <div class="form-wrap">
            <div class="mobile-brand">
              <span class="brand-ea">EA</span><span class="brand-smile">smile</span>
            </div>

            <p class="eyebrow">Welcome back</p>
            <h1 class="title">Sign in</h1>
            <p class="sub">Use your EAsmile account to continue.</p>

            <div class="field-group">
              <label class="field-label">Email <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="submitted() && !email.trim()">
                <ion-icon slot="start" name="mail-outline" class="field-icon"></ion-icon>
                <ion-input
                  type="email"
                  placeholder="you@example.com"
                  [(ngModel)]="email"
                  autocomplete="email"
                  [disabled]="loading()">
                </ion-input>
              </ion-item>
            </div>

            <div class="field-group">
              <label class="field-label">Password <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="submitted() && !password">
                <ion-icon slot="start" name="lock-closed-outline" class="field-icon"></ion-icon>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                  [disabled]="loading()"
                  (keyup.enter)="submit()">
                </ion-input>
                @if (password.length > 0) {
                  <ion-button fill="clear" slot="end" class="eye-btn" (click)="showPassword = !showPassword">
                    <ion-icon slot="icon-only" [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                  </ion-button>
                }
              </ion-item>
            </div>

            <div class="row-forgot">
              <a class="forgot" routerLink="/forgot-password">Forgot password?</a>
            </div>

            @if (error()) {
              <div class="err-box">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <ion-button expand="block" class="submit" (click)="submit()" [disabled]="loading()">
              @if (loading()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Sign in
                <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
              }
            </ion-button>

            <div class="divider"><span>New to EAsmile?</span></div>

            <p class="signup-line">
              <a routerLink="/register" class="signup-link">Create an account</a>
            </p>
          </div>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-bg { --background: #f2f8fc; }

    .shell {
      display: flex;
      min-height: 100vh;
      background: #ffffff;
    }

    /* ============ LEFT PANEL ============ */
    .brand-panel {
      position: relative;
      flex: 0 0 46%;
      display: none;
      overflow: hidden;
    }

    .brand-photo {
      position: absolute;
      inset: 0;
      background-image: url('https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1400&q=80');
      background-size: cover;
      background-position: center;
    }
    .brand-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(10,30,41,0.35) 0%, rgba(10,30,41,0.85) 100%);
    }

    .brand-top {
      position: absolute;
      top: 32px;
      left: 36px;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      z-index: 2;
    }
    .brand-panel .brand-ea    { color: #93D5ED; }
    .brand-panel .brand-smile { color: #ffffff; }
    .mobile-brand .brand-ea    { color: #2E9FE0; }
    .mobile-brand .brand-smile { color: #5BAFE0; }

    .brand-body {
      position: absolute;
      bottom: 56px;
      left: 36px;
      right: 36px;
      z-index: 2;
      color: #ffffff;
    }
    .brand-headline {
      font-size: 44px;
      font-weight: 800;
      line-height: 1.05;
      margin: 0 0 16px;
      letter-spacing: -1px;
    }
    .brand-copy {
      font-size: 15px;
      line-height: 1.6;
      opacity: 0.88;
      margin: 0 0 24px;
      max-width: 400px;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4EBE7D;
      box-shadow: 0 0 12px rgba(78,190,125,0.7);
    }

    /* ============ RIGHT PANEL ============ */
    .form-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      background: #ffffff;
      min-width: 0;
    }

    .back-link {
      position: absolute;
      top: 24px;
      left: 24px;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 0;
      background: transparent;
      color: #7a8a97;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 9999px;
      transition: background 0.15s;
    }
    .back-link:hover { background: #f2f8fc; color: #0A1E29; }
    .back-link ion-icon { font-size: 16px; }

    .form-wrap {
      width: 100%;
      max-width: 420px;
      margin: auto;
      padding: 80px 28px 40px;
    }

    .mobile-brand {
      display: block;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 30px;
    }

    .eyebrow {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4EBE7D;
      margin: 0 0 8px;
    }
    .title {
      font-size: 32px;
      font-weight: 800;
      color: #0A1E29;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }
    .sub {
      font-size: 14px;
      color: #7a8a97;
      margin: 0 0 28px;
    }

    .field-group { margin-bottom: 18px; }
    .field-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #0A1E29;
      margin: 0 0 8px 4px;
      letter-spacing: 0.3px;
    }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 8px;
      --color: #0A1E29;
      --min-height: 52px;
      border-radius: 14px;
      border: 1px solid transparent;
      transition: border-color 0.15s, background 0.15s;
    }
    .field:focus-within {
      border-color: #4EBE7D;
      --background: #ffffff;
    }
    .field-icon {
      color: #7a8a97;
      font-size: 18px;
      margin-right: 8px;
    }
    .field ion-input {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 15px;
    }

    .req {
      color: #e74c3c;
      font-weight: 700;
      margin-left: 2px;
    }

    .field.invalid {
      --background: #fff5f5;
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.14);
      animation: fieldShake 0.35s ease;
    }
    .field.invalid .field-icon { color: #e74c3c; }

    @keyframes fieldShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    .eye-btn {
      --color: #7a8a97;
      --padding-start: 6px;
      --padding-end: 6px;
      margin: 0;
      height: 36px;
    }

    .row-forgot {
      display: flex;
      justify-content: flex-end;
      margin: 4px 4px 18px;
    }
    .forgot {
      font-size: 13px;
      color: #4EBE7D;
      font-weight: 600;
      text-decoration: none;
    }
    .forgot:hover { text-decoration: underline; }

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
      margin-bottom: 18px;
    }
    .err-box ion-icon { font-size: 18px; flex: 0 0 auto; }

    .submit {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 52px;
      font-weight: 700;
      font-size: 15px;
      margin: 0;
      --box-shadow: 0 8px 24px rgba(10,30,41,0.18);
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 28px 0 18px;
    }
    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e6eef5;
    }
    .divider span {
      position: relative;
      background: #ffffff;
      padding: 0 14px;
      font-size: 12px;
      color: #7a8a97;
      font-weight: 500;
    }

    .signup-line {
      text-align: center;
      margin: 0;
      font-size: 14px;
      color: #4a6272;
    }
    .signup-link {
      color: #0A1E29;
      font-weight: 700;
      text-decoration: none;
      border-bottom: 2px solid #4EBE7D;
      padding-bottom: 2px;
    }
    .signup-link:hover { color: #4EBE7D; }

    /* ============ DESKTOP ============ */
    @media (min-width: 900px) {
      .brand-panel { display: block; }
      .mobile-brand { display: none; }
      .form-wrap { padding: 60px 48px; }
    }
  `]
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  goBack() {
    this.router.navigateByUrl('/onboarding');
  }

  async submit() {
    this.submitted.set(true);
    this.error.set(null);
    if (!this.email.trim() || !this.password) {
      this.error.set('Enter email and password');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.login(this.email.trim(), this.password);

      const returnUrl = sessionStorage.getItem('returnUrl');
      sessionStorage.removeItem('returnUrl');

      this.router.navigateByUrl(returnUrl || '/app/home', { replaceUrl: true });
    } catch (e: any) {
      const msg = e?.error?.error || e?.message || 'Login failed';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}