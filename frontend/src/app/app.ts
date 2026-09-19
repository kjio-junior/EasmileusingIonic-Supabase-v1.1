import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  // customer tabs + menu
  homeOutline, gridOutline, calendarOutline, personOutline,
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
  trendingUpOutline, arrowDownOutline, arrowBackOutline, arrowForwardOutline, lockClosedOutline,
  flagOutline, mailOutline, callOutline,
  locationOutline, logoInstagram, documentTextOutline, starOutline, star, chatbubblesOutline,
  imagesOutline, linkOutline, notificationsOutline, notificationsOffOutline, pricetagOutline, chatbubbleOutline
} from 'ionicons/icons';
import { AuthService } from './core/auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, RouterLink, RouterLinkActive
  ],
  template: `
    <ion-app>
      @if (auth.user(); as user) {
        <ion-menu contentId="customer-content" side="start" type="overlay">
          <ion-header class="ion-no-border">
            <ion-toolbar class="menu-head">
              <ion-title>{{ user.first_name }} {{ user.last_name }}</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list lines="none">
              <ion-item routerLink="/app/home" routerLinkActive="menu-active" [routerLinkActiveOptions]="{exact:true}" detail="false">
                <ion-icon slot="start" name="home-outline"></ion-icon>
                <ion-label>Home</ion-label>
              </ion-item>
              <ion-item routerLink="/app/services" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="grid-outline"></ion-icon>
                <ion-label>Services</ion-label>
              </ion-item>
              <ion-item routerLink="/app/wishlist" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="heart-outline"></ion-icon>
                <ion-label>My Wishlist</ion-label>
              </ion-item>
              <ion-item routerLink="/app/appointments" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                <ion-label>My Appointments</ion-label>
              </ion-item>
              <ion-item routerLink="/app/profile" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="person-outline"></ion-icon>
                <ion-label>My Profile</ion-label>
              </ion-item>
              <ion-item routerLink="/app/contact" routerLinkActive="menu-active" detail="false">
                <ion-icon slot="start" name="help-circle-outline"></ion-icon>
                <ion-label>Help &amp; Support</ion-label>
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
    </ion-app>
  `,
  styles: [`
    .menu-head { --background: #d9f0fb; --color: #0A1E29; }
    ion-menu ion-content { --background: #ffffff; --color: #0A1E29; }
    ion-menu ion-list { background: #ffffff; padding-top: 8px; }
    ion-menu ion-item {
      --background: #ffffff; --color: #0A1E29;
      --padding-start: 20px; --min-height: 52px; font-size: 15px;
    }
    ion-menu ion-item.menu-active { --background: #e6f4fb; font-weight: 600; }
    ion-menu ion-item ion-icon[slot="start"] { color: #4EBE7D; font-size: 22px; margin-right: 12px; }
    ion-menu ion-item ion-label { color: #0A1E29; }
  `]
})
export class App {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    addIcons({
      // customer
      homeOutline, gridOutline, calendarOutline, personOutline,
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
      trendingUpOutline, arrowDownOutline, arrowBackOutline, arrowForwardOutline, lockClosedOutline,
      flagOutline, mailOutline, callOutline,
      locationOutline, logoInstagram, documentTextOutline, starOutline, star, chatbubblesOutline,
      imagesOutline, linkOutline, notificationsOutline, notificationsOffOutline, pricetagOutline, chatbubbleOutline
    });

  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}