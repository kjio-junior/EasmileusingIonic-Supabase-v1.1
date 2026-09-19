import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { NotificationBellComponent } from './notification-bell.component';

@Component({
  standalone: true,
  selector: 'app-customer-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, NotificationBellComponent],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="custom-tabbar">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="services">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>Services</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="appointments">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Appointment</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <app-notification-bell></app-notification-bell>
  `,
  styles: [`
    .custom-tabbar {
      --background: #ffffff;
      --color: #7a8a97;
      --color-selected: #0A1E29;
      border-top: 1px solid #e6eef5;
    }
    ion-tab-button { font-size: 11px; }
  `]
})
export class CustomerTabsComponent {}