import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner, IonItem, IonInput, IonTextarea,
  ToastController
} from '@ionic/angular/standalone';
import { ProfileApi, Profile } from '../../../core/profile.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSpinner, IonItem, IonInput, IonTextarea
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (profile(); as p) {

        <section class="head">
          <button type="button" class="avatar-btn" (click)="pickAvatar()" [disabled]="uploading()">
            @if (p.profile_image) {
              <img [src]="p.profile_image" alt="Profile" class="avatar-img" />
            } @else {
              <div class="avatar-fallback">
                <ion-icon name="person-outline"></ion-icon>
              </div>
            }

            <div class="avatar-overlay" [class.visible]="uploading()">
              @if (uploading()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                <ion-icon name="camera-outline"></ion-icon>
              }
            </div>
          </button>

          <input
            #fileInput
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden-input"
            (change)="onFilePicked($event)" />

          <h1 class="name">{{ p.first_name }} {{ p.last_name }}</h1>
          <p class="email">{{ p.email }}</p>
          <span class="role-badge">{{ p.role | titlecase }}</span>

          <p class="avatar-hint">Tap your photo to change it</p>
        </section>

        <section class="block">
          <h2>Personal Information</h2>

          <ion-item lines="none" class="field">
            <ion-input label="First name" labelPlacement="floating" [(ngModel)]="form.first_name"></ion-input>
          </ion-item>

          <ion-item lines="none" class="field">
            <ion-input label="Last name" labelPlacement="floating" [(ngModel)]="form.last_name"></ion-input>
          </ion-item>

          <ion-item lines="none" class="field">
            <ion-input label="Phone" labelPlacement="floating" [(ngModel)]="form.phone"></ion-input>
          </ion-item>

          <ion-item lines="none" class="field field-textarea">
            <ion-textarea
              label="Address"
              labelPlacement="floating"
              [(ngModel)]="form.address"
              [autoGrow]="true"
              rows="2">
            </ion-textarea>
          </ion-item>

          @if (saveError()) {
            <p class="err">{{ saveError() }}</p>
          }

          <ion-button expand="block" class="save" (click)="save()" [disabled]="saving()">
            @if (saving()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Save Changes
            }
          </ion-button>
        </section>

        <div class="signout-wrap">
          <ion-button expand="block" fill="outline" class="signout" (click)="logout()">
            <ion-icon slot="start" name="log-out-outline"></ion-icon>
            Log out
          </ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .head {
      background: #e6f4fb; padding: 28px 20px 22px;
      text-align: center; border-radius: 0 0 24px 24px;
    }

    .avatar-btn {
      position: relative;
      width: 96px; height: 96px;
      border-radius: 50%;
      border: 0;
      padding: 0;
      margin: 0 auto 14px;
      display: block;
      cursor: pointer;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 4px 14px rgba(10,30,41,0.12);
      transition: transform 0.15s;
    }
    .avatar-btn:hover { transform: scale(1.03); }
    .avatar-btn:disabled { cursor: wait; }

    .avatar-img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .avatar-fallback {
      width: 100%; height: 100%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 44px;
    }

    .avatar-overlay {
      position: absolute;
      inset: 0;
      background: rgba(10,30,41,0.55);
      color: #ffffff;
      display: grid; place-items: center;
      font-size: 24px;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .avatar-btn:hover .avatar-overlay { opacity: 1; }
    .avatar-overlay.visible { opacity: 1; }
    .avatar-overlay ion-spinner { --color: #ffffff; }

    .hidden-input { display: none; }

    .name { font-size: 20px; font-weight: 700; margin: 0 0 2px; color: #0A1E29; }
    .email { color: #4a6272; font-size: 13px; margin: 0 0 8px; }
    .role-badge {
      display: inline-block; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
      background: #ffffff; color: #4EBE7D;
      padding: 4px 12px; border-radius: 9999px;
    }
    .avatar-hint {
      font-size: 11px; color: #7a8a97;
      margin: 10px 0 0; opacity: 0.7;
    }

    .block { padding: 24px 20px 0; }
    h2 { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 12px; }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 16px;
      --inner-padding-end: 16px;
      margin-bottom: 12px;
      border-radius: 14px;
    }
    .field-textarea { --padding-start: 16px; }

    .err { color: #c0392b; font-size: 13px; margin: 6px 4px; }

    .save {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 46px; font-weight: 600; margin-top: 8px;
    }

    .signout-wrap { padding: 20px 20px 40px; }
    .signout {
      --border-color: #c0392b;
      --color: #c0392b;
      --border-radius: 9999px;
      --border-width: 1.5px;
      height: 46px; font-weight: 600;
    }

    .loading { display: grid; place-items: center; padding: 60px; }
  `]
})
export class ProfilePage implements OnInit {
  profile = signal<Profile | null>(null);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  saveError = signal<string | null>(null);

  form = {
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  };

  constructor(
    private api: ProfileApi,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    try {
      const p = await this.api.get();
      this.applyProfile(p);
    } catch {
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private applyProfile(p: Profile) {
    this.profile.set(p);
    this.form.first_name = p.first_name;
    this.form.last_name = p.last_name;
    this.form.phone = p.phone;
    this.form.address = p.address ?? '';
  }

  pickAvatar() {
    const input = document.querySelector<HTMLInputElement>('.hidden-input');
    input?.click();
  }

  async onFilePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      await this.toast('Image must be under 5 MB', 'danger');
      input.value = '';
      return;
    }

    this.uploading.set(true);
    try {
      const updated = await this.api.uploadAvatar(file);
      this.applyProfile(updated);
      await this.toast('Photo updated', 'success');
    } catch (e: any) {
      await this.toast(e?.error?.error || 'Upload failed', 'danger');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async save() {
    this.saveError.set(null);
    this.saving.set(true);
    try {
      const updated = await this.api.update({
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
        phone: this.form.phone.trim(),
        address: this.form.address.trim() || null as any
      });
      this.applyProfile(updated);

      const current = this.auth.user();
      if (current) {
        this.auth.user.set({
          ...current,
          first_name: updated.first_name,
          last_name: updated.last_name
        });
        localStorage.setItem('user', JSON.stringify({
          ...current,
          first_name: updated.first_name,
          last_name: updated.last_name
        }));
      }

      await this.toast('Profile updated', 'success');
    } catch (e: any) {
      this.saveError.set(e?.error?.error || e?.message || 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  async logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({
      message, duration: 1800, position: 'bottom', color
    });
    await t.present();
  }
}