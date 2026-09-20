import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSearchbar, IonSpinner
} from '@ionic/angular/standalone';
import { ServicesApi, Service } from '../../../core/services.service';
import { WishlistStore } from '../../../core/wishlist.store';

type SortKey = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';

@Component({
  standalone: true,
  selector: 'app-services-list',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSearchbar, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="top-bar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title class="brand">EA<span class="brand-accent">smile</span></ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/app/wishlist">
            <ion-icon slot="icon-only" name="heart-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bg">
      <section class="head">
        <h1>Our Services</h1>
        <p class="sub">Explore the dental services we offer.</p>
      </section>

      <ion-searchbar
        class="search"
        placeholder="Search your dental problem..."
        [(ngModel)]="searchQuery"
        [debounce]="150">
      </ion-searchbar>

      <div class="sort-row">
        @for (s of sortOptions; track s.value) {
          <button
            type="button"
            class="sort-chip"
            [class.active]="sortKey === s.value"
            (click)="setSort(s.value)">
            {{ s.label }}
          </button>
        }
      </div>

      @if (servicesApi.loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else {
        <div class="service-grid">
          @for (s of filtered(); track s.id) {
            <div class="card-wrap">
              <a class="service-card" [routerLink]="['/app/services', s.id]" (click)="onCardClick($event)">
                <div class="card-img" [style.background-image]="'url(' + imageFor(s) + ')'">
                  <div class="img-overlay"></div>
                  <span class="cat-chip" [attr.data-category]="s.category">{{ s.category }}</span>
                </div>
                <div class="card-body">
                  <h3 class="service-name">{{ s.name }}</h3>
                  <p class="service-desc">{{ s.description }}</p>
                  <div class="service-foot">
                    <span class="price">From ₱{{ s.price }}</span>
                    <span class="duration">{{ s.duration_minutes }} min</span>
                  </div>
                </div>
              </a>

              <button
                type="button"
                class="heart-btn"
                [class.active]="wishlist.has(s.id)"
                (click)="onHeartClick($event, s)"
                [attr.aria-label]="wishlist.has(s.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                <ion-icon [name]="wishlist.has(s.id) ? 'heart' : 'heart-outline'"></ion-icon>
              </button>
            </div>
          }
          @if (!filtered().length) {
            <p class="empty">No services match your search.</p>
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

    .head { padding: 16px 20px 4px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 13px; margin: 4px 0 0; }

    .search {
      --background: #e6f4fb;
      --border-radius: 9999px;
      --box-shadow: none;
      --placeholder-color: #7a8a97;
      --icon-color: #7a8a97;
      padding: 4px 12px 6px;
    }

    .sort-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 4px 16px 12px;
      scrollbar-width: none;
    }
    .sort-row::-webkit-scrollbar { display: none; }
    .sort-chip {
      flex: 0 0 auto;
      background: #ffffff;
      border: 1px solid #e6eef5;
      color: #4a6272;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .sort-chip:hover { border-color: #4EBE7D; color: #0A1E29; }
    .sort-chip.active { background: #0A1E29; color: #ffffff; border-color: #0A1E29; }

    .service-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 4px 20px 90px;
    }

    .card-wrap { position: relative; }

    .service-card {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      border: 1px solid #e6eef5;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .service-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(10,30,41,0.08);
    }

    .card-img {
      position: relative;
      aspect-ratio: 16 / 9;
      background-size: cover;
      background-position: center;
      background-color: #e6f4fb;
    }
    .img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(10,30,41,0.35) 100%);
    }
    .cat-chip {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(6px);
      color: #0A1E29;
    }

    .card-body {
      padding: 14px 16px 16px;
    }
    .service-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 4px;
      color: #0A1E29;
      padding-right: 40px;
    }
    .service-desc {
      font-size: 12.5px;
      color: #4a6272;
      margin: 0 0 12px;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .service-foot {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid #eef3f8;
    }
    .price {
      font-size: 15px;
      font-weight: 700;
      color: #0A1E29;
    }
    .duration {
      font-size: 11px;
      color: #7a8a97;
    }

    .heart-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 0;
      background: rgba(255,255,255,0.92);
      color: #7a8a97;
      display: grid; place-items: center;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.15s;
      z-index: 2;
      backdrop-filter: blur(6px);
      box-shadow: 0 2px 8px rgba(10,30,41,0.1);
    }
    .heart-btn:hover { transform: scale(1.08); }
    .heart-btn.active { color: #e74c6b; }

    .loading { display: grid; place-items: center; padding: 40px; }
    .empty { color: #7a8a97; font-size: 13px; text-align: center; padding: 20px; }

    @media (min-width: 768px) {
      .service-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
    }
    @media (min-width: 1024px) {
      .service-grid { grid-template-columns: 1fr 1fr 1fr; padding-bottom: 40px; }
    }
  `]
})
export class ServicesListPage implements OnInit {
  searchQuery = '';
  sortKey: SortKey = 'name_asc';

  sortOptions: { label: string; value: SortKey }[] = [
    { label: 'Name A–Z',   value: 'name_asc'   },
    { label: 'Name Z–A',   value: 'name_desc'  },
    { label: 'Price ↑',    value: 'price_asc'  },
    { label: 'Price ↓',    value: 'price_desc' }
  ];

  constructor(public servicesApi: ServicesApi, public wishlist: WishlistStore) {}

  async ngOnInit() {
    if (!this.servicesApi.services().length) await this.servicesApi.load();
    if (!this.wishlist.loaded()) await this.wishlist.load();
  }

  setSort(k: SortKey) {
    this.sortKey = k;
  }

  filtered(): Service[] {
    const q = this.searchQuery.trim().toLowerCase();
    let list = this.servicesApi.services();

    if (q) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (this.sortKey) {
      case 'name_asc':   sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc':  sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price_asc':  sorted.sort((a, b) => a.price - b.price); break;
      case 'price_desc': sorted.sort((a, b) => b.price - a.price); break;
    }
    return sorted;
  }

  // Fallback image by category if DB image_url is empty
  imageFor(s: Service): string {
    if (s.image_url) return s.image_url;
    switch (s.category) {
      case 'preventive':  return 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80';
      case 'restorative': return 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80';
      case 'cosmetic':    return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80';
      case 'surgical':    return 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80';
      case 'diagnostic':  return 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80';
      default:            return 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80';
    }
  }

  async onHeartClick(ev: Event, s: Service) {
    ev.preventDefault();
    ev.stopPropagation();
    await this.wishlist.toggle(s.id);
  }

  onCardClick(ev: Event) {
    (ev.currentTarget as HTMLElement)?.blur();
  }
}