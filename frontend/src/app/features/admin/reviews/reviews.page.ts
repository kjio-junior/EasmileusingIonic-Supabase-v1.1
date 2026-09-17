import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonSpinner,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { AdminApi, AdminReview } from '../../../core/admin-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-reviews',
  host: { 'class': 'ion-page' },
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content class="admin-bg">
      <div class="page-inner">

        <div class="head">
          <div>
            <h1>Reviews</h1>
            <p class="sub">Moderate patient feedback</p>
          </div>
          <div class="count-pill">{{ reviews().length }} total</div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-icon mint"><ion-icon name="star"></ion-icon></div>
            <div>
              <div class="stat-value">{{ averageRating() }}</div>
              <div class="stat-label">Average rating</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon sky"><ion-icon name="chatbubbles-outline"></ion-icon></div>
            <div>
              <div class="stat-value">{{ reviews().length }}</div>
              <div class="stat-label">Total reviews</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon butter"><ion-icon name="alert-circle-outline"></ion-icon></div>
            <div>
              <div class="stat-value">{{ lowRatingCount() }}</div>
              <div class="stat-label">Low (1-2 stars)</div>
            </div>
          </div>
        </div>

        <div class="filters">
          @for (f of filters; track f.value) {
            <button
              type="button"
              class="chip-filter"
              [class.active]="activeFilter === f.value"
              (click)="setFilter(f.value)">
              {{ f.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
        } @else if (!reviews().length) {
          <p class="empty">No reviews match your filter.</p>
        } @else {
          <div class="list">
            @for (r of reviews(); track r.id) {
              <div class="review-card" [attr.data-rating]="r.rating">

                <div class="review-head">
                  <div class="avatar">
                    @if (r.patient?.profile_image) {
                      <img [src]="r.patient!.profile_image" alt="" />
                    } @else {
                      {{ initials(r) }}
                    }
                  </div>
                  <div class="who">
                    <div class="who-name">
                      {{ r.patient?.first_name }} {{ r.patient?.last_name }}
                      @if (r.is_verified) {
                        <span class="verified-badge">
                          <ion-icon name="checkmark-circle"></ion-icon>
                          Verified
                        </span>
                      }
                    </div>
                    <div class="who-meta">
                      {{ r.created_at | date:'MMM d, y · h:mm a' }}
                    </div>
                  </div>
                  <div class="rating-badge" [attr.data-rating]="r.rating">
                    <ion-icon name="star"></ion-icon>
                    {{ r.rating }}
                  </div>
                </div>

                @if (r.service; as s) {
                  <div class="service-row">
                    <ion-icon name="construct-outline"></ion-icon>
                    <span>{{ s.name }}</span>
                    @if (r.appointment; as a) {
                      <span class="dot">·</span>
                      <span class="muted">{{ a.appointment_date | date:'MMM d, y' }}</span>
                    }
                  </div>
                }

                @if (r.comment) {
                  <p class="comment">"{{ r.comment }}"</p>
                } @else {
                  <p class="comment muted">(no comment)</p>
                }

                <div class="actions">
                  <button
                    type="button"
                    class="action-btn"
                    [class.verified]="r.is_verified"
                    (click)="toggleVerify(r)">
                    <ion-icon [name]="r.is_verified ? 'close-circle-outline' : 'checkmark-circle-outline'"></ion-icon>
                    <span>{{ r.is_verified ? 'Unverify' : 'Verify' }}</span>
                  </button>
                  <button
                    type="button"
                    class="action-btn danger"
                    (click)="confirmDelete(r)">
                    <ion-icon name="trash-outline"></ion-icon>
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            }
          </div>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .admin-bg { --background: #f5f8fb; --color: #0A1E29; }
    .page-inner { padding: 20px; }

    .head {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
    }
    h1 { font-size: 26px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 14px; margin: 4px 0 0; }
    .count-pill {
      background: #e6f4fb; color: #0A1E29;
      padding: 6px 14px; border-radius: 9999px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }

    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
    }
    .stat-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 18px; flex: 0 0 auto;
    }
    .stat-icon.mint   { background: #d7f0e0; color: #1e6b3d; }
    .stat-icon.sky    { background: #d9f0fb; color: #1a5a7a; }
    .stat-icon.butter { background: #fff4d6; color: #8a6d00; }
    .stat-value { font-size: 18px; font-weight: 700; color: #0A1E29; line-height: 1; }
    .stat-label { font-size: 11px; color: #7a8a97; margin-top: 4px; }

    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .chip-filter {
      background: #ffffff;
      border: 1px solid #e6eef5;
      color: #4a6272;
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip-filter:hover { border-color: #4EBE7D; color: #0A1E29; }
    .chip-filter.active { background: #0A1E29; color: #ffffff; border-color: #0A1E29; }

    .list { display: flex; flex-direction: column; gap: 12px; }

    .review-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 14px 16px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.05);
      border-left: 4px solid #e6eef5;
    }
    .review-card[data-rating="5"] { border-left-color: #4EBE7D; }
    .review-card[data-rating="4"] { border-left-color: #93D5ED; }
    .review-card[data-rating="3"] { border-left-color: #f0c14b; }
    .review-card[data-rating="2"] { border-left-color: #ffab7a; }
    .review-card[data-rating="1"] { border-left-color: #e57373; }

    .review-head { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
    .avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: #d9f0fb; color: #1a5a7a;
      display: grid; place-items: center;
      font-size: 14px; font-weight: 700;
      flex: 0 0 auto; overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .who { flex: 1; min-width: 0; }
    .who-name {
      font-size: 14px; font-weight: 700; color: #0A1E29;
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .verified-badge {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 2px 7px; border-radius: 9999px;
      background: #d7f0e0; color: #1e6b3d;
      display: inline-flex; align-items: center; gap: 3px;
    }
    .verified-badge ion-icon { font-size: 11px; }
    .who-meta { font-size: 11px; color: #7a8a97; margin-top: 2px; }

    .rating-badge {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 12px; border-radius: 9999px;
      font-size: 13px; font-weight: 700;
      background: #eef3f8; color: #4a6272;
      flex: 0 0 auto;
    }
    .rating-badge[data-rating="5"] { background: #d7f0e0; color: #1e6b3d; }
    .rating-badge[data-rating="4"] { background: #d9f0fb; color: #1a5a7a; }
    .rating-badge[data-rating="3"] { background: #fff4d6; color: #8a6d00; }
    .rating-badge[data-rating="2"] { background: #ffe0d0; color: #8a3d1a; }
    .rating-badge[data-rating="1"] { background: #ffd7d7; color: #8a1a1a; }
    .rating-badge ion-icon { font-size: 14px; }

    .service-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: #4a6272; margin-bottom: 8px;
    }
    .service-row ion-icon { font-size: 14px; color: #4EBE7D; }
    .service-row .muted { color: #7a8a97; }
    .dot { opacity: 0.5; }

    .comment {
      font-size: 13px; color: #0A1E29; line-height: 1.5;
      margin: 6px 0 0;
    }
    .comment.muted { color: #b0bcc6; font-style: italic; }

    .actions {
      display: flex; gap: 8px; margin-top: 12px; padding-top: 10px;
      border-top: 1px solid #eef3f8;
    }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px;
      border-radius: 9999px;
      border: 1px solid #e6eef5;
      background: #ffffff;
      color: #0A1E29;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .action-btn:hover { background: #f2f8fc; }
    .action-btn.verified { border-color: #4EBE7D; color: #1e6b3d; }
    .action-btn.verified:hover { background: #f0f9f4; }
    .action-btn.danger { border-color: #ffd7d7; color: #c0392b; }
    .action-btn.danger:hover { background: #ffe0e0; }
    .action-btn ion-icon { font-size: 14px; }

    .loading { display: grid; place-items: center; padding: 60px; }
    .empty { color: #7a8a97; font-size: 14px; text-align: center; padding: 40px; }

    @media (min-width: 1024px) {
      .page-inner { padding: 32px 40px; }
      .list { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminReviewsPage implements OnInit {
  reviews = signal<AdminReview[]>([]);
  loading = signal(true);
  activeFilter: number | null = null;

  filters = [
    { label: 'All',     value: null },
    { label: '5 ★',     value: 5 },
    { label: '4 ★',     value: 4 },
    { label: '3 ★',     value: 3 },
    { label: 'Low (1-2)', value: 2 }
  ];

  constructor(
    private api: AdminApi,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const filters: any = {};
      if (this.activeFilter === 2) {
        filters.min_rating = 1; // will fetch 1+ and we filter below
      } else if (this.activeFilter) {
        filters.rating = this.activeFilter;
      }

      let list = await this.api.listReviews(filters);

      // Special-case: "Low (1-2)" needs both 1 and 2
      if (this.activeFilter === 2) {
        list = list.filter(r => r.rating <= 2);
      }

      this.reviews.set(list);
    } catch {
      this.reviews.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(value: number | null) {
    this.activeFilter = value;
    this.load();
  }

  averageRating(): string {
    const list = this.reviews();
    if (!list.length) return '—';
    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
    return avg.toFixed(1);
  }

  lowRatingCount(): number {
    return this.reviews().filter(r => r.rating <= 2).length;
  }

  initials(r: AdminReview): string {
    const first = r.patient?.first_name?.[0] ?? '';
    const last = r.patient?.last_name?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  async toggleVerify(r: AdminReview) {
    try {
      const updated = await this.api.toggleReviewVerified(r.id, !r.is_verified);
      this.reviews.update(list =>
        list.map(x => x.id === updated.id ? { ...x, is_verified: updated.is_verified } : x)
      );
      const t = await this.toastCtrl.create({
        message: updated.is_verified ? 'Review verified' : 'Verification removed',
        duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed', duration: 1800, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }

  async confirmDelete(r: AdminReview) {
    const alert = await this.alertCtrl.create({
      header: 'Delete review?',
      message: `Delete ${r.patient?.first_name ?? ''} ${r.patient?.last_name ?? ''}'s review? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive' }
      ]
    });
    await alert.present();
    const res = await alert.onDidDismiss();
    if (res.role !== 'destructive') return;

    try {
      await this.api.deleteReview(r.id);
      this.reviews.update(list => list.filter(x => x.id !== r.id));
      const t = await this.toastCtrl.create({
        message: 'Review deleted', duration: 1600, position: 'bottom', color: 'success'
      });
      await t.present();
    } catch (e: any) {
      const t = await this.toastCtrl.create({
        message: e?.error?.error || 'Failed', duration: 1800, position: 'bottom', color: 'danger'
      });
      await t.present();
    }
  }
}