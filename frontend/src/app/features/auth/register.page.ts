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
  selector: 'app-register',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
  ],
  template: `
    <ion-content class="auth-bg" [fullscreen]="true">
      <div class="shell">

        <aside class="brand-panel">
          <div class="brand-photo"></div>
          <div class="brand-overlay"></div>

          <div class="brand-top">
            <span class="brand-ea">EA</span><span class="brand-smile">smile</span>
          </div>

          <div class="brand-body">
            <h2 class="brand-headline">Join<br/>EAsmile.</h2>
            <p class="brand-copy">
              Create your free account and get instant access to booking,
              appointment tracking, and your complete dental history.
            </p>

            <div class="brand-features">
              <div class="feature"><div class="feature-dot"></div><span>Free forever</span></div>
              <div class="feature"><div class="feature-dot"></div><span>No card required</span></div>
              <div class="feature"><div class="feature-dot"></div><span>Book in under a minute</span></div>
            </div>
          </div>
        </aside>

        <main class="form-panel">
          <button type="button" class="back-link" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
            <span>Back</span>
          </button>

          <div class="form-wrap">
            <div class="mobile-brand">
              <span class="brand-ea">EA</span><span class="brand-smile">smile</span>
            </div>

            <p class="eyebrow">Get started</p>
            <h1 class="title">Create account</h1>
            <p class="sub">It only takes a minute. Free forever.</p>

            <div class="grid-2">
              <div class="field-group">
                <label class="field-label">First name <span class="req">*</span></label>
                <ion-item lines="none" class="field" [class.invalid]="showError('firstName')">
                  <ion-input
                    type="text"
                    placeholder="Jane"
                    [(ngModel)]="first_name"
                    (ionBlur)="markTouched('firstName')"
                    (ionFocus)="markFocused('firstName')"
                    autocomplete="given-name"
                    maxlength="50"
                    [disabled]="loading()">
                  </ion-input>
                </ion-item>
                @if (showError('firstName')) {
                  <p class="field-err">{{ fieldErrors()['firstName'] }}</p>
                }
              </div>

              <div class="field-group">
                <label class="field-label">Last name <span class="req">*</span></label>
                <ion-item lines="none" class="field" [class.invalid]="showError('lastName')">
                  <ion-input
                    type="text"
                    placeholder="Doe"
                    [(ngModel)]="last_name"
                    (ionBlur)="markTouched('lastName')"
                    (ionFocus)="markFocused('lastName')"
                    autocomplete="family-name"
                    maxlength="50"
                    [disabled]="loading()">
                  </ion-input>
                </ion-item>
                @if (showError('lastName')) {
                  <p class="field-err">{{ fieldErrors()['lastName'] }}</p>
                }
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Email <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="showError('email')">
                <ion-icon slot="start" name="mail-outline" class="field-icon"></ion-icon>
                <ion-input
                  type="email"
                  inputmode="email"
                  placeholder="you@example.com"
                  [(ngModel)]="email"
                  (ionBlur)="markTouched('email')"
                  (ionFocus)="markFocused('email')"
                  autocomplete="email"
                  maxlength="100"
                  [disabled]="loading()">
                </ion-input>
              </ion-item>
              @if (showError('email')) {
                <p class="field-err">{{ fieldErrors()['email'] }}</p>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Phone <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="showError('phone')">
                <ion-icon slot="start" name="call-outline" class="field-icon"></ion-icon>
                <ion-input
                  type="tel"
                  inputmode="tel"
                  placeholder="09171234567"
                  [(ngModel)]="phone"
                  (ionBlur)="markTouched('phone')"
                  (ionFocus)="markFocused('phone')"
                  autocomplete="tel"
                  maxlength="14"
                  [disabled]="loading()">
                </ion-input>
              </ion-item>
              @if (showError('phone')) {
                <p class="field-err">{{ fieldErrors()['phone'] }}</p>
              } @else {
                <p class="field-hint">Digits only, 10–13 numbers (e.g. 09171234567).</p>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Password <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="showError('password')">
                <ion-icon slot="start" name="lock-closed-outline" class="field-icon"></ion-icon>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="At least 6 characters"
                  [(ngModel)]="password"
                  (ionBlur)="markTouched('password')"
                  (ionFocus)="markFocused('password')"
                  autocomplete="new-password"
                  [disabled]="loading()">
                </ion-input>
                @if (password.length > 0) {
                  <ion-button fill="clear" slot="end" class="eye-btn" (click)="showPassword = !showPassword">
                    <ion-icon slot="icon-only" [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                  </ion-button>
                }
              </ion-item>
              @if (showError('password')) {
                <p class="field-err">{{ fieldErrors()['password'] }}</p>
              } @else {
                <p class="field-hint">Minimum 6 characters. Use something memorable.</p>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Confirm Password <span class="req">*</span></label>
              <ion-item lines="none" class="field" [class.invalid]="showError('confirmPassword')">
                <ion-icon slot="start" name="lock-closed-outline" class="field-icon"></ion-icon>
                <ion-input
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="Type it again"
                  [(ngModel)]="confirmPassword"
                  (ionBlur)="markTouched('confirmPassword')"
                  (ionFocus)="markFocused('confirmPassword')"
                  autocomplete="new-password"
                  [disabled]="loading()"
                  (keyup.enter)="submit()">
                </ion-input>
              </ion-item>
              @if (showError('confirmPassword')) {
                <p class="field-err">{{ fieldErrors()['confirmPassword'] }}</p>
              }
            </div>

            @if (error()) {
              <div class="err-box">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <!-- Checkbox -->
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="agreeToTerms"
                  (change)="markTouched('agreeToTerms')" 
                />
                <span>I agree to the <a routerLink="/terms" target="_blank">Terms &amp; Conditions</a> and <a routerLink="/privacy" target="_blank">Data Privacy Policy</a>.</span>
              </label>
              @if (showError('agreeToTerms')) {
                <p class="field-err">{{ fieldErrors()['agreeToTerms'] }}</p>
              }
            </div>

            <ion-button expand="block" class="submit" (click)="submit()" [disabled]="loading()">
              @if (loading()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Create Account
                <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
              }
            </ion-button>

            <p class="terms">
              By creating an account, you agree to EAsmile's
              <a routerLink="/terms">Terms</a> and <a routerLink="/privacy">Privacy Policy</a>.
            </p>

            <div class="divider"><span>Already registered?</span></div>

            <p class="signin-line">
              <a routerLink="/login" class="signin-link">Sign in instead</a>
            </p>
          </div>
        </main>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-bg { --background: #f2f8fc; }
    .shell { display: flex; min-height: 100vh; background: #ffffff; }

    .brand-panel { position: relative; flex: 0 0 46%; display: none; overflow: hidden; }
    .brand-photo {
      position: absolute; inset: 0;
      background-image: url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80');
      background-size: cover; background-position: center;
    }
    .brand-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(10,30,41,0.35) 0%, rgba(10,30,41,0.85) 100%);
    }
    .brand-top { position: absolute; top: 32px; left: 36px; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; z-index: 2; }
    .brand-ea    { color: #93D5ED; }
    .brand-smile { color: #ffffff; }
    .brand-body { position: absolute; bottom: 56px; left: 36px; right: 36px; z-index: 2; color: #ffffff; }
    .brand-headline { font-size: 44px; font-weight: 800; line-height: 1.05; margin: 0 0 16px; letter-spacing: -1px; }
    .brand-copy { font-size: 15px; line-height: 1.6; opacity: 0.88; margin: 0 0 24px; max-width: 400px; }
    .brand-features { display: flex; flex-direction: column; gap: 10px; }
    .feature { display: flex; align-items: center; gap: 10px; font-size: 14px; opacity: 0.9; }
    .feature-dot { width: 8px; height: 8px; border-radius: 50%; background: #4EBE7D; box-shadow: 0 0 12px rgba(78,190,125,0.7); }

    .form-panel { flex: 1; display: flex; flex-direction: column; position: relative; background: #ffffff; min-width: 0; }
    .back-link {
      position: absolute; top: 24px; left: 24px;
      display: flex; align-items: center; gap: 6px;
      border: 0; background: transparent;
      color: #7a8a97; font-size: 13px; font-weight: 600;
      cursor: pointer; padding: 8px 12px; border-radius: 9999px;
      transition: background 0.15s;
    }
    .back-link:hover { background: #f2f8fc; color: #0A1E29; }
    .back-link ion-icon { font-size: 16px; }

    .form-wrap { width: 100%; max-width: 480px; margin: auto; padding: 80px 28px 40px; }
    .mobile-brand { display: block; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 30px; }

    .eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4EBE7D; margin: 0 0 8px; }
    .title { font-size: 32px; font-weight: 800; color: #0A1E29; margin: 0 0 6px; letter-spacing: -0.5px; }
    .sub { font-size: 14px; color: #7a8a97; margin: 0 0 28px; }

    .field-group { margin-bottom: 18px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px; letter-spacing: 0.3px;
    }
    .req { color: #e74c3c; margin-left: 2px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .grid-2 .field-group { margin-bottom: 0; }

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
    .field:focus-within { border-color: #4EBE7D; --background: #ffffff; }
    .field.invalid {
      --background: #fff5f5;
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 4px rgba(231,76,60,0.14);
      animation: shake 0.35s ease;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    .field-icon { color: #7a8a97; font-size: 18px; margin-right: 8px; }
    .field ion-input { --placeholder-color: #b0bcc6; --placeholder-opacity: 1; font-size: 15px; }
    .eye-btn { --color: #7a8a97; height: 36px; }

    .field-err { color: #c0392b; font-size: 12px; margin: 6px 4px 0; font-weight: 600; }
    .field-hint { color: #7a8a97; font-size: 12px; margin: 6px 4px 0; }

    .checkbox-group { margin: 16px 0; }
    .checkbox-label {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 13px; color: #4a6272; cursor: pointer;
    }
    .checkbox-label input {
      margin-top: 3px; width: 16px; height: 16px;
      accent-color: #4EBE7D;
    }
    .checkbox-label a { color: #4EBE7D; font-weight: 600; text-decoration: none; }
    .checkbox-label a:hover { text-decoration: underline; }

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      color: #8a1a1a; border-radius: 12px;
      font-size: 13px; font-weight: 600; margin-bottom: 18px;
    }
    .err-box ion-icon { font-size: 18px; flex: 0 0 auto; }

    .submit {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-disabled: #ffffff;
      height: 52px; font-weight: 700; font-size: 15px; margin: 0;
      --box-shadow: 0 8px 24px rgba(10,30,41,0.18);
    }
    .submit::part(native) { color: #ffffff; }

    .terms { font-size: 12px; color: #7a8a97; text-align: center; margin: 16px 0 0; line-height: 1.5; }
    .terms a { color: #4EBE7D; font-weight: 600; text-decoration: none; }
    .terms a:hover { text-decoration: underline; }

    .divider { position: relative; text-align: center; margin: 28px 0 18px; }
    .divider::before {
      content: ''; position: absolute; top: 50%; left: 0; right: 0;
      height: 1px; background: #e6eef5;
    }
    .divider span {
      position: relative; background: #ffffff;
      padding: 0 14px; font-size: 12px; color: #7a8a97; font-weight: 500;
    }

    .signin-line { text-align: center; margin: 0; font-size: 14px; color: #4a6272; }
    .signin-link {
      color: #0A1E29; font-weight: 700; text-decoration: none;
      border-bottom: 2px solid #4EBE7D; padding-bottom: 2px;
    }
    .signin-link:hover { color: #4EBE7D; }

    @media (min-width: 900px) {
      .brand-panel { display: block; }
      .mobile-brand { display: none; }
      .form-wrap { padding: 60px 48px; }
    }
  `]
})
export class RegisterPage {
  first_name = '';
  last_name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  agreeToTerms = false;

  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  touched = signal<Set<string>>(new Set());

