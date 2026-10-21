import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon } from '@ionic/angular/standalone';

@Component({
	standalone: true,
	selector: 'app-privacy',
	imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon],
	template: `
		<ion-header class="ion-no-border">
			<ion-toolbar class="top-bar">
				<ion-buttons slot="start">
					<ion-back-button defaultHref="/" text=""></ion-back-button>
				</ion-buttons>
				<ion-title class="brand">Privacy Policy</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="bg">
			<div class="wrap">
				<h1>Privacy Policy</h1>
				<p>Last updated: October 2026</p>

				<h2>1. Information We Collect</h2>
				<p>We collect information you provide when creating an account, booking an appointment, or contacting the clinic, such as your name, contact details, and appointment preferences.</p>

				<h2>2. How We Use Your Information</h2>
				<p>Your information is used to manage your account and appointments, communicate with you, and improve the EAsmile service.</p>

				<h2>3. Sharing & Security</h2>
				<p>We do not sell your personal information. Information may be shared with the clinic as needed to provide requested services. We use reasonable measures to protect your information.</p>

				<h2>4. Your Choices</h2>
				<p>You may contact the clinic to request access to, correction of, or deletion of your personal information, subject to applicable requirements.</p>

				<p style="margin-top: 40px; text-align: center;">
					<a routerLink="/onboarding">← Back to Home</a>
				</p>
			</div>
		</ion-content>
	`,
	styles: [`
		.top-bar { --background: #f2f8fc; --color: #0A1E29; }
		.brand { font-weight: 700; font-size: 16px; }
		.bg { --background: #ffffff; color: #0A1E29; }
		.wrap { max-width: 800px; margin: 0 auto; padding: 30px 20px; }
		h1 { font-size: 28px; font-weight: 800; color: #0A1E29; margin-bottom: 4px; }
		p { font-size: 14px; color: #4a6272; line-height: 1.6; margin-bottom: 16px; }
		h2 { font-size: 18px; font-weight: 700; color: #0A1E29; margin-top: 32px; margin-bottom: 8px; }
		a { color: #4EBE7D; font-weight: 600; text-decoration: none; }
	`]
})
export class PrivacyPage {}
