import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

const STORAGE_KEY = 'storage_notice_dismissed';

@Component({
  standalone: true,
  selector: 'app-local-storage-notice',
  imports: [CommonModule, IonIcon],
  template: `
    @if (!dismissed()) {
      <div class="notice-bar">
        <div class="notice-inner">
          <ion-icon name="information-circle-outline" class="notice-icon"></ion-icon>
          <div class="notice-text">
            <strong>About local storage</strong>
            <p>
              We use your browser's local storage to keep you signed in and remember
              your preferences. We don't use tracking cookies or share your data
              with third parties.
            </p>
          </div>
          <button type="button" class="notice-btn" (click)="dismiss()">
            Got it
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .notice-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 400;
      background: #0A1E29;
      color: #ffffff;
      padding: 14px 20px;
      animation: slideUp 0.35s ease-out;
      box-shadow: 0 -4px 16px rgba(10,30,41,0.15);
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }

    .notice-inner {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .notice-icon {
      font-size: 26px;
      color: #93D5ED;
      flex: 0 0 auto;
    }

    .notice-text {
      flex: 1;
      min-width: 0;
    }
    .notice-text strong {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .notice-text p {
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
      opacity: 0.82;
    }

    .notice-btn {
      flex: 0 0 auto;
      background: #4EBE7D;
      color: #ffffff;
      border: 0;
      border-radius: 9999px;
      padding: 9px 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .notice-btn:hover { background: #3ea66b; }

    @media (max-width: 640px) {
      .notice-inner {
        flex-wrap: wrap;
      }
      .notice-icon { font-size: 22px; }
      .notice-btn {
        width: 100%;
        order: 3;
        margin-top: 4px;
      }
    }
  `]
})
export class LocalStorageNoticeComponent {
  dismissed = signal<boolean>(this.readDismissed());

  private readDismissed(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    this.dismissed.set(true);
  }
}