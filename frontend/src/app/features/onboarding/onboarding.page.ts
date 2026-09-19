import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BannersApi, Banner } from '../../core/banners.service';
import { ChatWidgetComponent } from '../../shared/chatbot/chat-widget.component';
import {
  IonContent, IonButton, IonIcon
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [CommonModule, RouterLink, IonContent, IonButton, IonIcon, ChatWidgetComponent],
  template: `
    <!-- ================= FLOATING TOP BAR (outside ion-content) ================= -->
    <div class="top-bar" [class.scrolled]="scrolled()" [class.hidden]="hidden()">
      <div class="top-brand">
        <span class="tb-ea">EA</span><span class="tb-smile">smile</span>
      </div>
      <div class="top-actions">
        <button type="button" class="tb-btn ghost" (click)="goLogin()">Log In</button>
        <button type="button" class="tb-btn primary" (click)="goRegister()">Sign Up</button>
      </div>
    </div>

    <ion-content class="bg" [fullscreen]="true" [scrollEvents]="true" (ionScroll)="onContentScroll($event)">

      <!-- ================= HERO ================= -->
      <section class="hero">
        @for (b of heroBanners(); track b.id) {
          <div
            class="hero-photo"
            [class.active]="$index === activeSlide()"
            [style.background-image]="'url(' + b.image_url + ')'">
          </div>
        }
        <div class="hero-overlay"></div>

        <div class="hero-content">
          <div class="brand-badge">
            <span class="badge-ea">EA</span><span class="badge-smile">smile</span>
          </div>
          @if (activeBanner(); as b) {
            <h1 class="hero-title">
              {{ b.title }}@if (b.subtitle) {<br/>}{{ b.subtitle }}
            </h1>
            @if (b.description) {
              <p class="hero-sub">{{ b.description }}</p>
            }

            @if (b.link_url) {
              <ion-button class="hero-cta" [routerLink]="b.link_url">
                {{ b.button_text || 'Learn More' }}
                <ion-icon slot="end" name="arrow-forward-outline"></ion-icon>
              </ion-button>
            } @else {
              <ion-button class="hero-cta" (click)="scrollToStory()">
                {{ b.button_text || 'Discover More' }}
                <ion-icon slot="end" name="arrow-down-outline"></ion-icon>
              </ion-button>
            }
          }

          <div class="dots">
            @for (b of heroBanners(); track b.id) {
              <button
                type="button"
                class="dot"
                [class.active]="$index === activeSlide()"
                (click)="goToSlide($index)">
              </button>
            }
          </div>
        </div>
      </section>

      <!-- ================= OUR STORY ================= -->
      <section class="story">
        <div class="section-eyebrow">Established 2024</div>
        <h2 class="section-title">Our Story</h2>
        <p class="body-text">
          EAsmile was created with one goal in mind: to make finding and booking dental care
          as easy as opening an app. We saw how frustrating it was for patients to call
          clinics, wait on hold, and juggle schedules — so we built a platform where you
          can explore services, book in seconds, and manage your dental health from anywhere.
        </p>
        <p class="body-text">
          Today, we work with trusted dental professionals to provide high-quality,
          accessible, and modern dental care for our community. Whether it's a routine
          check-up or a complete smile makeover, EAsmile is here for every step.
        </p>
      </section>

      <!-- ================= MISSION / VISION ================= -->
      <section class="mv">
        <div class="mv-card">
          <div class="mv-icon mission">
            <ion-icon name="flag-outline"></ion-icon>
          </div>
          <h3>Mission</h3>
          <p>To make dental care more accessible by connecting patients with trusted
             professionals through a modern, easy-to-use platform.</p>
        </div>

        <div class="mv-card">
          <div class="mv-icon vision">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
          <h3>Vision</h3>
          <p>To become the trusted platform that makes quality dental care simple,
             transparent, and accessible for everyone.</p>
        </div>
      </section>

      <!-- ================= SERVICES ================= -->
      <section class="services">
        <div class="section-eyebrow">What We Offer</div>
        <h2 class="section-title">Our Services</h2>

        <div class="service-grid">
          @for (s of services; track s.name) {
            <div class="service-card">
              <div class="service-img" [style.background-image]="'url(' + s.image + ')'"></div>
              <div class="service-label">{{ s.name }}</div>
            </div>
          }
        </div>
      </section>

      <!-- ================= CONTACT ================= -->
      <section class="contact">
        <div class="section-eyebrow">Get in Touch</div>
        <h2 class="section-title">Contact Us</h2>
        <p class="body-text">
          Feel free to ask questions or give a feedback from your experience.
          We always provide aid with a smile!
        </p>

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
            <div class="contact-icon"><ion-icon name="logo-instagram"></ion-icon></div>
            <div class="contact-text">
              <div class="contact-label">Instagram</div>
              <div class="contact-value">&#64;easmile_08</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon"><ion-icon name="location-outline"></ion-icon></div>
            <div class="contact-text">
              <div class="contact-label">Address</div>
              <div class="contact-value">938 Aurora Blvd, Cubao, Quezon City, Metro Manila</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= TEAM ================= -->
      <section class="team">
        <div class="section-eyebrow">The People Behind EAsmile</div>
        <h2 class="section-title">Our Team</h2>

        <div class="team-grid">
          @for (m of team; track m.name) {
            <div class="team-card">
              <div class="team-photo" [style.background-image]="'url(' + m.photo + ')'"></div>
              <div class="team-name">{{ m.name }}</div>
              <div class="team-role">{{ m.role }}</div>
            </div>
          }
        </div>
      </section>

      <!-- ================= CTA ================= -->
      <section class="cta">
        <h2 class="cta-title">Ready to book your visit?</h2>
        <p class="cta-sub">Create your free account in under a minute.</p>

        <ion-button expand="block" class="cta-primary" (click)="goRegister()">
          Get Started
        </ion-button>
        <ion-button expand="block" fill="outline" class="cta-outline" (click)="goLogin()">
          I already have an account
        </ion-button>

        <p class="cta-foot">© 2024 EAsmile Dental Clinic</p>
      </section>

    </ion-content>

    <app-chat-widget></app-chat-widget>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }

    .bg { --background: #ffffff; --color: #0A1E29; }

    /* ============ FLOATING TOP BAR ============ */
    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: transparent;
      transition: background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease, transform 0.35s ease;
      pointer-events: none;
      transform: translateY(0);
    }
    .top-bar.hidden {
      transform: translateY(-110%);
      pointer-events: none;
    }
    .top-bar.scrolled {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 1px 0 rgba(10,30,41,0.06), 0 4px 14px rgba(10,30,41,0.05);
    }
    .top-bar > * { pointer-events: auto; }

    .top-brand {
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
      color: #ffffff;
      transition: color 0.3s ease;
    }
    .top-bar.scrolled .top-brand { color: #0A1E29; }
    .tb-ea { color: #ffffff; transition: color 0.3s; }
    .tb-smile { color: #93D5ED; transition: color 0.3s; }
    .top-bar.scrolled .tb-ea { color: #2E9FE0; }
    .top-bar.scrolled .tb-smile { color: #5BAFE0; }
    .top-actions { display: flex; gap: 8px; align-items: center; }
    .tb-btn {
      border: 0;
      border-radius: 9999px;
      padding: 9px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.2px;
    }
    .tb-btn.ghost {
      background: rgba(255,255,255,0.15);
      color: #ffffff;
      border: 1.5px solid rgba(255,255,255,0.5);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .tb-btn.ghost:hover { background: rgba(255,255,255,0.28); }
    .tb-btn.primary { background: #4EBE7D; color: #ffffff; }
    .tb-btn.primary:hover { background: #3ea66b; }
    .top-bar.scrolled .tb-btn.ghost {
      background: #ffffff;
      color: #0A1E29;
      border-color: #e6eef5;
    }
    .top-bar.scrolled .tb-btn.ghost:hover { background: #f2f8fc; }
    @media (min-width: 768px) {
      .top-bar { padding: 18px 32px; }
      .top-brand { font-size: 22px; }
      .tb-btn { padding: 10px 22px; font-size: 14px; }
    }
    @media (min-width: 1200px) {
      .top-bar { padding: 20px 60px; }
      .top-brand { font-size: 24px; }
    }

    /* ============ HERO ============ */
    .hero {
      position: relative;
      height: 100vh;
      min-height: 620px;
      max-height: 900px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .hero-photo {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1.2s ease-in-out;
      will-change: opacity;
    }
    .hero-photo.active { opacity: 1; }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(10,30,41,0.10) 0%, rgba(10,30,41,0.80) 100%);
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      padding: 0 28px 56px;
      color: #ffffff;
    }
    .brand-badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255,255,255,0.18);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 9999px;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.5px;
      margin-bottom: 18px;
    }
    .badge-ea    { color: #93D5ED; }
    .badge-smile { color: #ffffff; }

    .hero-title {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.05;
      margin: 0 0 14px;
      letter-spacing: -0.5px;
    }
    .hero-sub {
      font-size: 15px;
      line-height: 1.5;
      margin: 0 0 22px;
      opacity: 0.92;
    }
    .hero-cta {
      --background: #4EBE7D;
      --background-activated: #3ea66b;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 48px;
      font-weight: 600;
    }

    /* Slideshow dots */
    .dots {
      display: flex;
      gap: 8px;
      margin-top: 26px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 0;
      background: rgba(255,255,255,0.4);
      cursor: pointer;
      padding: 0;
      transition: all 0.25s;
    }
    .dot.active {
      width: 28px;
      border-radius: 9999px;
      background: #ffffff;
    }

    /* ============ SECTIONS ============ */
    section:not(.hero) {
      padding: 48px 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    section.hero {
      max-width: none;
      margin: 0;
      padding: 0;
    }
    .section-eyebrow {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4EBE7D;
      margin-bottom: 6px;
    }
    .section-title {
      font-size: 28px;
      font-weight: 800;
      color: #0A1E29;
      margin: 0 0 18px;
      letter-spacing: -0.5px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.65;
      color: #4a6272;
      margin: 0 0 14px;
    }

    /* ============ STORY ============ */
    .story { padding-top: 56px; }

    /* ============ MISSION / VISION ============ */
    .mv {
      padding-top: 12px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .mv-card {
      background: #f2f8fc;
      border-radius: 20px;
      padding: 24px;
    }
    .mv-icon {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: grid; place-items: center;
      font-size: 22px;
      margin-bottom: 14px;
    }
    .mv-icon.mission { background: #d7f0e0; color: #1e6b3d; }
    .mv-icon.vision  { background: #ece0ff; color: #5a3d8a; }
    .mv-card h3 {
      font-size: 17px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #0A1E29;
    }
    .mv-card p {
      font-size: 14px;
      line-height: 1.55;
      color: #4a6272;
      margin: 0;
    }

    /* ============ SERVICES ============ */
    .service-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .service-card {
      border-radius: 18px;
      overflow: hidden;
      background: #f2f8fc;
      position: relative;
      aspect-ratio: 1 / 1;
      transition: transform 0.25s ease;
    }
    .service-card:hover { transform: translateY(-3px); }
    .service-img {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
    }
    .service-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(10,30,41,0.75) 100%);
    }
    .service-label {
      position: absolute;
      bottom: 12px;
      left: 14px;
      right: 14px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      z-index: 1;
    }

    /* ============ CONTACT ============ */
    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }
    .contact-item {
      display: flex;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
      background: #f2f8fc;
      border-radius: 16px;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }
    .contact-item:hover { background: #e6f4fb; }
    .contact-icon {
      width: 42px; height: 42px;
      border-radius: 12px;
      background: #ffffff;
      color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 20px;
      flex: 0 0 auto;
    }
    .contact-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7a8a97;
      font-weight: 600;
    }
    .contact-value {
      font-size: 14px;
      font-weight: 600;
      color: #0A1E29;
      margin-top: 2px;
      word-break: break-word;
    }

    /* ============ TEAM ============ */
    .team-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .team-card {
      background: #f2f8fc;
      border-radius: 18px;
      padding: 16px;
      text-align: center;
      transition: transform 0.25s ease;
    }
    .team-card:hover { transform: translateY(-3px); }
    .team-photo {
      width: 72px; height: 72px;
      border-radius: 50%;
      margin: 0 auto 10px;
      background-size: cover;
      background-position: center;
      background-color: #d9f0fb;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(10,30,41,0.08);
    }
    .team-name {
      font-size: 13px;
      font-weight: 700;
      color: #0A1E29;
      line-height: 1.25;
    }
    .team-role {
      font-size: 11px;
      color: #7a8a97;
      margin-top: 3px;
    }

    /* ============ CTA ============ */
    .cta {
      padding: 48px 24px 56px;
      text-align: center;
      background: linear-gradient(180deg, #ffffff 0%, #e6f4fb 100%);
      max-width: none;
    }
    .cta-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 8px;
      color: #0A1E29;
    }
    .cta-sub {
      font-size: 14px;
      color: #4a6272;
      margin: 0 0 24px;
    }
    .cta-primary {
      --background: #0A1E29;
      --background-activated: #142635;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 50px;
      font-weight: 600;
      margin-bottom: 10px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .cta-outline {
      --border-color: #0A1E29;
      --color: #0A1E29;
      --border-radius: 9999px;
      --border-width: 1.5px;
      height: 50px;
      font-weight: 600;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .cta-foot {
      font-size: 11px;
      color: #7a8a97;
      margin: 22px 0 0;
    }

    /* ============================================
       DESKTOP BREAKPOINTS
       ============================================ */
    @media (min-width: 768px) {
      .hero-content { max-width: 640px; padding: 0 40px 72px; }
      .hero-title { font-size: 52px; }

      section:not(.hero) { padding: 72px 40px; max-width: 1000px; }
      .section-title { font-size: 34px; }
      .body-text { font-size: 16px; }

      .mv { grid-template-columns: 1fr 1fr; gap: 22px; padding-top: 24px; }

      .service-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }

      .contact-list { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

      .team-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
      .team-photo { width: 84px; height: 84px; }

      .cta { padding: 72px 40px 80px; }
      .cta-title { font-size: 30px; }
    }

    @media (min-width: 1200px) {
      .hero-content { max-width: 1180px; padding: 0 60px 96px; }
      .hero-title { font-size: 64px; }
      .hero-sub { font-size: 17px; max-width: 520px; }

      section:not(.hero) { padding: 96px 60px; max-width: 1180px; }
      .section-title { font-size: 40px; }
      .body-text { font-size: 17px; line-height: 1.75; }

      .story .body-text { max-width: 780px; }

      .service-grid { gap: 20px; }
      .service-label { font-size: 16px; }

      .team-grid { gap: 20px; }
      .team-name { font-size: 14px; }
      .team-role { font-size: 12px; }

      .contact-item { padding: 18px 20px; }
      .contact-value { font-size: 15px; }

      .cta { padding: 96px 60px 120px; }
      .cta-title { font-size: 36px; }
      .cta-sub { font-size: 16px; }
    }
  `]
})
export class OnboardingPage implements OnInit, OnDestroy {
  private readonly FALLBACK_BANNERS: Banner[] = [
    {
      id: 'fallback-1', title: 'Take Care of', subtitle: 'Your Smile',
      description: 'Find the dental care you need and discover services that help you maintain a healthy, confident smile.',
      image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80', link_url: null,
      button_text: 'Discover More', position: 'hero', order: 0, is_active: true, start_date: null, end_date: null, created_at: '', updated_at: ''
    },
    {
      id: 'fallback-2', title: 'Find the Right', subtitle: 'Care for You',
      description: 'Browse available dental services, learn what each treatment offers, and choose the care that fits your needs.',
      image_url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1600&q=80', link_url: null,
      button_text: 'Get Started', position: 'hero', order: 1, is_active: true, start_date: null, end_date: null, created_at: '', updated_at: ''
    },
    {
      id: 'fallback-3', title: 'Your Smile,', subtitle: 'Our Priority',
      description: 'Trusted professionals, modern equipment, and a team that cares about your comfort.',
      image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1600&q=80', link_url: null,
      button_text: 'Discover More', position: 'hero', order: 2, is_active: true, start_date: null, end_date: null, created_at: '', updated_at: ''
    },
    {
      id: 'fallback-4', title: 'Book With', subtitle: 'Ease',
      description: 'Find a slot, confirm, and get reminded — all in a few taps.',
      image_url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1600&q=80', link_url: null,
      button_text: 'Book Now', position: 'hero', order: 3, is_active: true, start_date: null, end_date: null, created_at: '', updated_at: ''
    }
  ];

