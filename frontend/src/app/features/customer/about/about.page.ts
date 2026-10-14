import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonBackButton, IonContent
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonBackButton, IonContent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          @if (auth.token()) {
            <ion-menu-button></ion-menu-button>
          } @else {
            <ion-back-button defaultHref="/onboarding" text=""></ion-back-button>
          }
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">

      <!-- HERO -->
      <section class="hero">
        <div class="hero-icon"><ion-icon name="apps-outline"></ion-icon></div>
        <h1>About the App</h1>
        <p class="version">Version 1.0</p>
      </section>

      <!-- WHAT IS IT -->
      <section class="block">
        <p class="lead">
          EAsmile is a mobile-first dental clinic management platform that connects
          patients, dentists, and staff in one integrated system.
        </p>
        <p class="body">
          It was built as a capstone project for IT 009 — Systems Integration and
          Architecture 1. The goal was to demonstrate how a modern, production-grade
          web application can be designed, deployed, and integrated across multiple
          cloud services.
        </p>
      </section>

      <!-- FEATURES -->
      <section class="block">
        <div class="section-eyebrow">What You Can Do</div>
        <h2 class="section-title">Features</h2>

        <div class="feature-list">
          @for (f of features; track f.title) {
            <div class="feat">
              <div class="feat-icon"><ion-icon [name]="f.icon"></ion-icon></div>
              <div class="feat-body">
                <div class="feat-title">{{ f.title }}</div>
                <div class="feat-desc">{{ f.desc }}</div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- TECH -->
      <section class="block">
        <div class="section-eyebrow">Under the Hood</div>
        <h2 class="section-title">Technology Stack</h2>

        <div class="tech-grid">
          @for (t of tech; track t.name) {
            <div class="tech-card">
              <div class="tech-name">{{ t.name }}</div>
              <div class="tech-role">{{ t.role }}</div>
            </div>
          }
        </div>
      </section>

      <!-- CTA -->
      <section class="cta">
        <h2 class="cta-title">Ready to try it?</h2>
        <p class="cta-sub">Create a free account to book your first appointment.</p>
        <ion-button expand="block" class="cta-btn" routerLink="/register">
          Get Started
        </ion-button>
      </section>

    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .hero {
      background: linear-gradient(135deg, #e6f4fb 0%, #d9f0fb 100%);
      padding: 36px 24px 32px;
      text-align: center;
    }
    .hero-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 34px;
      margin: 0 auto 16px;
      box-shadow: 0 4px 16px rgba(10,30,41,0.1);
    }
    .hero h1 {
      font-size: 26px; font-weight: 800; color: #0A1E29;
      margin: 0 0 4px; letter-spacing: -0.5px;
    }
    .version {
      font-size: 12px; color: #7a8a97;
      margin: 0; font-weight: 600; letter-spacing: 0.5px;
    }

    .block { padding: 28px 24px; max-width: 720px; margin: 0 auto; }
    .section-eyebrow {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #4EBE7D; margin-bottom: 6px;
    }
    .section-title {
      font-size: 22px; font-weight: 800; color: #0A1E29;
      margin: 0 0 16px; letter-spacing: -0.5px;
    }
    .lead {
      font-size: 15px; line-height: 1.65; color: #0A1E29;
      margin: 0 0 14px; font-weight: 500;
    }
    .body {
      font-size: 14px; line-height: 1.7; color: #4a6272; margin: 0;
    }

    .feature-list { display: flex; flex-direction: column; gap: 14px; }
    .feat {
      display: flex; gap: 14px; align-items: flex-start;
      padding: 14px 16px; background: #f2f8fc; border-radius: 14px;
    }
    .feat-icon {
      width: 42px; height: 42px; border-radius: 12px;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 20px; flex: 0 0 auto;
    }
    .feat-body { flex: 1; min-width: 0; }
    .feat-title { font-size: 14px; font-weight: 700; color: #0A1E29; margin-bottom: 3px; }
    .feat-desc { font-size: 12.5px; color: #4a6272; line-height: 1.5; }

    .tech-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .tech-card {
      background: #ffffff; border: 1px solid #e6eef5;
      border-radius: 12px; padding: 12px 14px;
    }
    .tech-name { font-size: 13px; font-weight: 700; color: #0A1E29; margin-bottom: 2px; }
    .tech-role { font-size: 11px; color: #7a8a97; }

    .cta {
      padding: 32px 24px 48px; text-align: center;
      background: linear-gradient(180deg, #ffffff 0%, #e6f4fb 100%);
    }
    .cta-title { font-size: 20px; font-weight: 800; color: #0A1E29; margin: 0 0 6px; }
    .cta-sub { font-size: 13px; color: #4a6272; margin: 0 0 20px; }
    .cta-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 48px; font-weight: 700;
      max-width: 400px; margin: 0 auto;
    }

    @media (min-width: 768px) {
      .block { padding: 40px 32px; }
      .section-title { font-size: 26px; }
      .tech-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class AboutPage {
  constructor(public auth: AuthService) {}

  features = [
    { icon: 'grid-outline',        title: 'Browse Services',      desc: 'Explore the full dental services catalog with prices and duration.' },
    { icon: 'calendar-outline',    title: 'Book Instantly',       desc: 'Pick a date, choose a time slot, and confirm in seconds.' },
    { icon: 'card-outline',        title: 'Pay Online or at Clinic', desc: 'Choose to pay when you book, or settle at the clinic after your visit.' },
    { icon: 'time-outline',        title: 'Track Appointments',   desc: 'See upcoming visits and past treatments in one place.' },
    { icon: 'medical-outline',     title: 'Treatment History',    desc: 'Access notes from your dentist after each completed visit.' },
    { icon: 'star-outline',        title: 'Rate Your Visit',      desc: 'Leave reviews for services you have experienced.' }
  ];

  tech = [
    { name: 'Angular 20',    role: 'Frontend framework' },
    { name: 'Ionic 8',       role: 'Mobile UI library' },
    { name: 'Node.js',       role: 'Backend runtime' },
    { name: 'Express',       role: 'API framework' },
    { name: 'Supabase',      role: 'Database + Storage' },
    { name: 'Capacitor',     role: 'Native mobile shell' }
  ];
}