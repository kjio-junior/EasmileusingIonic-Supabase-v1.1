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

              <button
                type="button"
                class="heart-btn"
                [class.active]="wishlist.has(s.id)"
                (click)="onHeartClick($event, s)">
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
      padding: 4px 16px 10px;
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
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      padding: 4px 20px 90px;
    }

    .card-wrap { position: relative; }

    .service-card {
      display: flex; flex-direction: column;
      background: #e6f4fb; border-radius: 16px;
      padding: 14px; text-decoration: none; color: inherit;
      min-height: 150px;
    }
    .icon-circle {
      width: 36px; height: 36px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 20px;
      margin-bottom: 8px;
    }
    .service-name { font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #0A1E29; padding-right: 32px; }
    .service-desc { font-size: 11px; color: #4a6272; margin: 0 0 10px; line-height: 1.3; flex: 1; }
    .service-foot { display: flex; align-items: center; justify-content: space-between; }
    .price { font-size: 11px; color: #0A1E29; font-weight: 600; }
    .chev {
      width: 22px; height: 22px; border-radius: 50%;
      background: #ffffff; display: grid; place-items: center;
      font-size: 12px; color: #4EBE7D;
    }

    .heart-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 0;
      background: rgba(255,255,255,0.9);
      color: #7a8a97;
      display: grid; place-items: center;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.15s;
      z-index: 2;
      backdrop-filter: blur(4px);
    }
    .heart-btn:hover { transform: scale(1.1); }
    .heart-btn.active { color: #e74c6b; }

    .loading { display: grid; place-items: center; padding: 40px; }
    .empty { color: #7a8a97; font-size: 13px; grid-column: span 2; text-align: center; padding: 20px; }
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

  async onHeartClick(ev: Event, s: Service) {
    ev.preventDefault();
    ev.stopPropagation();
    await this.wishlist.toggle(s.id);
  }

  onCardClick(ev: Event) {
    (ev.currentTarget as HTMLElement)?.blur();
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
}