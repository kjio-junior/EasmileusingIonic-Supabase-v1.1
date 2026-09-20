import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
  ],
  template: `
    <ion-content class="auth-bg" [fullscreen]="true">
      <div class="wrap">
        <div class="hero-icon">
          <ion-icon name="key-outline"></ion-icon>
        </div>

        @if (success()) {
          <h1>Password updated</h1>
          <p class="sub">Your password has been changed. You can now sign in with your new credentials.</p>
          <ion-button expand="block" class="submit" routerLink="/login">
            Go to Sign In
          </ion-button>
        } @else {
          <h1>Set a new password</h1>
          <p class="sub">Choose a strong password you haven't used before.</p>

          <div class="field-group">
            <label class="field-label">New Password <span class="req">*</span></label>
            <ion-item lines="none" class="field" [class.invalid]="submitted() && password.length < 6">
              <ion-icon slot="start" name="lock-closed-outline" class="field-icon"></ion-icon>
              <ion-input
                [type]="showPw ? 'text' : 'password'"
                placeholder="At least 6 characters"
                [(ngModel)]="password"
                [disabled]="saving()">
              </ion-input>
              @if (password.length > 0) {
                <ion-button fill="clear" slot="end" class="eye-btn" (click)="showPw = !showPw">
                  <ion-icon slot="icon-only" [name]="showPw ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </ion-button>
              }
            </ion-item>
          </div>

          <div class="field-group">
            <label class="field-label">Confirm Password <span class="req">*</span></label>
            <ion-item lines="none" class="field" [class.invalid]="submitted() && confirm !== password">
              <ion-icon slot="start" name="lock-closed-outline" class="field-icon"></ion-icon>
              <ion-input
                [type]="showPw ? 'text' : 'password'"
                placeholder="Type it again"
                [(ngModel)]="confirm"
                [disabled]="saving()"
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

          <ion-button expand="block" class="submit" (click)="submit()" [disabled]="saving()">
            @if (saving()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Update Password
            }
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
    .wrap { max-width: 420px; margin: 8vh auto 0; padding: 0 24px 40px; }

    .hero-icon {
      width: 68px; height: 68px; border-radius: 50%;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center; font-size: 32px;
      margin-bottom: 20px;
    }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; color: #0A1E29; letter-spacing: -0.5px; }
    .sub { color: #7a8a97; font-size: 14px; line-height: 1.5; margin: 0 0 28px; }

    .field-group { margin-bottom: 16px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px;
    }
    .req { color: #e74c3c; margin-left: 2px; }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 8px;
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
    .eye-btn { --color: #7a8a97; height: 36px; }

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

    .signin-line { text-align: center; margin: 24px 0 0; font-size: 13px; color: #7a8a97; }
    .signin-link { color: #4EBE7D; font-weight: 700; text-decoration: none; }
    .signin-link:hover { text-decoration: underline; }
  `]
})
export class ResetPasswordPage implements OnInit {
  password = '';
  confirm = '';
  showPw = false;

  saving = signal(false);
  submitted = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  private token = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Missing or invalid reset link.');
    }
  }

  async submit() {
    this.submitted.set(true);
    this.error.set(null);

    if (!this.token) {
      this.error.set('Missing or invalid reset link.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (this.password !== this.confirm) {
      this.error.set('Passwords do not match');
      return;
    }

    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/reset-password`, {
          token: this.token,
          newPassword: this.password
        })
      );
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Failed to reset password');
    } finally {
      this.saving.set(false);
    }
  }
}