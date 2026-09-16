import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-splash',
  imports: [IonContent],
  template: `
    <ion-content class="splash-bg" [fullscreen]="true" [scrollY]="false">
      <div class="pattern"></div>

      <div class="center">
        <h1 class="logo" aria-label="EAsmile">
           <span class="ea">EA</span><span class="light">sm</span><span class="smile-i" aria-hidden="true"><svg viewBox="0 0 70 190" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 58 8
                C 66 55, 60 105, 45 140
                C 33 168, 18 180, 8 172
                C 2 167, 5 158, 14 162"
              stroke="#0A1E29"
              stroke-width="7"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg></span><span class="light">le</span>
        </h1>
      </div>

      <p class="tagline">Your Dental Care, All in One Place.</p>
    </ion-content>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@800&display=swap');

    .splash-bg {
      --background: #BFE4F5;
    }

    .pattern {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='60' viewBox='0 0 50 60'><path d='M25 8 C 15 8 7 15 7 25 C 7 35 12 48 17 54 C 19 57 22 56 22 51 C 22 43 23 37 25 37 C 27 37 28 43 28 51 C 28 56 31 57 33 54 C 38 48 43 35 43 25 C 43 15 35 8 25 8 Z' fill='none' stroke='%23ffffff' stroke-opacity='0.45' stroke-width='1.3'/></svg>");
      background-repeat: repeat;
      background-size: 60px 72px;
      pointer-events: none;
    }

    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: 480px;
      padding: 0 24px;
      text-align: center;
    }

    .logo {
      display: block;
      margin: 0;
      font-family: 'Poppins', 'Nunito', 'Segoe UI', system-ui, sans-serif;
      font-size: 72px;
      font-weight: 800;
      letter-spacing: -2px;
      line-height: 1;
      white-space: nowrap;
      text-shadow:
        2px 2px 0 #0A1E29,
        3px 3px 0 rgba(10,30,41,0.35),
        4px 4px 10px rgba(10,30,41,0.25);
      overflow: visible;
    }

    .ea {
      color: #2E9FE0;
    }
    .light {
      color: #5BAFE0;
    }

    .smile-i {
      display: inline-block;
      width: 0.55em;
      height: 1.75em;
      vertical-align: -0.65em;
      margin: 0 0.04em 0 0.06em;
    }
    .smile-i svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
      filter: drop-shadow(2px 2px 0 rgba(10,30,41,0.25));
    }

    .tagline {
      position: absolute;
      bottom: 48px;
      left: 0;
      right: 0;
      margin: 0 auto;
      max-width: 480px;
      text-align: center;
      color: #0A1E29;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    @media (min-width: 1024px) {
      .logo { font-size: 88px; }
      .tagline { font-size: 14px; bottom: 72px; }
    }
  `]
})
export class SplashPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigateByUrl('/onboarding', { replaceUrl: true });
    }, 2500);
  }
}