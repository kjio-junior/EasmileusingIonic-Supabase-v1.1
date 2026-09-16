import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
  IonContent, IonSpinner, IonDatetime, IonTextarea, IonItem,
  ToastController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/services.service';
import { AppointmentsApi } from '../../../core/appointments.service';

const SLOT_START_HOUR = 9;    // 9 AM
const SLOT_END_HOUR = 18;     // 6 PM
const SLOT_MINUTES = 30;

@Component({
  standalone: true,
  selector: 'app-book',
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon,
    IonContent, IonSpinner, IonDatetime, IonTextarea, IonItem
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
      @if (loadingService()) {
        <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (service(); as s) {

        <!-- Service summary -->
        <section class="summary">
          <div class="summary-icon">
            <ion-icon [name]="iconFor(s.category)"></ion-icon>
          </div>
          <div class="summary-text">
            <div class="summary-label">Booking</div>
            <h1 class="summary-name">{{ s.name }}</h1>
            <div class="summary-price">From ₱{{ s.price }} • {{ s.duration_minutes }} min</div>
          </div>
        </section>

        <!-- Date picker -->
        <section class="block">
          <h2>Pick a date</h2>
          <ion-datetime
            presentation="date"
            [min]="minDate"
            [max]="maxDate"
            [value]="selectedDate"
            (ionChange)="onDateChange($event)"
            [preferWheel]="false"
            [showDefaultButtons]="false"
            class="date-picker">
          </ion-datetime>
        </section>

        <!-- Time picker -->
        <section class="block">
          <h2>Pick a time</h2>
          @if (loadingSlots()) {
            <div class="loading"><ion-spinner name="crescent"></ion-spinner></div>
          } @else {
            <div class="slot-grid">
              @for (slot of slots(); track slot.iso) {
                <button
                  type="button"
                  class="slot"
                  [class.selected]="selectedSlot === slot.iso"
                  [class.disabled]="slot.busy"
                  [disabled]="slot.busy"
                  (click)="selectSlot(slot.iso)">
                  {{ slot.label }}
                </button>
              }
            </div>
          }
        </section>

        <!-- Notes -->
        <section class="block">
          <h2>Notes (optional)</h2>
          <ion-item lines="none" class="notes-field">
            <ion-textarea
              placeholder="Anything the dentist should know?"
              [(ngModel)]="notes"
              [autoGrow]="true"
              rows="3">
            </ion-textarea>
          </ion-item>
        </section>

        @if (error()) {
          <p class="err">{{ error() }}</p>
        }

        <div class="cta-wrap">
          <ion-button
            expand="block"
            class="cta"
            (click)="confirm()"
            [disabled]="!canConfirm() || submitting()">
            @if (submitting()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Confirm Booking
            }
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

    .summary {
      display: flex; gap: 14px; align-items: center;
      background: #e6f4fb; padding: 16px 20px;
      border-radius: 0 0 20px 20px;
    }
    .summary-icon {
      width: 48px; height: 48px; border-radius: 50%;
      background: #ffffff; color: #4EBE7D;
      display: grid; place-items: center; font-size: 24px; flex: 0 0 auto;
    }
    .summary-text { min-width: 0; }
    .summary-label { font-size: 11px; color: #4a6272; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-name { font-size: 18px; font-weight: 700; margin: 2px 0; color: #0A1E29; }
    .summary-price { font-size: 12px; color: #4a6272; }

    .block { padding: 20px 20px 0; }
    h2 { font-size: 15px; font-weight: 700; color: #0A1E29; margin: 0 0 10px; }

    .date-picker {
      --background: #f2f8fc;
      border-radius: 16px;
      width: 100%;
      max-width: 100%;
      margin: 0;
    }

    .slot-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }
    .slot {
      background: #e6f4fb; border: 2px solid transparent;
      color: #0A1E29; font-size: 13px; font-weight: 600;
      padding: 10px 4px; border-radius: 12px; cursor: pointer;
      transition: background 0.15s;
    }
    .slot.selected {
      background: #0A1E29; color: #ffffff; border-color: #0A1E29;
    }
    .slot.disabled {
      background: #f2f4f7; color: #b0bcc6;
      text-decoration: line-through; cursor: not-allowed;
    }

    .notes-field {
      --background: #f2f8fc;
      --border-radius: 16px;
      --padding-start: 14px;
      --inner-padding-end: 14px;
      border-radius: 16px;
    }

    .err { color: #c0392b; font-size: 13px; padding: 12px 20px 0; margin: 0; }

    .cta-wrap { padding: 24px 20px 32px; }
    .cta {
      --background: #0A1E29;
      --background-activated: #071620;
      --border-radius: 9999px;
      --color: #ffffff;
      height: 48px; font-weight: 600;
    }

    .loading { display: grid; place-items: center; padding: 30px; }
  `]
})
export class BookPage implements OnInit {
  service = signal<Service | null>(null);
  loadingService = signal(true);
  loadingSlots = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  selectedDate = new Date().toISOString().slice(0, 10);
  selectedSlot: string | null = null;
  notes = '';
  busyIsos = signal<Set<string>>(new Set());

  minDate = new Date().toISOString().slice(0, 10);
  maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  slots = computed(() => this.computeSlots(this.selectedDate, this.busyIsos()));

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private apptsApi: AppointmentsApi,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('serviceId');
    if (!id) { this.loadingService.set(false); return; }
    try {
      const res = await firstValueFrom(
        this.http.get<{ service: Service }>(`${environment.apiUrl}/services/${id}`)
      );
      this.service.set(res.service);
      await this.loadSlots();
    } catch {
      this.service.set(null);
    } finally {
      this.loadingService.set(false);
    }
  }

  async onDateChange(ev: any) {
    this.selectedDate = String(ev.detail.value).slice(0, 10);
    this.selectedSlot = null;
    await this.loadSlots();
  }

  async loadSlots() {
    this.loadingSlots.set(true);
    try {
      const busy = await this.apptsApi.getBusySlots(this.selectedDate);
      this.busyIsos.set(new Set(busy));
    } catch {
      this.busyIsos.set(new Set());
    } finally {
      this.loadingSlots.set(false);
    }
  }

  private computeSlots(date: string, busy: Set<string>) {
    const slots: { iso: string; label: string; busy: boolean }[] = [];
    const now = new Date();
    for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        const d = new Date(`${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
        const iso = d.toISOString();
        const label = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const isPast = d.getTime() < now.getTime();
        slots.push({ iso, label, busy: isPast || busy.has(iso) });
      }
    }
    return slots;
  }

  selectSlot(iso: string) {
    this.selectedSlot = iso;
  }

  canConfirm() {
    return !!this.service() && !!this.selectedSlot && !this.submitting();
  }

  async confirm() {
    if (!this.canConfirm()) return;
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.apptsApi.book({
        service_id: this.service()!.id,
        appointment_date: this.selectedSlot!,
        notes: this.notes.trim() || undefined
      });
      const t = await this.toastCtrl.create({
        message: 'Appointment booked!',
        duration: 1800, position: 'bottom', color: 'success'
      });
      await t.present();
      this.router.navigateByUrl('/app/appointments', { replaceUrl: true });
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Booking failed');
    } finally {
      this.submitting.set(false);
    }
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