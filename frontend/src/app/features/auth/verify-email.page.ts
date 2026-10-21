import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { addIcons } from 'ionicons';
import { mailUnreadOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonButton, IonInput, IonIcon } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonIcon],
  template: `
    <ion-content class="bg ion-padding">
      <div class="wrap">
        <div class="icon-circle">
          <ion-icon name="mail-unread-outline"></ion-icon>
        </div>
        <h1>Verify your email</h1>
        <p class="sub">We sent a 6-digit code to your email. Enter it below to confirm your account.</p>

        <input 
          type="text" 
          class="code-input" 
          maxlength="6" 
          [(ngModel)]="code" 
          placeholder="000000" 
          (keyup.enter)="submit()" 
        />

        @if (error()) { <p class="err">{{ error() }}</p> }
        @if (info()) { <p class="info">{{ info() }}</p> }

        <ion-button expand="block" class="submit" (click)="submit()" [disabled]="loading()">
          {{ loading() ? 'Verifying...' : 'Confirm Account' }}
        </ion-button>
        
        <div class="links">
          <button type="button" class="link-btn" (click)="resend()" [disabled]="cooldown() > 0">
            {{ cooldown() > 0 ? 'Resend code in ' + cooldown() + 's' : 'Resend code' }}
          </button>
          <button type="button" class="link-btn" (click)="logout()">Use a different account</button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .bg { --background: #f2f8fc; }
    .wrap { max-width: 400px; margin: 10vh auto; text-align: center; }
    .icon-circle { width: 64px; height: 64px; background: #ffffff; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 20px; font-size: 32px; color: #4EBE7D; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-size: 24px; font-weight: 800; color: #0A1E29; margin: 0 0 10px; }
    .sub { font-size: 14px; color: #7a8a97; line-height: 1.5; margin-bottom: 30px; }
    .code-input { width: 100%; max-width: 260px; margin: 0 auto 20px; padding: 16px; font-size: 32px; letter-spacing: 8px; text-align: center; border-radius: 12px; border: 2px solid #e6eef5; outline: none; font-weight: 700; color: #0A1E29; background: #ffffff; display: block; }
    .code-input:focus { border-color: #4EBE7D; }
    .submit { --background: #0A1E29; --color: #ffffff; --border-radius: 9999px; height: 50px; font-weight: 700; margin-top: 10px; }
    .err { color: #c0392b; font-size: 13px; margin-bottom: 10px; font-weight: 600; }
    .info { color: #2e8b57; font-size: 13px; margin-bottom: 10px; font-weight: 600; }
    .links { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 24px; }
    .link-btn { background: transparent; border: 0; color: #7a8a97; font-size: 13px; text-decoration: underline; cursor: pointer; }
    .link-btn:disabled { text-decoration: none; opacity: 0.6; cursor: default; }
  `]
})
export class VerifyEmailPage implements OnInit, OnDestroy {
  code = '';
  loading = signal(false);
  error = signal<string | null>(null);
  info = signal<string | null>(null);
  cooldown = signal(60);
  private timer: any;

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {
    addIcons({ mailUnreadOutline });
  }

  ngOnInit() { this.startCooldown(60); }
  ngOnDestroy() { clearInterval(this.timer); }

  private startCooldown(seconds: number) {
    clearInterval(this.timer);
    this.cooldown.set(seconds);
    this.timer = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(Math.max(next, 0));
      if (next <= 0) clearInterval(this.timer);
    }, 1000);
  }

  async submit() {
    if (this.code.length < 6) { this.error.set('Enter the full 6-digit code'); return; }
    this.loading.set(true); this.error.set(null);
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/verify-email`, { code: this.code }));
      await this.auth.refreshUser();
      this.router.navigateByUrl('/app/home', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Verification failed');
    } finally {
      this.loading.set(false);
    }
  }

  async resend() {
    if (this.cooldown() > 0) return;
    this.error.set(null); this.info.set(null);
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/resend-code`, {}));
      this.info.set('New code sent. Check your email.');
      this.startCooldown(60);
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Could not resend code');
      if (e?.error?.retry_after) this.startCooldown(e.error.retry_after);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}