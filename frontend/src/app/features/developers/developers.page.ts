import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent
} from '@ionic/angular/standalone';
import { DEV_TEAMS } from '../../core/dev-teams';

@Component({
  standalone: true,
  selector: 'app-developers',
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title class="brand">Developers</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      <div class="wrap">
        <p class="eyebrow">The People Behind EAsmile</p>

        @for (team of teams; track team.label) {
          <h2 class="team-label">{{ team.label }}</h2>
          <div class="grid">
            @for (d of team.members; track d.name) {
              <div class="card">
                <div class="photo">
                  <div class="fallback">{{ initials(d.name) }}</div>
                  <img [src]="d.photo" [alt]="d.name" (error)="hideImg($event)" loading="lazy" />
                </div>
                <div class="name">{{ d.name }}</div>
                <div class="role">{{ d.role }}</div>
              </div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #f2f8fc; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 16px; }
    .bg { --background: #ffffff; }
    .wrap { max-width: 800px; margin: 0 auto; padding: 24px 20px; }

    .eyebrow {
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #4EBE7D; margin: 0 0 12px;
    }
    .team-label { font-size: 16px; font-weight: 700; color: #0A1E29; margin: 24px 0 12px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 14px;
    }
    .card {
      background: #f2f8fc; border-radius: 16px;
      padding: 16px 12px; text-align: center;
    }
    .photo { position: relative; width: 72px; height: 72px; margin: 0 auto 10px; }
    .photo img, .fallback {
      position: absolute; inset: 0;
      width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
    }
    .fallback {
      display: grid; place-items: center;
      background: #4EBE7D; color: #ffffff; font-weight: 800;
    }
    .name { font-size: 13px; font-weight: 700; color: #0A1E29; }
    .role { font-size: 11px; color: #7a8a97; margin-top: 2px; }
  `]
})
export class DevelopersPage {
  teams = DEV_TEAMS;

  // "Duran, Kevin Rio D." becomes "KD"
  initials(name: string): string {
    const parts = name.split(',').map(s => s.trim());
    return ((parts[1]?.[0] || '') + (parts[0]?.[0] || '')).toUpperCase();
  }

  hideImg(e: Event) {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}