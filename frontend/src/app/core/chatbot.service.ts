import { Injectable, signal } from '@angular/core';
import { FaqsApi, Faq } from './faqs.service';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionLabel?: string;
  actionLink?: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  readonly messages = signal<ChatMessage[]>([]);
  readonly open = signal(false);
  readonly thinking = signal(false);

  private faqs: Faq[] = [];
  private loaded = false;

  constructor(private faqsApi: FaqsApi) {}

  async ensureLoaded() {
    if (this.loaded) return;
    try {
      this.faqs = await this.faqsApi.listActive();
    } catch {
      this.faqs = [];
    }
    this.loaded = true;
  }

  toggle() {
    this.open.update(v => !v);
    if (this.open() && this.messages().length === 0) {
      this.greet();
    }
  }

  close() {
    this.open.set(false);
  }

  reset() {
    this.messages.set([]);
    this.greet();
  }

  private greet() {
    this.push({
      sender: 'bot',
      text: "Hi! I'm Smile, your EAsmile assistant. Ask me anything, or pick a topic below."
    });
  }

  suggestions(): string[] {
    if (!this.faqs.length) {
      return ['Book an appointment', 'Contact support', 'Payment methods'];
    }
    return this.faqs.slice(0, 4).map(f => f.question);
  }

  async ask(text: string) {
    const clean = text.trim();
    if (!clean) return;

    this.push({ sender: 'user', text: clean });
    this.thinking.set(true);

    await this.ensureLoaded();

    // Simulate a natural pause
    await new Promise(r => setTimeout(r, 450));

    const reply = this.match(clean);
    this.thinking.set(false);

    // Stream the answer in (split by sentence for a natural feel)
    const sentences = reply.text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 1) {
      this.push(reply);
    } else {
      let buffer = '';
      for (const s of sentences) {
        buffer += (buffer ? ' ' : '') + s;
        this.thinking.set(true);
        await new Promise(r => setTimeout(r, 300));
        this.thinking.set(false);
        // Replace the last bot message if streaming the same one
        this.replaceLastBot(buffer, reply);
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  private replaceLastBot(text: string, meta: { actionLabel?: string; actionLink?: string }) {
    this.messages.update(list => {
      const next = [...list];
      const last = next[next.length - 1];
      if (last && last.sender === 'bot' && (last as any)._streaming) {
        next[next.length - 1] = { ...last, text, actionLabel: meta.actionLabel, actionLink: meta.actionLink };
      } else {
        next.push({
          id: crypto.randomUUID(),
          sender: 'bot',
          text,
          actionLabel: meta.actionLabel,
          actionLink: meta.actionLink,
          timestamp: new Date(),
          ...(meta as any)
        } as ChatMessage);
        (next[next.length - 1] as any)._streaming = true;
      }
      return next;
    });
  }

  private push(msg: Partial<ChatMessage>) {
    this.messages.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        sender: msg.sender ?? 'bot',
        text: msg.text ?? '',
        actionLabel: msg.actionLabel,
        actionLink: msg.actionLink,
        timestamp: new Date()
      } as ChatMessage
    ]);
  }

  private match(query: string): { sender: 'bot'; text: string; actionLabel?: string; actionLink?: string } {
    const q = query.toLowerCase().trim();

    // Special intents
    if (/\b(hi|hello|hey|yo)\b/.test(q)) {
      return { sender: 'bot', text: "Hey there! What can I help you with today?" };
    }
    if (/\b(thanks|thank you|ty)\b/.test(q)) {
      return { sender: 'bot', text: "You're welcome! Anything else I can help with?" };
    }
    if (/\b(book|appointment|schedule|reserve)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'You can book an appointment by going to the Services tab, picking a service, and tapping "Book Your Appointment". You can also browse all services first.',
        actionLabel: 'Browse Services',
        actionLink: '/app/services'
      };
    }
    if (/\b(contact|support|help|human|agent|call|email)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'We\'d love to help. You can reach us by email at easmile.08@email.com, by phone at +63 123 456 7890, or through our Contact page.',
        actionLabel: 'Open Contact Page',
        actionLink: '/app/contact'
      };
    }
    if (/\b(price|cost|how much|fee|payment|pay)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'Service prices vary and are shown on each service card. We accept cash, debit/credit cards, and GCash. Payment is collected at the clinic after your visit.'
      };
    }
    if (/\b(login|sign in|account|register|sign up)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'You can log in or create a free account from the top-right corner.',
        actionLabel: 'Go to Login',
        actionLink: '/login'
      };
    }
    if (/\b(hours|open|schedule|time)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'We\'re open Monday to Friday, 9:00 AM – 6:00 PM. Weekends are by appointment only.'
      };
    }
    if (/\b(location|address|where|find you|directions)\b/.test(q)) {
      return {
        sender: 'bot',
        text: 'We\'re located at 938 Aurora Blvd, Cubao, Quezon City, Metro Manila.'
      };
    }

    // FAQ keyword matching
    const scored = this.faqs.map(f => {
      const text = (f.question + ' ' + f.answer).toLowerCase();
      const tokens = q.split(/\s+/).filter(t => t.length > 2);
      let score = 0;
      for (const t of tokens) {
        if (text.includes(t)) score += 1;
      }
      return { faq: f, score };
    }).sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score > 0) {
      return { sender: 'bot', text: scored[0].faq.answer };
    }

    return {
      sender: 'bot',
      text: "I'm not sure I understand that one. You can try asking about bookings, payment, our location, or reach out to a human through our Contact page.",
      actionLabel: 'Open Contact Page',
      actionLink: '/app/contact'
    };
  }
}