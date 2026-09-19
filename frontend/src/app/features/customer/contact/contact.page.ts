import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner, IonItem, IonInput, IonTextarea,
  ToastController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FaqsApi, Faq } from '../../../core/faqs.service';

@Component({
  standalone: true,
  selector: 'app-contact',
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

      <section class="hero">
        <div class="hero-icon">
          <ion-icon name="chatbubbles-outline"></ion-icon>
        </div>
        <h1>We're here to help</h1>
        <p>Questions, feedback, or concerns — reach out anytime.</p>
      </section>

      <section class="block">
        <h2 class="section-title">Get in Touch</h2>
        <div class="contact-list">
          <a class="contact-item" href="mailto:easmile.08@email.com">
            <div class="contact-icon"><ion-icon name="mail-outline"></ion-icon></div>
            <div class="contact-text">
              <div class="contact-label">Email</div>
              <div class="contact-value">easmile.08&#64;email.com</div>
            </div>
          </a>
          <a class="contact-item" href="tel:+631234567890">
            <div class="contact-icon"><ion-icon name="call-outline"></ion-icon></div>
            <div class="contact-text">
              <div class="contact-label">Phone</div>
              <div class="contact-value">+63 123 456 7890</div>
            </div>
          </a>
          <div class="contact-item">
            <div class="contact-icon"><ion-icon name="location-outline"></ion-icon></div>
            <div class="contact-text">
              <div class="contact-label">Address</div>
              <div class="contact-value">938 Aurora Blvd, Cubao, Quezon City, Metro Manila</div>
            </div>
          </div>
        </div>
      </section>

      <section class="block">
        <h2 class="section-title">Send us a message</h2>
        <p class="section-sub">We usually respond within 24 hours on weekdays.</p>

        <div class="field-group">
          <label class="field-label">Name</label>
          <ion-item lines="none" class="field">
            <ion-input [(ngModel)]="name" placeholder="Your full name" [disabled]="sending()"></ion-input>
          </ion-item>
        </div>
        <div class="field-group">
          <label class="field-label">Email</label>
          <ion-item lines="none" class="field">
            <ion-input type="email" [(ngModel)]="email" placeholder="you@example.com" [disabled]="sending()"></ion-input>
          </ion-item>
        </div>
        <div class="field-group">
          <label class="field-label">Subject <span class="optional">(optional)</span></label>
          <ion-item lines="none" class="field">
            <ion-input [(ngModel)]="subject" placeholder="What's this about?" [disabled]="sending()"></ion-input>
          </ion-item>
        </div>
        <div class="field-group">
          <label class="field-label">Message</label>
          <ion-item lines="none" class="field field-textarea">
            <ion-textarea
              [(ngModel)]="message"
              placeholder="Type your message here..."
              [autoGrow]="true"
              rows="5"
              [disabled]="sending()">
            </ion-textarea>
          </ion-item>
        </div>

        @if (error()) {
          <div class="err-box">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>{{ error() }}</span>
          </div>
        }

        <ion-button expand="block" class="submit-btn" (click)="submit()" [disabled]="sending()">
          @if (sending()) {
            <ion-spinner name="crescent"></ion-spinner>
          } @else {
            Send Message
            <ion-icon slot="end" name="send-outline"></ion-icon>
          }
        </ion-button>
      </section>

      <section class="block faq-block">
        <h2 class="section-title">Frequently Asked Questions</h2>

        @if (faqsLoading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!faqs().length) {
          <p class="empty-faqs">No FAQs available right now.</p>
        } @else {
          @for (f of faqs(); track f.id) {
            <div class="faq-item" [class.open]="openFaq() === f.id">
              <button type="button" class="faq-question" (click)="toggleFaq(f.id)">
                <span>{{ f.question }}</span>
                <ion-icon [name]="openFaq() === f.id ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
              </button>
              @if (openFaq() === f.id) {
                <div class="faq-answer">{{ f.answer }}</div>
              }
            </div>
          }
        }
      </section>

    </ion-content>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .hero {
      background: #e6f4fb;
      padding: 32px 24px 28px;
      text-align: center;
      border-radius: 0 0 24px 24px;
    }
    .hero-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 30px;
      margin: 0 auto 14px;
    }
    .hero h1 { font-size: 22px; font-weight: 800; color: #0A1E29; margin: 0 0 6px; letter-spacing: -0.5px; }
    .hero p { font-size: 13px; color: #4a6272; margin: 0; line-height: 1.5; }

    .block { padding: 24px 20px 0; }
    .section-title { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 10px; }
    .section-sub { font-size: 12px; color: #7a8a97; margin: 0 0 14px; }

    .contact-list { display: flex; flex-direction: column; gap: 10px; }
    .contact-item {
      display: flex; gap: 14px; align-items: center;
      padding: 12px 14px; background: #f2f8fc;
      border-radius: 14px; text-decoration: none; color: inherit;
      transition: background 0.15s;
    }
    .contact-item:hover { background: #e6f4fb; }
    .contact-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 18px; flex: 0 0 auto;
    }
    .contact-label {
      font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.5px; color: #7a8a97; font-weight: 600;
    }
    .contact-value { font-size: 13px; font-weight: 600; color: #0A1E29; margin-top: 2px; }

    .field-group { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #0A1E29; margin: 0 0 8px 4px; letter-spacing: 0.3px;
    }
    .field-label .optional { color: #7a8a97; font-weight: 500; font-size: 11px; }

    .field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 14px;
      --color: #0A1E29;
      --min-height: 48px;
      border-radius: 14px;
      border: 1px solid #e6eef5;
    }
    .field:focus-within { border-color: #4EBE7D; background: #ffffff; }
    .field ion-input,
    .field ion-textarea {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 14px;
      --color: #0A1E29;
    }
    .field-textarea { --min-height: 100px; align-items: flex-start; padding: 6px 0; }

    .err-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; background: #ffe0e0;
      border-radius: 12px; color: #8a1a1a;
      font-size: 13px; font-weight: 600;
      margin-bottom: 14px;
    }
    .err-box ion-icon { font-size: 18px; flex: 0 0 auto; }

    .submit-btn {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      --color-disabled: #ffffff;
      height: 50px; font-weight: 700; font-size: 14px; margin-top: 4px;
    }
    .submit-btn::part(native) { color: #ffffff; }

    .faq-block { padding-bottom: 40px; }
    .faq-item {
      background: #f7fafc; border-radius: 14px;
      margin-bottom: 10px; overflow: hidden;
      transition: background 0.15s;
    }
    .faq-item.open { background: #f0f9f4; }
    .faq-question {
      width: 100%; display: flex; justify-content: space-between;
      align-items: center; gap: 12px;
      padding: 14px 16px;
      border: 0; background: transparent;
      color: #0A1E29; font-size: 14px; font-weight: 600;
      text-align: left; cursor: pointer; font-family: inherit;
    }
    .faq-question ion-icon { font-size: 18px; color: #7a8a97; flex: 0 0 auto; }
    .faq-item.open .faq-question ion-icon { color: #4EBE7D; }
    .faq-answer {
      padding: 0 16px 14px;
      font-size: 13px; color: #4a6272; line-height: 1.55;
    }
    .loading { display: grid; place-items: center; padding: 40px; }
    .empty-faqs { font-size: 13px; color: #7a8a97; text-align: center; padding: 24px; }
  `]
})
export class ContactPage implements OnInit {
  name = '';
  email = '';
  subject = '';
  message = '';

  sending = signal(false);
  error = signal<string | null>(null);

  faqs = signal<Faq[]>([]);
  faqsLoading = signal(true);
  openFaq = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private faqsApi: FaqsApi,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    try {
      const list = await this.faqsApi.listActive();
      this.faqs.set(list);
    } catch {
      this.faqs.set([]);
    } finally {
      this.faqsLoading.set(false);
    }
  }

  toggleFaq(id: string) {
    this.openFaq.update(current => current === id ? null : id);
  }

  async submit() {
    this.error.set(null);
    if (!this.name.trim()) { this.error.set('Please enter your name'); return; }
    if (!this.email.trim()) { this.error.set('Please enter your email'); return; }
    if (!this.message.trim()) { this.error.set('Please enter a message'); return; }

    this.sending.set(true);
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/contact`, {
          name: this.name.trim(),
          email: this.email.trim(),
          subject: this.subject.trim() || undefined,
          message: this.message.trim()
        })
      );

      const t = await this.toastCtrl.create({
        message: 'Message sent! We\'ll get back to you soon.',
        duration: 2200, position: 'bottom', color: 'success'
      });
      await t.present();

      this.name = '';
      this.email = '';
      this.subject = '';
      this.message = '';
    } catch (e: any) {
      this.error.set(e?.error?.error || 'Failed to send. Please try again.');
    } finally {
      this.sending.set(false);
    }
  }
}