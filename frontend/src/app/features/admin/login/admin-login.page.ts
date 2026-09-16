import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
} from '@ionic/angular/standalone';
import { AdminAuthService } from '../../../core/admin-auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  host: { 'class': 'ion-page' },
  imports: [
    CommonModule, FormsModule,
    IonContent, IonInput, IonButton, IonSpinner, IonItem, IonIcon
  ],
  template: `
    <ion-content class="admin-login-bg ion-padding">
      <div class="wrap">
        <div class="badge">ADMIN PORTAL</div>
        <h1>EAsmile</h1>
        <p class="sub">Staff &amp; administrator access only</p>

        <ion-item lines="none" class="field">
          <ion-input
            label="Email"
            labelPlacement="floating"
            type="email"
            [(ngModel)]="email"
            autocomplete="email"
            [disabled]="loading()">
          </ion-input>
        </ion-item>

        <ion-item lines="none" class="field">
          <ion-input
            label="Password"
            labelPlacement="floating"
            [type]="showPassword ? 'text' : 'password'"
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

        @if (error()) {
          <p class="err">{{ error() }}</p>
        }

        <ion-button
          expand="block"
          class="submit"
          (click)="submit()"
          [disabled]="loading()">
          @if (loading()) {
            <ion-spinner name="crescent"></ion-spinner>
          } @else {
            Sign in
          }
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .admin-login-bg {
      --background: linear-gradient(180deg, #0A1E29 0%, #142635 100%);
      --color: #ffffff;
    }
    .wrap { max-width: 420px; margin: 12vh auto 0; padding: 0 8px; }
    .badge {
      display: inline-block;
      background: #4EBE7D;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    h1 { font-size: 32px; font-weight: 700; margin: 0 0 6px; color: #ffffff; }
    .sub { color: #93D5ED; margin: 0 0 28px; font-size: 14px; }

    .field {
      --background: #ffffff;
      --border-radius: 9999px;
      --padding-start: 20px;
      --inner-padding-end: 20px;
      --color: #0A1E29;
      margin-bottom: 14px;
      border-radius: 9999px;
    }
    .eye-btn {
      --color: #7a8a97;
      --padding-start: 8px;
      --padding-end: 8px;
      margin-inline-end: 4px;
    }
    .err { color: #ff8a8a; margin: 6px 8px 12px; font-size: 14px; }
    .submit {
      --background: #4EBE7D;
      --background-activated: #3ea66b;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 46px; font-weight: 600; margin-top: 8px;
    }
  `]
})
export class AdminLoginPage {
  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AdminAuthService, private router: Router) {}

  async submit() {
    this.error.set(null);
    if (!this.email || !this.password) {
      this.error.set('Enter email and password');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.login(this.email.trim(), this.password);
      this.router.navigateByUrl('/ea-admin/dashboard', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}