  heroBanners = signal<Banner[]>(this.FALLBACK_BANNERS);
  activeBanner = computed(() => {
    const list = this.heroBanners();
    if (!list.length) return null;
    return list[this.activeSlide() % list.length];
  });

  activeSlide = signal(0);
  scrolled = signal(false);
  private slidesLoaded = false;
  hidden = signal(false);
  private slideTimer?: any;
  private lastScrollY = 0;

  services = [
    { name: 'Check Up',        image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80' },
    { name: 'Cleaning',        image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80' },
    { name: 'Whitening',       image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80' },
    { name: 'Fillings',        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80' },
    { name: 'Tooth Extraction',image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80' },
    { name: 'Orthodontics',    image: 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=600&q=80' }
  ];

  team = [
    { name: 'Duran, Kevin Rio',     role: 'Lead Backend Developer',  photo: 'https://ui-avatars.com/api/?name=Kevin+Rio+Duran&background=0A1E29&color=ffffff&bold=true&size=200' },
    { name: 'Marbella, Aelous M.',  role: 'Lead Frontend Developer', photo: 'https://ui-avatars.com/api/?name=Aelous+Marbella&background=4EBE7D&color=ffffff&bold=true&size=200' },
    { name: 'Marbero, John Carlo',  role: 'Backend Developer',       photo: 'https://ui-avatars.com/api/?name=John+Carlo&background=93D5ED&color=0A1E29&bold=true&size=200' },
    { name: 'Reyes, Mariane E.',    role: 'Lead Frontend Designer',  photo: 'https://ui-avatars.com/api/?name=Mariane+Reyes&background=D397F8&color=ffffff&bold=true&size=200' },
    { name: 'Roxas, Ardee P.',      role: 'Frontend Designer / Dev', photo: 'https://ui-avatars.com/api/?name=Ardee+Roxas&background=F89B67&color=ffffff&bold=true&size=200' }
  ];

  constructor(private router: Router, private bannersApi: BannersApi) {}

  async ngOnInit() {
    this.slideTimer = setInterval(() => {
      this.activeSlide.update(i => (i + 1) % this.heroBanners().length);
    }, 5000);

    try {
      const banners = await this.bannersApi.listActive('hero');
      if (banners.length) {
        this.heroBanners.set(banners);
        this.activeSlide.set(0);
        clearInterval(this.slideTimer);
        this.slideTimer = setInterval(() => {
          this.activeSlide.update(i => (i + 1) % this.heroBanners().length);
        }, 5000);
      }
    } catch {
      // keep fallback
    }
  }

  onContentScroll(ev: CustomEvent) {
    const detail = ev.detail as { scrollTop: number; deltaY: number };
    const y = detail.scrollTop;
    const delta = detail.deltaY;
    const threshold = 60;

    this.scrolled.set(y > threshold);

    if (y > threshold && delta > 4) {
      this.hidden.set(true);
    } else if (delta < -4) {
      this.hidden.set(false);
    }
  }

  ngOnDestroy() {
    clearInterval(this.slideTimer);
  }

  goToSlide(index: number) {
    this.activeSlide.set(index);
    clearInterval(this.slideTimer);
    this.slideTimer = setInterval(() => {
      this.activeSlide.update(i => (i + 1) % this.heroBanners().length);
    }, 5000);
  }

  scrollToStory() {
    const story = document.querySelector('.story');
    story?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goRegister() {
    this.router.navigateByUrl('/register', { replaceUrl: true });
  }
}