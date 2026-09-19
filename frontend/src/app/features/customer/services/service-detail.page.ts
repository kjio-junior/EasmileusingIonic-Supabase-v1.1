import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonSpinner, AlertController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/services.service';
import { ReviewsApi, Review, ReviewSummary } from '../../../core/reviews.service';
import { WishlistStore } from '../../../core/wishlist.store';

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
          <button
            type="button"
            class="hero-heart"
            [class.active]="wishlist.has(s.id)"
            (click)="toggleWishlist(s.id)">
            <ion-icon [name]="wishlist.has(s.id) ? 'heart' : 'heart-outline'"></ion-icon>
          </button>
          <div class="hero-icon">
            <ion-icon [name]="iconFor(s.category)"></ion-icon>
          </div>
          <h1 class="hero-name">{{ s.name }}</h1>
          <div class="hero-price">From ₱{{ s.price }}</div>

          @if (summary() && summary()!.count > 0) {
            <div class="hero-rating">
              <div class="stars">
                @for (star of [1,2,3,4,5]; track star) {
                  <ion-icon
                    [name]="star <= Math.round(summary()!.average) ? 'star' : 'star-outline'">
                  </ion-icon>
                }
              </div>
              <span class="rating-text">{{ summary()!.average }} · {{ summary()!.count }} review{{ summary()!.count === 1 ? '' : 's' }}</span>
            </div>
          }
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

        @if (summary() && summary()!.count > 0) {
          <section class="block reviews-block">
            <div class="reviews-head">
              <h2>Patient Reviews</h2>
              <span class="review-count">{{ summary()!.count }}</span>
            </div>

            <div class="distribution">
              @for (star of [5,4,3,2,1]; track star) {
                <div class="dist-row">
                  <span class="dist-label">{{ star }}</span>
                  <ion-icon name="star" class="dist-star"></ion-icon>
                  <div class="dist-bar-wrap">
                    <div
                      class="dist-bar"
                      [style.width.%]="barWidth(star)">
                    </div>
                  </div>
                  <span class="dist-count">{{ summary()!.distribution[star.toString()] || 0 }}</span>
                </div>
              }
            </div>

            <div class="review-list">
              @for (r of reviews(); track r.id) {
                <div class="review-card">
                  <div class="review-top">
                    <div class="review-avatar">
                      @if (r.patient?.profile_image) {
                        <img [src]="r.patient!.profile_image" alt="" />
                      } @else {
                        {{ initials(r) }}
                      }
                    </div>
                    <div class="review-info">
                      <div class="review-name">
                        {{ r.patient?.first_name }} {{ r.patient?.last_name }}
                        @if (r.is_verified) {
                          <span class="verified-badge">
                            <ion-icon name="checkmark-circle"></ion-icon>
                            Verified
                          </span>
                        }
                      </div>
                      <div class="review-date">{{ r.created_at | date:'MMM d, y' }}</div>
                    </div>
                    <div class="review-stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <ion-icon [name]="star <= r.rating ? 'star' : 'star-outline'"></ion-icon>
                      }
                    </div>
                  </div>
                  @if (r.comment) {
                    <p class="review-comment">{{ r.comment }}</p>
                  }
                </div>
              }
            </div>
          </section>
        }

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
      position: relative;
      background: #e6f4fb; padding: 28px 20px;
      text-align: center; border-radius: 0 0 24px 24px;
    }
    .hero-heart {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 0;
      background: #ffffff;
      color: #7a8a97;
      display: grid; place-items: center;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.15s;
      box-shadow: 0 2px 8px rgba(10,30,41,0.08);
    }
    .hero-heart:hover { transform: scale(1.1); }
    .hero-heart.active { color: #e74c6b; }
    .hero-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 32px;
      margin: 0 auto 12px;
    }
    .hero-name { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #0A1E29; }
    .hero-price { color: #0A1E29; font-size: 14px; font-weight: 600; }

    .hero-rating {
      display: flex; gap: 8px; align-items: center; justify-content: center;
      margin-top: 12px;
    }
    .stars { display: flex; gap: 2px; }
    .stars ion-icon { font-size: 16px; color: #f0c14b; }
    .rating-text { font-size: 12px; color: #4a6272; font-weight: 600; }

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

    /* REVIEWS */
    .reviews-block { padding-bottom: 20px; }
    .reviews-head {
      display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
    }
    .reviews-head h2 { margin: 0; }
    .review-count {
      font-size: 11px; font-weight: 700; padding: 2px 9px;
      background: #e6f4fb; color: #1a5a7a; border-radius: 9999px;
    }

    .distribution {
      background: #f7fafc; border-radius: 12px;
      padding: 12px 14px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .dist-row { display: flex; align-items: center; gap: 8px; }
    .dist-label { font-size: 12px; font-weight: 700; color: #0A1E29; width: 12px; }
    .dist-star { font-size: 12px; color: #f0c14b; }
    .dist-bar-wrap {
      flex: 1; height: 6px; background: #e6eef5; border-radius: 9999px; overflow: hidden;
    }
    .dist-bar { height: 100%; background: #f0c14b; border-radius: 9999px; }
    .dist-count { font-size: 11px; color: #7a8a97; min-width: 24px; text-align: right; }

    .review-list { display: flex; flex-direction: column; gap: 12px; }
    .review-card {
      background: #f7fafc;
      border-radius: 14px;
      padding: 14px;
    }
    .review-top {
      display: flex; gap: 10px; align-items: center;
    }
    .review-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #d9f0fb; color: #1a5a7a;
      display: grid; place-items: center;
      font-size: 13px; font-weight: 700;
      flex: 0 0 auto; overflow: hidden;
    }
    .review-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .review-info { flex: 1; min-width: 0; }
    .review-name {
      font-size: 13px; font-weight: 700; color: #0A1E29;
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .verified-badge {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 6px; border-radius: 9999px;
      background: #d7f0e0; color: #1e6b3d;
      display: inline-flex; align-items: center; gap: 3px;
    }
    .verified-badge ion-icon { font-size: 11px; }
    .review-date { font-size: 11px; color: #7a8a97; margin-top: 1px; }
    .review-stars { display: flex; gap: 1px; flex: 0 0 auto; }
    .review-stars ion-icon { font-size: 13px; color: #f0c14b; }

    .review-comment {
      font-size: 13px; color: #4a6272; line-height: 1.5;
      margin: 10px 0 0; padding-left: 48px;
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
  reviews = signal<Review[]>([]);
  summary = signal<ReviewSummary | null>(null);
  loading = signal(true);

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private reviewsApi: ReviewsApi,
    private alertCtrl: AlertController,
    public wishlist: WishlistStore
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    try {
      const [svcRes, reviewsRes] = await Promise.all([
        firstValueFrom(
          this.http.get<{ service: Service }>(`${environment.apiUrl}/services/${id}`)
        ),
        this.reviewsApi.listForService(id).catch(() => ({
          reviews: [], summary: { count: 0, average: 0, distribution: {} }
        }))
      ]);
      this.service.set(svcRes.service);
      this.reviews.set(reviewsRes.reviews);
      this.summary.set(reviewsRes.summary);
    } catch {
      this.service.set(null);
    } finally {
      this.loading.set(false);
      if (!this.wishlist.loaded()) this.wishlist.load();
    }
  }

  async toggleWishlist(id: string) {
    await this.wishlist.toggle(id);
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

  initials(r: Review): string {
    const first = r.patient?.first_name?.[0] ?? '';
    const last = r.patient?.last_name?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  barWidth(star: number): number {
    const s = this.summary();
    if (!s || !s.count) return 0;
    const n = s.distribution[star.toString()] || 0;
    return (n / s.count) * 100;
  }

  book() {
    const s = this.service();
    if (!s) return;
    this.router.navigateByUrl(`/app/book/${s.id}`);
  }
}