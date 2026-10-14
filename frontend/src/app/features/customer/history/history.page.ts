import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonBackButton, IonContent
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth.service';

interface Milestone {
  year: string;
  title: string;
  body: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-history',
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

      <section class="hero">
        <div class="hero-img">
          <div class="hero-overlay"></div>
          <div class="hero-text">
            <div class="eyebrow">ESTABLISHED 2024</div>
            <h1>Our Story</h1>
            <p>A story of caring for smiles, one patient at a time.</p>
          </div>
        </div>
      </section>

      <section class="block">
        <p class="lead">
          EAsmile was born from a simple idea: finding and booking dental care should be
          as easy as opening an app. We saw how frustrating it was for patients to call
          clinics, wait on hold, and juggle schedules — so we built a platform where you
          can explore services, book in seconds, and manage your dental health from anywhere.
        </p>
        <p class="body">
          Today, we work with trusted dental professionals to provide high-quality,
          accessible, and modern dental care for our community. Whether it's a routine
          check-up or a complete smile makeover, EAsmile is here for every step.
        </p>
      </section>

      <section class="block">
        <div class="section-eyebrow">Our Journey</div>
        <h2 class="section-title">Milestones</h2>

        <div class="timeline">
          @for (m of milestones; track m.year) {
            <div class="milestone">
              <div class="ms-icon">
                <ion-icon [name]="m.icon"></ion-icon>
              </div>
              <div class="ms-body">
                <div class="ms-year">{{ m.year }}</div>
                <div class="ms-title">{{ m.title }}</div>
                <div class="ms-text">{{ m.body }}</div>
              </div>
            </div>
          }
        </div>
      </section>

      <section class="block">
        <div class="section-eyebrow">What Drives Us</div>
        <h2 class="section-title">Mission &amp; Vision</h2>

        <div class="mv-card">
          <div class="mv-icon mission">
            <ion-icon name="flag-outline"></ion-icon>
          </div>
          <div class="mv-text">
            <h3>Mission</h3>
            <p>To make dental care more accessible by connecting patients with trusted
               professionals through a modern, easy-to-use platform.</p>
          </div>
        </div>

        <div class="mv-card">
          <div class="mv-icon vision">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
          <div class="mv-text">
            <h3>Vision</h3>
            <p>To become the trusted platform that makes quality dental care simple,
               transparent, and accessible for everyone.</p>
          </div>
        </div>
      </section>

      <section class="block">
        <div class="section-eyebrow">What We Believe</div>
        <h2 class="section-title">Our Values</h2>

        <div class="values-grid">
          @for (v of values; track v.title) {
            <div class="value-card">
              <div class="v-icon">
                <ion-icon [name]="v.icon"></ion-icon>
              </div>
              <div class="v-title">{{ v.title }}</div>
              <div class="v-desc">{{ v.desc }}</div>
            </div>
          }
        </div>
      </section>

