import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-terms',
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/" text=""></ion-back-button>
        </ion-buttons>
        <ion-title class="brand">Terms & Conditions</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bg">
      <div class="wrap">
        <h1>Terms & Conditions</h1>
        <p>Last updated: October 2026</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using EAsmile, you accept and agree to be bound by these terms. If you do not agree, please do not use the service.</p>
        
        <h2>2. Booking & Cancellations</h2>
        <p>Appointments can be rescheduled up to 2 times, and at least 24 hours before the scheduled time. For urgent or last-minute changes, please contact the clinic directly and our staff will do their best to accommodate you.</p>
        
        <h2>3. Payments</h2>
        <p>Payments made online are simulated for demonstration purposes. Actual payment for services is handled at the clinic.</p>
        
        <h2>4. Use of Services</h2>
        <p>You agree to provide accurate information during registration and booking. EAsmile is not responsible for medical emergencies; please call emergency services if needed.</p>
        
        <p style="margin-top: 40px; text-align: center;">
          <a routerLink="/onboarding">← Back to Home</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #f2f8fc; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 16px; }
    .bg { --background: #ffffff; color: #0A1E29; }
    .wrap { max-width: 800px; margin: 0 auto; padding: 30px 20px; }
    h1 { font-size: 28px; font-weight: 800; color: #0A1E29; margin-bottom: 4px; }
    p { font-size: 14px; color: #4a6272; line-height: 1.6; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 700; color: #0A1E29; margin-top: 32px; margin-bottom: 8px; }
    a { color: #4EBE7D; font-weight: 600; text-decoration: none; }
  `]
})
export class TermsPage {}