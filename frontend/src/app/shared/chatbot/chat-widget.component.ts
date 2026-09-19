import { Component, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { ChatbotService } from '../../core/chatbot.service';

@Component({
  standalone: true,
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule, RouterLink, IonIcon],
  template: `
    <!-- Toggle button -->
    @if (!chat.open()) {
      <button type="button" class="chat-fab" (click)="chat.toggle()" aria-label="Open chat">
        <ion-icon name="chatbubbles-outline"></ion-icon>
        <span class="fab-dot"></span>
      </button>
    }

    <!-- Chat panel -->
    @if (chat.open()) {
      <div class="chat-panel">
        <header class="chat-header">
          <div class="chat-avatar">
            <ion-icon name="happy-outline"></ion-icon>
          </div>
          <div class="chat-title">
            <div class="chat-name">Smile Assistant</div>
            <div class="chat-status">Online</div>
          </div>
          <button type="button" class="chat-close" (click)="chat.close()" aria-label="Close">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </header>

        <div class="chat-body" #scrollBody>
          @for (m of chat.messages(); track m.id) {
            <div class="msg" [class.user]="m.sender === 'user'" [class.bot]="m.sender === 'bot'">
              <div class="bubble">
                <div class="bubble-text">{{ m.text }}</div>
                @if (m.actionLabel && m.actionLink) {
                  <a class="bubble-action" [routerLink]="m.actionLink" (click)="chat.close()">
                    {{ m.actionLabel }}
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                  </a>
                }
              </div>
            </div>
          }

          @if (chat.thinking()) {
            <div class="msg bot">
              <div class="bubble typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          }

          @if (chat.suggestions().length && !chat.thinking()) {
            <p class="suggestions-label">Quick questions</p>
            <div class="suggestions">
              @for (s of chat.suggestions(); track s) {
                <button type="button" class="suggestion" (click)="chat.ask(s)">
                  {{ s }}
                </button>
              }
            </div>
          }
        </div>

        <form class="chat-input" (submit)="send($event)">
          <input
            type="text"
            [(ngModel)]="draft"
            name="draft"
            placeholder="Type a message..."
            autocomplete="off"
            [disabled]="chat.thinking()" />
          <button type="submit" [disabled]="!draft.trim() || chat.thinking()">
            <ion-icon name="send-outline"></ion-icon>
          </button>
        </form>
      </div>
    }
  `,
  styles: [`
    .chat-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 200;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 0;
      background: #0A1E29;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(10,30,41,0.35);
      display: grid; place-items: center;
      transition: transform 0.15s, background 0.15s;
    }
    .chat-fab:hover { transform: scale(1.06); background: #142635; }
    .fab-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4EBE7D;
      box-shadow: 0 0 0 3px #ffffff;
    }

    .chat-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 200;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 48px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(10,30,41,0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.22s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }

    .chat-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: #0A1E29; color: #ffffff;
    }
    .chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #4EBE7D; color: #ffffff;
      display: grid; place-items: center; font-size: 22px; flex: 0 0 auto;
    }
    .chat-title { flex: 1; min-width: 0; }
    .chat-name { font-size: 14px; font-weight: 700; }
    .chat-status {
      font-size: 11px; color: #93D5ED; margin-top: 1px;
      display: flex; align-items: center; gap: 5px;
    }
    .chat-status::before {
      content: '';
      width: 6px; height: 6px; border-radius: 50%;
      background: #4EBE7D;
      box-shadow: 0 0 0 2px rgba(78,190,125,0.25);
    }
    .chat-close {
      background: transparent; border: 0;
      color: #ffffff; font-size: 20px;
      padding: 6px; cursor: pointer; border-radius: 50%;
      transition: background 0.15s;
    }
    .chat-close:hover { background: rgba(255,255,255,0.12); }

    .chat-body {
      flex: 1; overflow-y: auto;
      padding: 16px 14px 12px;
      background: #f7fafc;
      display: flex; flex-direction: column; gap: 10px;
    }

    .msg { display: flex; }
    .msg.user { justify-content: flex-end; }
    .msg.bot  { justify-content: flex-start; }

    .bubble {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .msg.bot .bubble {
      background: #ffffff;
      color: #0A1E29;
      border-bottom-left-radius: 6px;
      box-shadow: 0 1px 3px rgba(10,30,41,0.06);
    }
    .msg.user .bubble {
      background: #0A1E29;
      color: #ffffff;
      border-bottom-right-radius: 6px;
    }

    .bubble-action {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 10px;
      padding: 6px 12px;
      border-radius: 9999px;
      background: #4EBE7D; color: #ffffff;
      text-decoration: none;
      font-size: 12px; font-weight: 700;
      transition: background 0.15s;
    }
    .bubble-action:hover { background: #3ea66b; }
    .bubble-action ion-icon { font-size: 14px; }

    .typing { display: flex; gap: 4px; padding: 12px 14px; }
    .typing .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #b0bcc6;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .typing .dot:nth-child(2) { animation-delay: 0.15s; }
    .typing .dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
      30%           { transform: translateY(-5px); opacity: 1; }
    }

    .suggestions {
      display: flex; flex-direction: column; gap: 6px;
      margin-top: 4px;
    }
    .suggestions-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7a8a97;
      margin: 8px 4px 2px;
    }
    .suggestion {
      text-align: left;
      background: #ffffff;
      border: 1px solid #e6eef5;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 12.5px;
      font-weight: 600;
      color: #0A1E29;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .suggestion:hover { background: #f0f9f4; border-color: #4EBE7D; }

    .chat-input {
      display: flex; gap: 8px;
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #eef3f8;
    }
    .chat-input input {
      flex: 1;
      border: 1px solid #e6eef5;
      border-radius: 9999px;
      padding: 10px 16px;
      font-size: 13.5px;
      outline: none;
      font-family: inherit;
      color: #0A1E29;
      background: #f7fafc;
      transition: border-color 0.15s, background 0.15s;
    }
    .chat-input input:focus {
      border-color: #4EBE7D;
      background: #ffffff;
    }
    .chat-input button {
      width: 42px; height: 42px;
      border: 0; border-radius: 50%;
      background: #0A1E29; color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      display: grid; place-items: center;
      transition: background 0.15s;
      flex: 0 0 auto;
    }
    .chat-input button:hover:not(:disabled) { background: #142635; }
    .chat-input button:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 480px) {
      .chat-panel {
        right: 8px; left: 8px; bottom: 8px;
        width: auto;
        max-width: none;
        height: calc(100vh - 16px);
        max-height: none;
      }
      .chat-fab { bottom: 16px; right: 16px; }
    }
  `]
})
export class ChatWidgetComponent {
  @ViewChild('scrollBody') scrollBody?: ElementRef<HTMLDivElement>;
  draft = '';

  constructor(public chat: ChatbotService) {
    effect(() => {
      // Auto-scroll on new messages
      this.chat.messages();
      this.chat.thinking();
      setTimeout(() => {
        const el = this.scrollBody?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    });
  }

  async send(ev: Event) {
    ev.preventDefault();
    const text = this.draft;
    this.draft = '';
    await this.chat.ask(text);
  }
}