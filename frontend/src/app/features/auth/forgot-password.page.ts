import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
  ],
  template: `
    <ion-content class="auth-bg" [fullscreen]="true">
      <div class="wrap">
        <button type="button" class="back" (click)="goBack()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </button>

        <div class="hero-icon">
          <ion-icon name="lock-open-outline"></ion-icon>
        </div>

        @if (!sent()) {
          <h1>Forgot password?</h1>
          <p class="sub">Enter your email and we'll send you a link to reset it.</p>

          <div class="field-group">
            <label class="field-label">Email <span class="req">*</span></label>
            <ion-item lines="none" class="field" [class.invalid]="submitted() && !email.trim()">
              <ion-icon slot="start" name="mail-outline" class="field-icon"></ion-icon>
              <ion-input
                type="email"
                placeholder="you@example.com"
                [(ngModel)]="email"
                autocomplete="email"
                [disabled]="sending()"
                (keyup.enter)="submit()">
              </ion-input>
            </ion-item>
          </div>

          @if (error()) {
            <div class="err-box">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <ion-button expand="block" class="submit" (click)="submit()" [disabled]="sending()">
            @if (sending()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Send Reset Link
            }
          </ion-button>
        } @else {
          <h1>Check your inbox</h1>
          <p class="sub">If an account exists for <strong>{{ email }}</strong>, you'll receive an email with a reset link shortly.</p>
          <p class="hint">Didn't get it? Check spam, or wait a minute and try again.</p>

          <ion-button expand="block" fill="outline" class="submit-outline" (click)="reset()">
            Send again
          </ion-button>
        }

        <p class="signin-line">
          <a routerLink="/login" class="signin-link">Back to sign in</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-bg { --background: #ffffff; }
    .wrap { max-width: 420px; margin: 6vh auto 0; padding: 0 24px 40px; }

    .back {
      border: 0; background: transparent; color: #7a8a97;
      font-size: 20px; cursor: pointer; padding: 6px; margin-bottom: 20px;
      display: inline-flex;
    }

    .hero-icon {
      width: 68px; height: 68px; border-radius: 50%;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center; font-size: 32px;
      margin-bottom: 20px;
    }

    h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; color: #0A1E29; letter-spacing: -0.5px; }
    .sub { color: #7a8a97; font-size: 14px; line-height: 1.5; margin: 0 0 28px; }
    .sub strong { color: #0A1E29; }
    .hint { font-size: 12px; color: #7a8a97; margin: 0 0 24px; }

    .field-group { margin-bottom: 18px; }
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
      --min-height: 52px;
      border-radius: 14px;
      border: 1px solid #e6eef5;
    }
    .field:focus-within { border-color: #4EBE7D; background: #ffffff; }
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

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      color: #8a1a1a; border-radius: 12px;
      font-size: 13px; font-weight: 600; margin-bottom: 16px;
    }
    .err-box ion-icon { font-size: 18px; }

    .submit {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 50px; font-weight: 700; font-size: 14px;
      margin-top: 8px;
    }
    .submit-outline {
      --border-color: #0A1E29;
      --color: #0A1E29;
      --border-radius: 9999px;
      --border-width: 1.5px;
      height: 50px; font-weight: 700;
    }

    .signin-line { text-align: center; margin: 24px 0 0; font-size: 13px; color: #7a8a97; }
    .signin-link { color: #4EBE7D; font-weight: 700; text-decoration: none; }
    .signin-link:hover { text-decoration: underline; }
  `]
})
export class ForgotPasswordPage {
  email = '';
  sending = signal(false);
  submitted = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  goBack() {
    this.router.navigateByUrl('/login');
  }

  reset() {
    this.sent.set(false);
    this.submitted.set(false);
  }

  async submit() {
    this.submitted.set(true);
    this.error.set(null);

    if (!this.email.trim()) {
      this.error.set('Please enter your email');
      return;
    }

    this.sending.set(true);
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/forgot-password`, {
          email: this.email.trim()
        })
      );
      this.sent.set(true);
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Something went wrong. Try again.');
    } finally {
      this.sending.set(false);
    }
  }
}