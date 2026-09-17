import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
  IonContent, IonSpinner, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonLabel,
  IonModal, IonTextarea, IonItem,
  ToastController
} from '@ionic/angular/standalone';
import { AppointmentsApi, Appointment } from '../../../core/appointments.service';
import { ReviewsApi, Review } from '../../../core/reviews.service';

@Component({
  standalone: true,
  selector: 'app-appointments-list',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonMenuButton,
    IonContent, IonSpinner, IonRefresher, IonRefresherContent,
    IonSegment, IonSegmentButton, IonLabel,
    IonModal, IonTextarea, IonItem
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
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <section class="head">
        <h1>My Appointments</h1>
        <p class="sub">Your upcoming visits and treatment history.</p>
      </section>

      <div class="segment-wrap">
        <ion-segment class="segment" [value]="tab()" (ionChange)="onTabChange($event)">
          <ion-segment-button value="upcoming"><ion-label>Upcoming</ion-label></ion-segment-button>
          <ion-segment-button value="history"><ion-label>History</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      @if (loading()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!currentList().length) {
        <div class="empty">
          <div class="empty-icon">
            <ion-icon [name]="tab() === 'upcoming' ? 'calendar-outline' : 'time-outline'"></ion-icon>
          </div>
          <h2>{{ tab() === 'upcoming' ? 'No upcoming appointments' : 'No treatment history yet' }}</h2>
          <p>
            {{ tab() === 'upcoming'
              ? 'Book your next visit and it will show up here.'
              : 'Completed visits will appear here with your dentist\\'s notes.' }}
          </p>
          @if (tab() === 'upcoming') {
            <ion-button class="cta" routerLink="/app/services">
              <ion-icon slot="start" name="grid-outline"></ion-icon>
              Browse Services
            </ion-button>
          }
        </div>
      } @else {
        <div class="list">
          @for (a of currentList(); track a.id) {
            <div class="appt-card" [class.cancelled]="a.status === 'cancelled' || a.status === 'no-show'">

              <div class="appt-top">
                <div class="appt-date">
                  <span class="dow">{{ a.appointment_date | date:'EEE' }}</span>
                  <span class="day">{{ a.appointment_date | date:'d' }}</span>
                  <span class="mon">{{ a.appointment_date | date:'MMM' }}</span>
                </div>
                <div class="appt-body">
                  <div class="appt-time">{{ a.appointment_date | date:'h:mm a' }}</div>
                  @if (a.dentist; as d) {
                    <div class="appt-dentist">Dr. {{ d.first_name }} {{ d.last_name }}</div>
                  } @else {
                    <div class="appt-dentist muted">Dentist to be assigned</div>
                  }
                  @if (a.items?.length) {
                    <div class="appt-services">
                      @for (item of a.items; track item.id) {
                        <span class="service-chip">{{ item.service?.name || 'Service' }}</span>
                      }
                    </div>
                  }
                </div>
                <div class="appt-status" [attr.data-status]="a.status">
                  {{ statusLabel(a.status) }}
                </div>
              </div>

              @if (a.notes) {
                <div class="note-row">
                  <div class="note-label">Your note</div>
                  <div class="note-text">{{ a.notes }}</div>
                </div>
              }

              @if (tab() === 'history' && a.treatment_notes) {
                <div class="note-row treatment">
                  <div class="note-label">
                    <ion-icon name="medical-outline"></ion-icon>
                    Treatment notes
                  </div>
                  <div class="note-text">{{ a.treatment_notes }}</div>
                </div>
              }

              @if (tab() === 'history' && a.status === 'completed') {
                <div class="review-cta">
                  @if (reviewedIds().has(a.id)) {
                    <div class="reviewed-tag">
                      <ion-icon name="checkmark-circle"></ion-icon>
                      <span>You reviewed this visit</span>
                    </div>
                  } @else {
                    <button type="button" class="review-btn" (click)="openReview(a)">
                      <ion-icon name="star-outline"></ion-icon>
                      <span>Leave a review</span>
                    </button>
                  }
                </div>
              }

            </div>
          }
        </div>
      }
    </ion-content>

    <ion-modal [isOpen]="reviewOpen()" (didDismiss)="closeReview()">
      <ng-template>
        <ion-content class="review-modal-bg">
          <div class="review-wrap">
            <h2 class="review-title">How was your visit?</h2>
            @if (reviewAppt(); as a) {
              <p class="review-sub">
                {{ a.appointment_date | date:'MMMM d, y' }}
                · {{ servicesLabel(a) }}
              </p>
            }

            <div class="star-picker">
              @for (star of [1,2,3,4,5]; track star) {
                <button
                  type="button"
                  class="star-btn"
                  [class.active]="star <= reviewRating"
                  (click)="setRating(star)"
                  [disabled]="saving()">
                  <ion-icon [name]="star <= reviewRating ? 'star' : 'star-outline'"></ion-icon>
                </button>
              }
            </div>
            <p class="rating-label">{{ ratingLabel(reviewRating) }}</p>

            <ion-item lines="none" class="comment-field">
              <ion-textarea
                [(ngModel)]="reviewComment"
                placeholder="Share your experience (optional)"
                [autoGrow]="true"
                rows="4"
                [disabled]="saving()">
              </ion-textarea>
            </ion-item>

            @if (reviewError()) {
              <p class="review-err">{{ reviewError() }}</p>
            }

            <div class="review-actions">
              <button type="button" class="btn-cancel" (click)="closeReview()" [disabled]="saving()">
                Cancel
              </button>
              <button
                type="button"
                class="btn-submit"
                (click)="submitReview()"
                [disabled]="saving() || reviewRating < 1">
                @if (saving()) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  Submit Review
                }
              </button>
            </div>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .top-bar { --background: #d9f0fb; --color: #0A1E29; }
    .brand { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }
    .brand-accent { color: #4EBE7D; }
    .bg { --background: #ffffff; }

    .head { padding: 16px 20px 8px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; color: #0A1E29; }
    .sub { color: #7a8a97; font-size: 13px; margin: 4px 0 0; }

    .segment-wrap { padding: 8px 16px 4px; }
    .segment { --background: #f2f8fc; border-radius: 9999px; padding: 4px; }
    ion-segment-button {
      --color: #7a8a97;
      --color-checked: #0A1E29;
      --indicator-color: #ffffff;
      --indicator-box-shadow: 0 2px 6px rgba(10,30,41,0.08);
      --border-radius: 9999px;
      --padding-top: 8px;
      --padding-bottom: 8px;
      font-weight: 600;
      font-size: 13px;
      min-height: 38px;
    }

    .list { padding: 12px 20px 90px; display: flex; flex-direction: column; gap: 12px; }
    .appt-card { background: #e6f4fb; border-radius: 16px; padding: 14px; }
    .appt-card.cancelled { opacity: 0.55; }
    .appt-top { display: flex; align-items: center; gap: 14px; }

    .appt-date {
      width: 54px; height: 60px; border-radius: 12px;
      background: #ffffff; display: flex; flex-direction: column;
      align-items: center; justify-content: center; flex: 0 0 auto;
      color: #0A1E29;
    }
    .dow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #7a8a97; }
    .day { font-size: 20px; font-weight: 700; line-height: 1; }
    .mon { font-size: 10px; text-transform: uppercase; color: #4EBE7D; font-weight: 600; }

    .appt-body { flex: 1; min-width: 0; }
    .appt-time { font-size: 14px; font-weight: 600; color: #0A1E29; }
    .appt-dentist { font-size: 12px; color: #4a6272; margin-top: 2px; }
    .appt-dentist.muted { color: #7a8a97; font-style: italic; }
    .appt-services { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .service-chip {
      font-size: 11px; padding: 3px 10px; border-radius: 9999px;
      background: #ffffff; color: #1a5a7a; font-weight: 600;
    }

    .appt-status {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; padding: 4px 10px; border-radius: 9999px;
      flex: 0 0 auto; background: #ffffff; color: #0A1E29;
    }
    .appt-status[data-status="pending"]     { background: #fff4d6; color: #8a6d00; }
    .appt-status[data-status="confirmed"]   { background: #d7f0e0; color: #1e6b3d; }
    .appt-status[data-status="in-progress"] { background: #d6e8ff; color: #1a4f8a; }
    .appt-status[data-status="completed"]   { background: #d9f0fb; color: #0A1E29; }
    .appt-status[data-status="cancelled"]   { background: #ffd7d7; color: #8a1a1a; }
    .appt-status[data-status="no-show"]     { background: #ffd7d7; color: #8a1a1a; }

    .note-row { background: #ffffff; border-radius: 10px; padding: 10px 12px; margin-top: 12px; }
    .note-row.treatment { background: #f0f9f4; border-left: 3px solid #4EBE7D; }
    .note-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #7a8a97; margin-bottom: 6px;
    }
    .note-row.treatment .note-label { color: #1e6b3d; }
    .note-label ion-icon { font-size: 14px; }
    .note-text { font-size: 13px; color: #0A1E29; line-height: 1.45; }

    .review-cta { margin-top: 12px; }
    .review-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #0A1E29; color: #ffffff;
      border: 0; border-radius: 9999px;
      padding: 8px 16px;
      font-size: 12px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      font-family: inherit;
    }
    .review-btn:hover { background: #142635; }
    .review-btn ion-icon { font-size: 14px; }
    .reviewed-tag {
      display: inline-flex; align-items: center; gap: 6px;
      color: #1e6b3d; font-size: 12px; font-weight: 600;
    }
    .reviewed-tag ion-icon { font-size: 14px; }

    .loading { display: grid; place-items: center; padding: 60px; }

    .empty { text-align: center; padding: 50px 32px; }
    .empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: #e6f4fb; color: #4EBE7D;
      display: grid; place-items: center; font-size: 36px; margin: 0 auto 16px;
    }
    .empty h2 { font-size: 18px; margin: 0 0 6px; color: #0A1E29; }
    .empty p { color: #7a8a97; font-size: 13px; margin: 0 0 20px; line-height: 1.5; }

    .cta {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 44px; font-weight: 600;
    }

    .review-modal-bg { --background: #ffffff; --color: #0A1E29; }
    .review-wrap { padding: 28px 24px 32px; max-width: 480px; margin: 0 auto; }
    .review-title {
      font-size: 22px; font-weight: 800; color: #0A1E29;
      text-align: center; margin: 0 0 6px; letter-spacing: -0.5px;
    }
    .review-sub {
      font-size: 13px; color: #7a8a97; text-align: center;
      margin: 0 0 22px; line-height: 1.4;
    }
    .star-picker { display: flex; justify-content: center; gap: 8px; margin: 8px 0 6px; }
    .star-btn {
      background: transparent; border: 0; padding: 6px;
      cursor: pointer;
      transition: transform 0.12s;
      font-size: 36px;
      color: #e6eef5;
      display: grid; place-items: center;
    }
    .star-btn:hover { transform: scale(1.15); }
    .star-btn.active { color: #f0c14b; }
    .star-btn ion-icon { font-size: 36px; }
    .rating-label {
      text-align: center; font-size: 13px; font-weight: 600;
      color: #7a8a97; margin: 4px 0 20px; height: 18px;
    }
    .comment-field {
      --background: #f2f8fc;
      --border-radius: 14px;
      --padding-start: 14px;
      --inner-padding-end: 14px;
      --color: #0A1E29;
      --min-height: 90px;
      border-radius: 14px;
      border: 1px solid #e6eef5;
      margin: 0;
    }
    .comment-field ion-textarea {
      --placeholder-color: #b0bcc6;
      --placeholder-opacity: 1;
      font-size: 14px;
      --color: #0A1E29;
    }
    .review-err {
      color: #c0392b; font-size: 13px; font-weight: 600;
      text-align: center; margin: 12px 0 0;
    }
    .review-actions { display: flex; gap: 10px; margin-top: 22px; }
    .btn-cancel, .btn-submit {
      flex: 1; height: 48px; border-radius: 9999px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: background 0.15s; font-family: inherit; border: 0;
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px;
    }
    .btn-cancel { background: #f2f8fc; color: #4a6272; }
    .btn-cancel:hover { background: #e6f4fb; }
    .btn-submit { background: #0A1E29; color: #ffffff; }
    .btn-submit:hover { background: #142635; }
    .btn-submit:disabled, .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-submit ion-spinner { --color: #ffffff; width: 18px; height: 18px; }
  `]
})
export class AppointmentsListPage implements OnInit {
  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  tab = signal<'upcoming' | 'history'>('upcoming');

  reviewedIds = signal<Set<string>>(new Set());
  reviewOpen = signal(false);
  reviewAppt = signal<Appointment | null>(null);
  reviewRating = 0;
  reviewComment = '';
  reviewError = signal<string | null>(null);
  saving = signal(false);

  constructor(
    private api: AppointmentsApi,
    private reviewsApi: ReviewsApi,
    private toastCtrl: ToastController
  ) {}

  currentList = computed(() => {
    const list = this.appointments();
    if (this.tab() === 'upcoming') {
      return list
        .filter(a => ['pending', 'confirmed', 'in-progress'].includes(a.status))
        .sort((a, b) =>
          new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
        );
    }
    return list
      .filter(a => ['completed', 'cancelled', 'no-show'].includes(a.status))
      .sort((a, b) =>
        new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      );
  });

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const [list, myReviews] = await Promise.all([
        this.api.loadMine(),
        this.reviewsApi.listMine().catch(() => [] as Review[])
      ]);
      this.appointments.set(list);
      const ids = new Set(
        myReviews
          .map(r => r.appointment?.id)
          .filter((x): x is string => !!x)
      );
      this.reviewedIds.set(ids);
    } catch {
      this.appointments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(ev: CustomEvent) {
    await this.load();
    (ev.target as HTMLIonRefresherElement).complete();
  }

  onTabChange(ev: CustomEvent) {
    this.tab.set(ev.detail.value as 'upcoming' | 'history');
  }

  statusLabel(s: string): string {
    return s.replace('-', ' ');
  }

  servicesLabel(a: Appointment): string {
    if (!a.items?.length) return '';
    return a.items
      .map(i => i.service?.name)
      .filter((n): n is string => !!n)
      .join(', ');
  }

  openReview(appt: Appointment) {
    this.reviewAppt.set(appt);
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewError.set(null);
    this.reviewOpen.set(true);
  }

  closeReview() {
    this.reviewOpen.set(false);
  }

  setRating(n: number) {
    this.reviewRating = n;
  }

  ratingLabel(n: number): string {
    switch (n) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very good';
      case 5: return 'Excellent';
      default: return 'Tap a star to rate';
    }
  }

  async submitReview() {
    this.reviewError.set(null);
    const appt = this.reviewAppt();
    if (!appt) return;
    if (this.reviewRating < 1) {
      this.reviewError.set('Please select a rating');
      return;
    }

    this.saving.set(true);
    try {
      await this.reviewsApi.create({
        appointment_id: appt.id,
        rating: this.reviewRating,
        comment: this.reviewComment.trim() || undefined
      });

      this.reviewedIds.update(s => {
        const next = new Set(s);
        next.add(appt.id);
        return next;
      });

      const t = await this.toastCtrl.create({
        message: 'Thanks for your review!',
        duration: 1800,
        position: 'bottom',
        color: 'success'
      });
      await t.present();
      this.closeReview();
    } catch (e: any) {
      this.reviewError.set(e?.error?.error || e?.message || 'Failed to submit review');
    } finally {
      this.saving.set(false);
    }
  }
}