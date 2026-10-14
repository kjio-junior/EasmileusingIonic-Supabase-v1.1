import { Component } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  // customer tabs + menu
  homeOutline, gridOutline, calendarOutline, personOutline, appsOutline,
  heartOutline, heart, helpCircleOutline,
  chevronUpOutline, chevronDownOutline, sendOutline,
  personCircleOutline, happyOutline, searchOutline, chevronForwardOutline,
  logOutOutline, informationCircleOutline, settingsOutline, menuOutline,
  // services
  sparklesOutline, constructOutline, colorWandOutline, medicalOutline,
  eyeOutline, eyeOffOutline, ellipsisHorizontalOutline, cameraOutline,
  // admin
  peopleOutline, statsChartOutline, cubeOutline, cashOutline,
  timeOutline, alertCircleOutline, checkmarkCircleOutline, closeCircleOutline,
  banOutline, createOutline, addOutline, trashOutline, closeOutline,
  trendingUpOutline, arrowUpOutline, arrowDownOutline, arrowBackOutline, arrowForwardOutline, lockClosedOutline,
  lockOpenOutline, keyOutline, cardOutline, checkmark,
  flagOutline, mailOutline, callOutline,
  locationOutline, logoInstagram, documentTextOutline, starOutline, star, chatbubblesOutline,
  imagesOutline, linkOutline, notificationsOutline, notificationsOffOutline, pricetagOutline, chatbubbleOutline,
  bulbOutline, phonePortraitOutline, ribbonOutline, qrCodeOutline, storefrontOutline
} from 'ionicons/icons';
import { AuthService } from './core/auth.service';
import { LocalStorageNoticeComponent } from './shared/local-storage-notice.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, RouterLink, RouterLinkActive,
    LocalStorageNoticeComponent, TitleCasePipe
  ],
  template: `
    <ion-app>
      @if (auth.user(); as user) {
        <ion-menu contentId="customer-content" side="start" type="overlay">
          <ion-header class="ion-no-border">
            <div class="profile-header">
              <div class="profile-avatar">
                @if (user.profile_image) {
                  <img [src]="user.profile_image" alt="Profile photo" />
                } @else {
                  {{ initials(user.first_name, user.last_name) }}
                }
              </div>
              <div class="profile-info">
                <div class="profile-name">{{ user.first_name }} {{ user.last_name }}</div>
                <div class="profile-meta">
                  <span class="profile-role">{{ user.role | titlecase }}</span>
                  @if (user.phone) {
                    <span class="profile-phone">{{ user.phone }}</span>
                  }
                </div>
              </div>
            </div>
          </ion-header>
          <ion-content class="menu-content">
            <ion-list lines="none">
              <ion-item routerLink="/app/home" routerLinkActive="menu-active" [routerLinkActiveOptions]="{exact:true}" detail="false">
                <ion-icon slot="start" name="home-outline"></ion-icon>
                <ion-label>Home</ion-label>
              </ion-item>
              <ion-item routerLink="/app/services" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="grid-outline"></ion-icon>
                <ion-label>Services</ion-label>
              </ion-item>
              <ion-item routerLink="/history" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="time-outline"></ion-icon>
                <ion-label>Company History</ion-label>
              </ion-item>
              <ion-item routerLink="/app/appointments" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                <ion-label>My Appointments</ion-label>
              </ion-item>
              <ion-item routerLink="/app/wishlist" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="heart-outline"></ion-icon>
                <ion-label>My Wishlist</ion-label>
              </ion-item>
              <ion-item routerLink="/app/profile" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="person-outline"></ion-icon>
                <ion-label>My Profile</ion-label>
              </ion-item>
              <ion-item routerLink="/contact" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="help-circle-outline"></ion-icon>
                <ion-label>Help &amp; Support</ion-label>
              </ion-item>
              <ion-item routerLink="/about" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="information-circle-outline"></ion-icon>
                <ion-label>About the App</ion-label>
              </ion-item>
              <ion-item routerLink="/developers" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="people-outline"></ion-icon>
                <ion-label>Developers</ion-label>
              </ion-item>
              <ion-item (click)="logout()" detail="false" button>
                <ion-icon slot="start" name="log-out-outline"></ion-icon>
                <ion-label>Logout</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-menu>
      }
      <ion-router-outlet id="customer-content"></ion-router-outlet>
      <app-local-storage-notice></app-local-storage-notice>
    </ion-app>
  `,
  styles: [`
    /* Profile header */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 20px 22px;
      background: linear-gradient(135deg, #0A1E29 0%, #1a3a52 100%);
    }

    .profile-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4EBE7D;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 20px;
      font-weight: 700;
      flex: 0 0 auto;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    }
    .profile-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-info {
      flex: 1;
      min-width: 0;
    }
    .profile-name {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .profile-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .profile-role {
      display: inline-block;
      background: #4EBE7D;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 3px 10px;
      border-radius: 9999px;
    }
    .profile-phone {
      color: #93D5ED;
      font-size: 11.5px;
      font-weight: 500;
    }

    /* Menu items */
    .menu-content { --background: #ffffff; }

    ion-menu ion-list {
      background: #ffffff;
      padding-top: 8px;
    }
    ion-menu ion-item {
      --background: #ffffff;
      --color: #0A1E29;
      --padding-start: 20px;
      --min-height: 52px;
      font-size: 15px;
    }
    ion-menu ion-item.menu-active {
      --background: #e6f4fb;
      font-weight: 600;
    }
    ion-menu ion-item ion-icon[slot="start"] {
      color: #4EBE7D;
      font-size: 22px;
      margin-right: 12px;
    }
    ion-menu ion-item ion-label {
      color: #0A1E29;
    }

  `]
})
export class App {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    addIcons({
      // customer
      homeOutline, gridOutline, calendarOutline, personOutline, appsOutline,
      heartOutline, heart, helpCircleOutline,
      chevronUpOutline, chevronDownOutline, sendOutline,
      personCircleOutline, happyOutline, searchOutline, chevronForwardOutline,
      logOutOutline, informationCircleOutline, settingsOutline, menuOutline,
      // services
      sparklesOutline, constructOutline, colorWandOutline, medicalOutline,
      eyeOutline, eyeOffOutline, ellipsisHorizontalOutline, cameraOutline,
      // admin
      peopleOutline, statsChartOutline, cubeOutline, cashOutline,
      timeOutline, alertCircleOutline, checkmarkCircleOutline, closeCircleOutline,
      banOutline, createOutline, addOutline, trashOutline, closeOutline,
      trendingUpOutline, arrowUpOutline, arrowDownOutline, arrowBackOutline, arrowForwardOutline, lockClosedOutline,
      lockOpenOutline, keyOutline, cardOutline, checkmark,
      flagOutline, mailOutline, callOutline,
      locationOutline, logoInstagram, documentTextOutline, starOutline, star, chatbubblesOutline,
      imagesOutline, linkOutline, notificationsOutline, notificationsOffOutline, pricetagOutline, chatbubbleOutline,
      bulbOutline, phonePortraitOutline, ribbonOutline, qrCodeOutline, storefrontOutline
    });

    // Refresh the user cache on boot so stale fields self-heal
    if (this.auth.token()) {
      this.auth.refreshUser();
    }
  }

  initials(first: string, last: string): string {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}