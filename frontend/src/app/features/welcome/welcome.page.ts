import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-welcome',
  imports: [IonContent],
  template: `
    <ion-content class="ion-padding">
      <div style="max-width:420px;margin:20vh auto 0;text-align:center;">
        <h1>You're in 🎉</h1>
        @if (auth.user(); as u) {
          <p>{{ u.first_name }} {{ u.last_name }} — {{ u.role }}</p>
        }
        <p><button (click)="logout()">Log out</button></p>
      </div>
    </ion-content>
  `
})
export class WelcomePage {
  constructor(public auth: AuthService, private router: Router) {}
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}