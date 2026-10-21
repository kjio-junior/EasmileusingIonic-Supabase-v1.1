import { Component, OnInit, OnDestroy, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BannersApi, Banner } from '../../core/banners.service';
import { ServicesApi } from '../../core/services.service';
import { Service } from '../../core/services.service';
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
          @for (s of services(); track s.id) {
            <a class="service-card" [routerLink]="['/services', s.id]">
              <div class="service-img" [style.background-image]="'url(' + imageFor(s) + ')'"></div>
              <div class="service-label">{{ s.name }}</div>
            </a>
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

      <!-- ================= COMPANY HISTORY ================= -->
      <section class="history-section">
        <div class="section-eyebrow">Established 2024</div>
        <h2 class="section-title">Our Journey</h2>

        <div class="timeline">
          <div class="milestone">
            <div class="ms-icon"><ion-icon name="bulb-outline"></ion-icon></div>
            <div class="ms-body">
              <div class="ms-year">2024</div>
              <div class="ms-title">The Idea</div>
              <p>EAsmile was conceived to solve a common frustration — booking dental appointments should not require phone calls or waiting on hold.</p>
            </div>
          </div>
          <div class="milestone">
            <div class="ms-icon"><ion-icon name="phone-portrait-outline"></ion-icon></div>
            <div class="ms-body">
              <div class="ms-year">2024</div>
              <div class="ms-title">The Platform</div>
              <p>Our mobile-first platform launched, letting patients browse services, pick a time, and confirm in seconds.</p>
            </div>
          </div>
          <div class="milestone">
            <div class="ms-icon"><ion-icon name="ribbon-outline"></ion-icon></div>
            <div class="ms-body">
              <div class="ms-year">2024</div>
              <div class="ms-title">Trusted Partners</div>
              <p>We built a network of licensed dental professionals committed to modern, accessible care.</p>
            </div>
          </div>
          <div class="milestone">
            <div class="ms-icon"><ion-icon name="people-outline"></ion-icon></div>
            <div class="ms-body">
              <div class="ms-year">2024</div>
              <div class="ms-title">Growing Community</div>
              <p>Today, EAsmile serves patients across Metro Manila with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= ABOUT THE APP ================= -->
      <section class="about-app">
        <div class="section-eyebrow">About the App</div>
        <h2 class="section-title">What You Can Do</h2>

        <div class="features">
          <div class="feat">
            <div class="feat-icon"><ion-icon name="grid-outline"></ion-icon></div>
            <div class="feat-body">
              <div class="feat-title">Browse Services</div>
              <p>Explore the full catalog with prices and durations.</p>
            </div>
          </div>
          <div class="feat">
            <div class="feat-icon"><ion-icon name="calendar-outline"></ion-icon></div>
            <div class="feat-body">
              <div class="feat-title">Book Instantly</div>
              <p>Pick a date, choose a time slot, confirm in seconds.</p>
            </div>
          </div>
          <div class="feat">
            <div class="feat-icon"><ion-icon name="card-outline"></ion-icon></div>
            <div class="feat-body">
              <div class="feat-title">Pay Online or at Clinic</div>
              <p>Choose to pay when you book, or settle in person.</p>
            </div>
          </div>
          <div class="feat">
            <div class="feat-icon"><ion-icon name="medical-outline"></ion-icon></div>
            <div class="feat-body">
              <div class="feat-title">Treatment History</div>
              <p>Access notes from your dentist after each visit.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= DEVELOPERS ================= -->
      <section class="developers-section">
        <div class="section-eyebrow">The People Behind EAsmile</div>
        <h2 class="section-title">Our Developers</h2>

        @for (team of devTeams; track team.label) {
          <div class="dev-team">
            <div class="dev-team-label">{{ team.label }}</div>
            <div class="dev-scroll">
              @for (d of team.members; track d.name) {
                <div class="dev-card">
                  <div class="dev-photo">
                    <div class="photo-fallback">{{ initials(d.name) }}</div>
                    <img [src]="d.photo" [alt]="d.name" (error)="hideImg($event)" loading="lazy" />
                  </div>
                  <div class="dev-name">{{ d.name }}</div>
                  <div class="dev-role">{{ d.role }}</div>
                </div>
              }
            </div>
          </div>
        }
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
        <div class="legal-footer">
          <a routerLink="/terms">Terms &amp; Conditions</a>
          <span>•</span>
          <a routerLink="/privacy">Privacy Policy</a>
        </div>
      </section>

      <button
        type="button"
        class="scroll-top"
        [class.visible]="showScrollTop()"
        (click)="scrollToTop()"
        aria-label="Back to top">
        <ion-icon name="arrow-up-outline"></ion-icon>
      </button>

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
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .service-card:hover { transform: translateY(-3px); }
    .service-card:active { transform: scale(0.98); }
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

    /* TIMELINE */
    .timeline {
      display: flex;
      flex-direction: column;
      padding-left: 10px;
      margin-top: 8px;
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
    .ms-body p { font-size: 13.5px; color: #4a6272; line-height: 1.55; margin: 0; }

    /* ABOUT THE APP */
    .features { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    .feat {
      display: flex; gap: 14px; align-items: flex-start;
      padding: 14px 16px;
      background: #f2f8fc;
      border-radius: 14px;
    }
    .feat-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center;
      font-size: 20px; flex: 0 0 auto;
    }
    .feat-body { flex: 1; min-width: 0; }
    .feat-title { font-size: 14px; font-weight: 700; color: #0A1E29; margin-bottom: 2px; }
    .feat-body p { font-size: 12.5px; color: #4a6272; line-height: 1.45; margin: 0; }

    .scroll-top {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 300;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 0;
      background: #0A1E29;
      color: #ffffff;
      font-size: 22px;
      cursor: pointer;
      display: grid;
      place-items: center;
      box-shadow: 0 8px 20px rgba(10,30,41,0.25);
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px);
      transition: opacity 0.25s, transform 0.25s;
    }
    .scroll-top.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .scroll-top:hover { background: #142635; }

    /* ============ DEVELOPERS ============ */
    .dev-team { margin-bottom: 28px; }
    .dev-team:last-child { margin-bottom: 0; }

    .dev-team-label {
      font-size: 11px;
      font-weight: 700;
      color: #0A1E29;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 12px;
    }

    .dev-scroll {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding: 4px 4px 16px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .dev-scroll::-webkit-scrollbar { height: 5px; }
    .dev-scroll::-webkit-scrollbar-thumb {
      background: #d0dde7;
      border-radius: 9999px;
    }
    .dev-scroll::-webkit-scrollbar-track { background: transparent; }

    .dev-card {
      flex: 0 0 150px;
      background: #f2f8fc;
      border-radius: 16px;
      padding: 14px 12px;
      scroll-snap-align: start;
      text-align: center;
      transition: transform 0.2s;
    }
    .dev-card:hover { transform: translateY(-3px); }

    .dev-photo {
      position: relative;
      width: 88px;
      height: 88px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto 10px;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(10,30,41,0.08);
      background: #d9f0fb;
    }
    .photo-fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 26px;
      font-weight: 800;
      color: #4EBE7D;
    }
    .dev-photo img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dev-name {
      font-size: 12.5px;
      font-weight: 700;
      color: #0A1E29;
      line-height: 1.25;
      margin-bottom: 4px;
    }
    .dev-role {
      font-size: 10.5px;
      color: #7a8a97;
      line-height: 1.35;
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
    .legal-footer {
      display: flex; justify-content: center; gap: 12px;
      margin-top: 24px; font-size: 12px;
    }
    .legal-footer a { color: #7a8a97; text-decoration: none; }
    .legal-footer a:hover { color: #0A1E29; text-decoration: underline; }

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

      .contact-item { padding: 18px 20px; }
      .contact-value { font-size: 15px; }

      .cta { padding: 96px 60px 120px; }
      .cta-title { font-size: 36px; }
      .cta-sub { font-size: 16px; }
    }
  `]
})
export class OnboardingPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

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
  showScrollTop = signal(false);
  private slidesLoaded = false;
  hidden = signal(false);
  private slideTimer?: any;
  private lastScrollY = 0;

  services = signal<Service[]>([]);

  devTeams = [
    {
      label: 'IT 009 — Section A',
      members: [
        { name: 'Duran, Kevin Rio D.',      role: 'Lead Developer / Project Lead', photo: '/developers/kevin-duran.jpg' },
        { name: 'Marbella, Aelous Matthew', role: 'Lead Frontend Developer',       photo: '/developers/aelous-marbella.jpg' },
        { name: 'Marrero, John Carlo',      role: 'Backend Developer',             photo: '/developers/john-carlo-marrero.jpg' },
        { name: 'Reyes, Mariane E.',        role: 'Lead Frontend Designer',        photo: '/developers/mariane-reyes.jpg' },
        { name: 'Roxas, Ardee',             role: 'Frontend Designer / Developer', photo: '/developers/ardee-roxas.jpg' }
      ]
    },
    {
      label: 'IT 005 — Section B',
      members: [
        { name: 'Duran, Kevin Rio D.',        role: 'Lead Developer / Project Lead',    photo: '/developers/kevin-duran.jpg' },
        { name: 'Marrero, John Carlo',        role: 'Backend Developer',                photo: '/developers/john-carlo-marrero.jpg' },
        { name: 'Del Castillo, Gwenverselle', role: 'Technical Writer / QA',            photo: '/developers/gwenverselle-del-castillo.jpg' },
        { name: 'Menguito, John Harvey',      role: 'Frontend Support / Accessibility', photo: '/developers/john-harvey-menguito.jpg' },
        { name: 'Palijado, Jennard Joseph',   role: 'Compliance & Legal Pages',         photo: '/developers/jennard-palijado.jpg' },
        { name: 'Reyes, Mariane E.',          role: 'Lead Frontend Designer',           photo: '/developers/mariane-reyes.jpg' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private bannersApi: BannersApi,
    private servicesApi: ServicesApi
  ) {}

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

    try {
      await this.servicesApi.load();
      this.services.set(this.servicesApi.services());
    } catch { /* leave empty */ }
  }

  onContentScroll(ev: CustomEvent) {
    const detail = ev.detail as { scrollTop: number; deltaY: number };
    const y = detail.scrollTop;
    const delta = detail.deltaY;
    const threshold = 60;

    this.scrolled.set(y > threshold);
    this.showScrollTop.set(y > 600);

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
    const story = document.querySelector('.story') as HTMLElement | null;
    if (!story || !this.content) return;
    // Use ion-content's own scroll methods
    this.content.scrollToPoint(0, story.offsetTop - 20, 400);
  }

  initials(name: string): string {
    const parts = name.split(',').map(s => s.trim());
    const last = parts[0]?.[0] ?? '';
    const first = parts[1]?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  hideImg(ev: Event) {
    (ev.target as HTMLImageElement).style.display = 'none';
  }

  scrollToTop() {
    this.content?.scrollToTop(400);
  }

  imageFor(s: Service): string {
    if (s.image_url) return s.image_url;
    switch (s.category) {
      case 'preventive':  return 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80';
      case 'restorative': return 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80';
      case 'cosmetic':    return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80';
      case 'surgical':    return 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80';
      case 'diagnostic':  return 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80';
      default:            return 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80';
    }
  }

  goLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goRegister() {
    this.router.navigateByUrl('/register', { replaceUrl: true });
  }
}