      <section class="cta">
        <h2 class="cta-title">Be part of our story</h2>
        <p class="cta-sub">Book your first visit today.</p>
        <ion-button expand="block" class="cta-btn" routerLink="/services">
          <ion-icon slot="start" name="grid-outline"></ion-icon>
          Browse Services
        </ion-button>
      </section>

    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .hero { padding: 0 0 8px; }
    .hero-img {
      position: relative;
      aspect-ratio: 16 / 9;
      background-image: url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80');
      background-size: cover;
      background-position: center;
      background-color: #0A1E29;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(10,30,41,0.15) 0%, rgba(10,30,41,0.82) 100%);
    }
    .hero-text {
      position: absolute;
      bottom: 24px;
      left: 24px;
      right: 24px;
      color: #ffffff;
    }
    .eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #4EBE7D;
      margin-bottom: 8px;
    }
    .hero-text h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }
    .hero-text p { font-size: 13px; margin: 0; opacity: 0.9; }

    .block { padding: 28px 24px; max-width: 720px; margin: 0 auto; }
    .section-eyebrow {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #4EBE7D; margin-bottom: 6px;
    }
    .section-title {
      font-size: 24px; font-weight: 800; color: #0A1E29;
      margin: 0 0 18px; letter-spacing: -0.5px;
    }
    .lead {
      font-size: 15px; line-height: 1.7; color: #0A1E29;
      margin: 0 0 14px; font-weight: 500;
    }
    .body { font-size: 14px; line-height: 1.7; color: #4a6272; margin: 0; }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      padding-left: 10px;
    }
    .milestone {
      display: flex;
      gap: 16px;
      padding-bottom: 24px;
      position: relative;
    }
    .milestone:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 44px;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #4EBE7D 0%, #d7f0e0 100%);
    }
    .ms-icon {
      width: 42px; height: 42px; border-radius: 50%;
      background: #4EBE7D; color: #ffffff;
      display: grid; place-items: center;
      font-size: 20px; flex: 0 0 auto;
      position: relative; z-index: 1;
      box-shadow: 0 4px 12px rgba(78,190,125,0.3);
    }
    .ms-body { flex: 1; padding-top: 6px; }
    .ms-year {
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      color: #4EBE7D; text-transform: uppercase; margin-bottom: 4px;
    }
    .ms-title { font-size: 16px; font-weight: 700; color: #0A1E29; margin-bottom: 6px; }
    .ms-text { font-size: 13.5px; color: #4a6272; line-height: 1.55; }

    .mv-card {
      display: flex; gap: 16px;
      padding: 18px;
      background: #f2f8fc;
      border-radius: 16px;
      margin-bottom: 14px;
    }
    .mv-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: grid; place-items: center;
      font-size: 24px; flex: 0 0 auto;
    }
    .mv-icon.mission { background: #d7f0e0; color: #1e6b3d; }
    .mv-icon.vision  { background: #ece0ff; color: #5a3d8a; }
    .mv-text h3 { font-size: 16px; font-weight: 700; color: #0A1E29; margin: 0 0 6px; }
    .mv-text p { font-size: 13.5px; line-height: 1.55; color: #4a6272; margin: 0; }

    .values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .value-card {
      background: #ffffff;
      border: 1px solid #e6eef5;
      border-radius: 14px;
      padding: 16px;
    }
    .v-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 18px; margin-bottom: 10px;
    }
    .v-title { font-size: 13px; font-weight: 700; color: #0A1E29; margin-bottom: 4px; }
    .v-desc { font-size: 11.5px; color: #7a8a97; line-height: 1.4; }

    .cta {
      padding: 32px 24px 48px; text-align: center;
      background: linear-gradient(180deg, #ffffff 0%, #e6f4fb 100%);
    }
    .cta-title { font-size: 22px; font-weight: 800; color: #0A1E29; margin: 0 0 6px; }
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
      .hero-text h1 { font-size: 42px; }
      .block { padding: 40px 32px; }
      .section-title { font-size: 28px; }
      .values-grid { grid-template-columns: repeat(4, 1fr); }
    }
  `]
})
export class HistoryPage {
  constructor(public auth: AuthService) {}

  milestones: Milestone[] = [
    {
      year: '2024',
      title: 'The Idea',
      body: 'EAsmile was conceived to solve a common frustration — booking dental appointments should not require phone calls, waiting on hold, or a dozen back-and-forths.',
      icon: 'bulb-outline'
    },
    {
      year: '2024',
      title: 'The Platform',
      body: 'Our platform launched with a mobile-first experience that lets patients browse services, pick a time, and confirm in seconds.',
      icon: 'phone-portrait-outline'
    },
    {
      year: '2024',
      title: 'Trusted Partners',
      body: 'We built a network of licensed dental professionals committed to modern, accessible, and high-quality care.',
      icon: 'ribbon-outline'
    },
    {
      year: '2024',
      title: 'Growing Community',
      body: 'Today, EAsmile is used by patients across Metro Manila to manage their dental health with confidence.',
      icon: 'people-outline'
    }
  ];

  values = [
    { icon: 'heart-outline',            title: 'Care',       desc: 'Every patient, every visit.' },
    { icon: 'shield-checkmark-outline', title: 'Trust',      desc: 'Licensed, verified, transparent.' },
    { icon: 'flash-outline',            title: 'Simplicity', desc: 'Book in seconds, not minutes.' },
    { icon: 'star-outline',             title: 'Quality',    desc: 'Modern equipment, expert hands.' }
  ];
}