  constructor(private auth: AuthService, private router: Router) {}

  markTouched(field: string) {
    this.touched.update(s => {
      const next = new Set(s);
      next.add(field);
      return next;
    });
    const allErrors = this.validate();
    this.fieldErrors.update(prev => {
      const next = { ...prev };
      if (allErrors[field]) next[field] = allErrors[field];
      else delete next[field];
      return next;
    });
  }

  markFocused(field: string) {
    this.touched.update(s => {
      const next = new Set(s);
      next.delete(field);
      return next;
    });
  }

  showError(field: string): boolean {
    return (this.submitted() || this.touched().has(field)) && !!this.fieldErrors()[field];
  }

  private validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    const fn = this.first_name.trim();
    if (!fn) {
      errors['firstName'] = 'First name is required';
    } else if (fn.length < 2) {
      errors['firstName'] = 'Must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'\-]+$/.test(fn)) {
      errors['firstName'] = 'Letters, spaces, hyphens and apostrophes only';
    }

    const ln = this.last_name.trim();
    if (!ln) {
      errors['lastName'] = 'Last name is required';
    } else if (ln.length < 2) {
      errors['lastName'] = 'Must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'\-]+$/.test(ln)) {
      errors['lastName'] = 'Letters, spaces, hyphens and apostrophes only';
    }

    const em = this.email.trim();
    if (!em) {
      errors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
      errors['email'] = 'Enter a valid email address';
    }

    const ph = this.phone.trim();
    if (!ph) {
      errors['phone'] = 'Phone is required';
    } else if (!/^\+?\d+$/.test(ph)) {
      errors['phone'] = 'Digits only (optional leading +)';
    } else {
      const digits = ph.replace(/\D/g, '');
      if (digits.length < 10) errors['phone'] = 'Must be at least 10 digits';
      else if (digits.length > 13) errors['phone'] = 'Cannot exceed 13 digits';
    }

    if (!this.password) {
      errors['password'] = 'Password is required';
    } else if (this.password.length < 6) {
      errors['password'] = 'Password must be at least 6 characters';
    }

    if (!this.confirmPassword) {
      errors['confirmPassword'] = 'Please confirm your password';
    } else if (this.password !== this.confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match';
    }

    if (!this.agreeToTerms) {
      errors['agreeToTerms'] = 'You must agree to the Terms and Privacy Policy';
    }

    return errors;
  }

  async submit() {
    this.submitted.set(true);
    this.error.set(null);

    const errors = this.validate();
    this.fieldErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        const firstInvalid = document.querySelector('.field.invalid');
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.register({
        first_name: this.first_name.trim(),
        last_name: this.last_name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        password: this.password
      });
      await this.auth.refreshUser();
      // Send to verification instead of home
      this.router.navigateByUrl('/verify-email', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    this.router.navigateByUrl('/onboarding');
  }
}