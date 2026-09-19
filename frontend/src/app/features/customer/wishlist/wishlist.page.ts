import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { WishlistStore, WishlistItem } from '../../../core/wishlist.store';

@Component({
  standalone: true,
  selector: 'app-wishlist',
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSpinner
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
      <section class="head">
        <h1>My Wishlist</h1>
        <p class="sub">Services you've saved for later.</p>
      </section>

      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!items().length) {
        <div class="empty">
          <div class="empty-icon">
            <ion-icon name="heart-outline"></ion-icon>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on any service to save it here.</p>
          <ion-button class="cta" routerLink="/app/services">
            <ion-icon slot="start" name="grid-outline"></ion-icon>
            Browse Services
          </ion-button>
        </div>
      } @else {
        <div class="list">
          @for (w of items(); track w.id) {
            <div class="wish-card">
              <a class="wish-body" [routerLink]="['/app/services', w.service.id]">
                <div class="wish-name">{{ w.service.name }}</div>
                <div class="wish-desc">{{ w.service.description }}</div>
                <div class="wish-meta">
                  <span class="price">From ₱{{ w.service.price }}</span>
                  <span class="duration">{{ w.service.duration_minutes }} min</span>
                </div>
              </a>
              <button
                type="button"
                class="remove-btn"
                (click)="remove(w)"
                title="Remove from wishlist">
                <ion-icon name="heart"></ion-icon>
              </button>
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

    .head { padding: 16px 20px 12px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 13px; margin: 4px 0 0; }

    .list {
      padding: 4px 20px 90px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .wish-card {
      display: flex; align-items: stretch; gap: 8px;
      background: #e6f4fb; border-radius: 16px;
      overflow: hidden;
    }

    .wish-body {
      flex: 1; padding: 14px 8px 14px 16px;
      text-decoration: none; color: inherit; min-width: 0;
    }
    .wish-name { font-size: 15px; font-weight: 700; color: #0A1E29; margin-bottom: 2px; }
    .wish-desc {
      font-size: 12px; color: #4a6272; line-height: 1.35; margin-bottom: 8px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .wish-meta { display: flex; gap: 10px; align-items: baseline; }
    .price { font-size: 12px; font-weight: 700; color: #0A1E29; }
    .duration { font-size: 11px; color: #7a8a97; }

    .remove-btn {
      flex: 0 0 auto;
      width: 48px;
      border: 0;
      background: transparent;
      color: #e74c6b;
      font-size: 22px;
      cursor: pointer;
      display: grid; place-items: center;
      transition: background 0.15s;
    }
    .remove-btn:hover { background: rgba(231, 76, 107, 0.1); }

    .loading { display: grid; place-items: center; padding: 60px; }

    .empty { text-align: center; padding: 50px 32px; }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: #e6f4fb; color: #e74c6b;
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
export class WishlistPage implements OnInit {
  items = signal<WishlistItem[]>([]);
  loading = signal(true);

  constructor(public wishlist: WishlistStore) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.wishlist.list();
      this.items.set(list);
      // Sync the store with what's on screen
      this.wishlist.ids.set(new Set(list.map(i => i.service.id)));
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(item: WishlistItem) {
    await this.wishlist.toggle(item.service.id);
    this.items.update(list => list.filter(i => i.id !== item.id));
  }
}