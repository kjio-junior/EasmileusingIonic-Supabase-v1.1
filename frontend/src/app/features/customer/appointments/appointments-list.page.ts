import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';

@Component({
  standalone: true,
  selector: 'app-appointments-list',
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSpinner, IonRefresher, IonRefresherContent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/app/profile">
            <ion-icon slot="icon-only" name="person-circle-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <section class="head">
        <h1>My Appointments</h1>
        <p class="sub">Your upcoming and past visits.</p>
      </section>

      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!appointments().length) {
        <div class="empty">
          <div class="empty-icon">
            <ion-icon name="calendar-outline"></ion-icon>
          </div>
          <h2>No appointments yet</h2>
          <p>Book your first visit and it will show up here.</p>
          <ion-button class="cta" routerLink="/app/services">
            <ion-icon slot="start" name="grid-outline"></ion-icon>
            Browse Services
          </ion-button>
        </div>
      } @else {
        <div class="list">
          @for (a of appointments(); track a.id) {
            <div class="appt-card" [class.cancelled]="a.status === 'cancelled'">
              <div class="appt-top">
                <div class="appt-date">
                  <span class="dow">{{ a.appointment_date | date:'EEE' }}</span>
                  <span class="day">{{ a.appointment_date | date:'d' }}</span>
                  <span class="mon">{{ a.appointment_date | date:'MMM' }}</span>
                </div>
                <div class="appt-body">
                  <div class="appt-time">{{ a.appointment_date | date:'h:mm a' }}</div>
                  @if (a.dentist; as d) {
                    <div class="appt-dentist">Dr. {{ d.first_name }} {{ d.last_name }}</div>
                  } @else {
                    <div class="appt-dentist muted">Dentist to be assigned</div>
                  }
                  @if (a.notes) {
                    <div class="appt-notes">{{ a.notes }}</div>
                  }
                </div>
                <div class="appt-status" [attr.data-status]="a.status">
                  {{ statusLabel(a.status) }}
                </div>
              </div>
            </div>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .head { padding: 16px 20px 8px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 13px; margin: 4px 0 0; }

    .list { padding: 8px 20px 90px; display: flex; flex-direction: column; gap: 12px; }

    .appt-card {
      background: #e6f4fb; border-radius: 16px; padding: 14px;
    }
    .appt-card.cancelled { opacity: 0.55; }

    .appt-top { display: flex; align-items: center; gap: 14px; }

    .appt-date {
      width: 54px; height: 60px; border-radius: 12px;
      background: #ffffff; display: flex; flex-direction: column;
      align-items: center; justify-content: center; flex: 0 0 auto;
      color: #0A1E29;
    }
    .dow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #7a8a97; }
    .day { font-size: 20px; font-weight: 700; line-height: 1; }
    .mon { font-size: 10px; text-transform: uppercase; color: #4EBE7D; font-weight: 600; }

    .appt-body { flex: 1; min-width: 0; }
    .appt-time { font-size: 14px; font-weight: 600; color: #0A1E29; }
    .appt-dentist { font-size: 12px; color: #4a6272; margin-top: 2px; }
    .appt-dentist.muted { color: #7a8a97; font-style: italic; }
    .appt-notes {
      font-size: 11px; color: #7a8a97; margin-top: 4px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    .appt-status {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 4px 10px; border-radius: 9999px;
      flex: 0 0 auto;
      background: #ffffff; color: #0A1E29;
    }
    .appt-status[data-status="pending"]     { background: #fff4d6; color: #8a6d00; }
    .appt-status[data-status="confirmed"]   { background: #d7f0e0; color: #1e6b3d; }
    .appt-status[data-status="in-progress"] { background: #d6e8ff; color: #1a4f8a; }
    .appt-status[data-status="completed"]   { background: #d9f0fb; color: #0A1E29; }
    .appt-status[data-status="cancelled"]   { background: #ffd7d7; color: #8a1a1a; }
    .appt-status[data-status="no-show"]     { background: #ffd7d7; color: #8a1a1a; }

    .loading { display: grid; place-items: center; padding: 60px; }

    .empty {
      text-align: center; padding: 60px 32px;
    }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center; font-size: 36px; margin: 0 auto 16px;
    }
    .empty h2 { font-size: 18px; margin: 0 0 6px; color: #0A1E29; }
    .empty p { color: #7a8a97; font-size: 13px; margin: 0 0 20px; }

    .cta {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 44px; font-weight: 600;
    }
  `]
})
export class AppointmentsListPage implements OnInit {
  appointments = signal<Appointment[]>([]);
  loading = signal(true);

  constructor(private api: AppointmentsApi) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.api.loadMine();
      this.appointments.set(list);
    } catch {
      this.appointments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(ev: CustomEvent) {
    await this.load();
    (ev.target as HTMLIonRefresherElement).complete();
  }

  statusLabel(s: string): string {
    return s.replace('-', ' ');
  }
}