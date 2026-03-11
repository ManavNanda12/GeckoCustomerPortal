import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatsArray: any[] = [];
  chatMessage: string = '';
  customerId: any = 0;
  isThinking: boolean = false;

  // Cookie key is unique per customer
  get cookieKey(): string {
    return `chatMessages_${this.customerId}`;
  }

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly common: Common,
  ) {}

  ngOnInit() {
    this.customerId = localStorage.getItem('CustomerId') || 0;

    const defaultGreeting = [
      {
        type: 'bot',
        message: "👋 Hey! I'm GymBot. How can I help you crush your fitness goals today?",
      },
    ];

    this.chatsArray = defaultGreeting;

    // Load chat history from cookie using customer-specific key
    if (this.customerId && this.customerId != 0) {
      const stored = this.getCookie(this.cookieKey);
      if (stored) {
        try {
          this.chatsArray = JSON.parse(decodeURIComponent(stored));
        } catch (e) {
          this.chatsArray = defaultGreeting;
        }
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // ── Cookie Helpers ──────────────────────────────────────

  setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name: string): string | null {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));
    return match ? match.split('=')[1] : null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  // ── Scroll ──────────────────────────────────────────────

  scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  // ── Markdown Parser ─────────────────────────────────────

  parseMarkdown(text: string): string {
    if (!text) return '';

    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
      .replace(
        /(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g,
        (match) => `<ul>${match}</ul>`,
      )
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    if (!html.startsWith('<ul>') && !html.startsWith('<ol>')) {
      html = `<p>${html}</p>`;
    }

    return html;
  }

  // ── Message History ─────────────────────────────────────

  buildMessageHistory(): { role: string; content: string }[] {
    return this.chatsArray
      .filter((chat: any) => chat.type === 'bot' || chat.type === 'customer')
      .map((chat: any) => ({
        role: chat.type === 'bot' ? 'assistant' : 'user',
        content: chat.message,
      }));
  }

  // ── Send Message ────────────────────────────────────────

  chatWithAgent() {
    if (!this.chatMessage?.trim()) return;

    const userMessage = this.chatMessage.trim();
    this.chatMessage = '';

    this.chatsArray.push({ type: 'customer', message: userMessage });
    this.isThinking = true;

    const api = this.api.Chat.ChatWithAgent;
    const requestedModel = {
      customerId: this.customerId,
      message: userMessage,
      history: this.buildMessageHistory(),
    };

    this.common
      .postData(api, requestedModel)
      .pipe()
      .subscribe({
        next: (response: any) => {
          this.isThinking = false;
          this.chatsArray.push({
            type: 'bot',
            message: this.parseMarkdown(response.data),
          });
          // Save with customer-specific cookie key
          this.setCookie(this.cookieKey, JSON.stringify(this.chatsArray), 7);
        },
        error: (error: any) => {
          this.isThinking = false;
          this.chatsArray.push({
            type: 'bot',
            message: '⚠️ Oops! Something went wrong. Please try again.',
          });
          console.error(error);
        },
      });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.chatWithAgent();
    }
  }

  // ── Clear Chat (call on logout) ─────────────────────────

  clearChat() {
    this.deleteCookie(this.cookieKey);
    this.chatsArray = [
      {
        type: 'bot',
        message: "👋 Hey! I'm GymBot. How can I help you crush your fitness goals today?",
      },
    ];
  }
}
