import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/services.service';

@Component({
  standalone: true,
  selector: 'app-service-detail',
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
    IonContent, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/app/services" text=""></ion-back-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (service(); as s) {
        <section class="hero">
          <div class="hero-icon">
            <ion-icon [name]="iconFor(s.category)"></ion-icon>
          </div>
          <h1 class="hero-name">{{ s.name }}</h1>
          <div class="hero-price">From ₱{{ s.price }}</div>
        </section>

        <section class="block">
          <h2>About This Service</h2>
          <p>{{ s.description }}</p>
        </section>

        <section class="block">
          <h2>What's Included</h2>
          <ul class="checklist">
            <li>Consultation with a licensed dentist</li>
            <li>Standard procedure for this service</li>
            <li>Post-visit care instructions</li>
          </ul>
        </section>

        <section class="block">
          <h2>Duration</h2>
          <p>Approximately {{ s.duration_minutes }} minutes.</p>
        </section>

        <div class="cta-wrap">
          <ion-button expand="block" class="cta" (click)="book()">
            <ion-icon slot="start" name="calendar-outline"></ion-icon>
            Book Your Appointment
          </ion-button>
        </div>
      } @else {
        <p class="err">Service not found.</p>
      }
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .hero {
      background: #e6f4fb; padding: 28px 20px;
      text-align: center; border-radius: 0 0 24px 24px;
    }
    .hero-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 32px;
      margin: 0 auto 12px;
    }
    .hero-name { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #0A1E29; }
    .hero-price { color: #0A1E29; font-size: 14px; font-weight: 600; }

    .block { padding: 20px 20px 0; }
    h2 { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 8px; }
    p { color: #4a6272; font-size: 13px; line-height: 1.5; margin: 0; }

    .checklist { list-style: none; padding: 0; margin: 0; }
    .checklist li {
      position: relative; padding-left: 22px; margin-bottom: 8px;
      color: #4a6272; font-size: 13px;
    }
    .checklist li::before {
      content: ''; position: absolute; left: 0; top: 6px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #4EBE7D;
    }

    .cta-wrap { padding: 24px 20px 32px; }
    .cta {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 48px; font-weight: 600;
    }

    .loading { display: grid; place-items: center; padding: 60px; }
    .err { text-align: center; color: #7a8a97; padding: 40px; }
  `]
})
export class ServiceDetailPage implements OnInit {
  service = signal<Service | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }
    try {
      const res = await firstValueFrom(
        this.http.get<{ service: Service }>(`${environment.apiUrl}/services/${id}`)
      );
      this.service.set(res.service);
    } catch {
      this.service.set(null);
    } finally {
      this.loading.set(false);
    }
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

  book() {
    const s = this.service();
    if (!s) return;
    this.router.navigateByUrl(`/app/book/${s.id}`);
  }
}