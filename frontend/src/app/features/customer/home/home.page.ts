import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSearchbar, IonSpinner, IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth.service';
import { ServicesApi, Service } from '../../../core/services.service';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSearchbar, IonSpinner, IonCard, IonCardContent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand">
          EA<span class="brand-accent">smile</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/app/profile">
            <ion-icon slot="icon-only" name="person-circle-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <!-- Greeting -->
      <section class="greeting">
        <div class="greeting-text">
          <p class="hello">Welcome,</p>
          @if (auth.user(); as u) {
            <h1 class="name">{{ u.first_name }} {{ u.last_name }}</h1>
          }
        </div>
        <div class="greeting-icon">
          <ion-icon name="happy-outline"></ion-icon>
        </div>
      </section>

      <!-- Search -->
      <ion-searchbar
        class="search"
        placeholder="Search your dental problem..."
        [(ngModel)]="searchQuery"
        [debounce]="150">
      </ion-searchbar>

      <!-- Upcoming appointment -->
      @if (upcoming(); as appt) {
        <section class="upcoming">
          <div class="upcoming-label">Your next appointment</div>
          <div class="upcoming-row">
            <ion-icon name="calendar-outline"></ion-icon>
            <div>
              <div class="upcoming-date">{{ appt.appointment_date | date:'EEE, MMM d • h:mm a' }}</div>
              <div class="upcoming-status">{{ appt.status | titlecase }}</div>
            </div>
          </div>
        </section>
      }

      <!-- Services -->
      <section class="services">
        <h2 class="section-title">Our Services</h2>

        @if (servicesApi.loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else {
          <div class="service-grid">
            @for (s of filtered(); track s.id) {
              <a class="service-card" [routerLink]="['/app/services', s.id]" (click)="onCardClick($event)">
                <div class="icon-circle">
                  <ion-icon [name]="iconFor(s.category)"></ion-icon>
                </div>
                <h3 class="service-name">{{ s.name }}</h3>
                <p class="service-desc">{{ s.description }}</p>
                <div class="service-foot">
                  <span class="price">From ₱{{ s.price }}</span>
                  <span class="chev"><ion-icon name="chevron-forward-outline"></ion-icon></span>
                </div>
              </a>
            }
            @if (!filtered().length && !servicesApi.loading()) {
              <p class="empty">No services found.</p>
            }
          </div>
        }
      </section>

      <!-- Book appointment CTA -->
      <div class="cta-wrap">
        <ion-button expand="block" class="cta" routerLink="/app/services">
          <ion-icon slot="start" name="calendar-outline"></ion-icon>
          Book an Appointment
        </ion-button>
        <p class="cta-sub">Schedule a visit with our dentists today.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }

    .home-content { --background: #ffffff; }

    .greeting {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 8px;
    }
    .hello { margin: 0; color: #7a8a97; font-size: 13px; }
    .name { margin: 2px 0 0; font-size: 22px; font-weight: 700; color: #0A1E29; }
    .greeting-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: #e6f4fb; display: grid; place-items: center;
      font-size: 28px; color: #4EBE7D;
    }

    .search {
      --background: #e6f4fb;
      --border-radius: 9999px;
      --box-shadow: none;
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      padding: 0 12px 8px;
    }

    .upcoming {
      margin: 8px 20px 4px; padding: 12px 16px;
      background: #e6f4fb; border-radius: 16px;
    }
    .upcoming-label { font-size: 11px; color: #4a6272; text-transform: uppercase; letter-spacing: 0.5px; }
    .upcoming-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; color: #0A1E29; }
    .upcoming-row ion-icon { font-size: 22px; color: #4EBE7D; }
    .upcoming-date { font-weight: 600; font-size: 14px; }
    .upcoming-status { font-size: 12px; color: #7a8a97; }

    .services { padding: 12px 20px 8px; }
    .section-title { font-size: 15px; font-weight: 600; color: #0A1E29; margin: 4px 0 12px; }

    .service-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .service-card {
      display: flex; flex-direction: column;
      background: #e6f4fb; border-radius: 16px;
      padding: 14px; text-decoration: none; color: inherit;
      position: relative; min-height: 150px;
    }
    .icon-circle {
      width: 36px; height: 36px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 20px;
      margin-bottom: 8px;
    }
    .service-name { font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #0A1E29; }
    .service-desc {
      font-size: 11px; color: #4a6272; margin: 0 0 10px; line-height: 1.3;
      flex: 1;
    }
    .service-foot { display: flex; align-items: center; justify-content: space-between; }
    .price { font-size: 11px; color: #0A1E29; font-weight: 600; }
    .chev {
      width: 22px; height: 22px; border-radius: 50%;
      background: #ffffff; display: grid; place-items: center;
      font-size: 12px; color: #4EBE7D;
    }

    .loading { display: grid; place-items: center; padding: 24px; }
    .empty { color: #7a8a97; font-size: 13px; grid-column: span 2; text-align: center; }

    .cta-wrap { padding: 12px 20px 24px; }
    .cta {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 48px; font-weight: 600;
    }
    .cta-sub { text-align: center; color: #7a8a97; font-size: 12px; margin: 8px 0 0; }
  `]
})
export class HomePage implements OnInit {
  searchQuery = '';

  private appointments = signal<Appointment[]>([]);

  upcoming = () => {
    const now = Date.now();
    return this.appointments()
      .filter(a => new Date(a.appointment_date).getTime() >= now)
      .filter(a => a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) =>
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      )[0] ?? null;
  };

  constructor(
    public auth: AuthService,
    public servicesApi: ServicesApi,
    private appointmentsApi: AppointmentsApi,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.servicesApi.load();
    try {
      const list = await this.appointmentsApi.loadMine();
      this.appointments.set(list);
    } catch { /* empty list is fine */ }
  }

  filtered(): Service[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.servicesApi.services();
    if (!q) return list;
    return list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }

  iconFor(category: string): string {
    switch (category) {
      case 'preventive':  return 'sparkles-outline';
      case 'restorative': return 'construct-outline';
      case 'cosmetic':    return 'color-wand-outline';
      case 'surgical':    return 'medical-outline';
      case 'diagnostic':  return 'eye-outline';
      default:            return 'ellipsis-horizontal-outline';
    }
  }

  onCardClick(ev: Event) {
    (ev.currentTarget as HTMLElement)?.blur();
  }
}