import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot implements AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatsArray: any[] = [];
  chatMessage: string = '';
  customerId: any = 0;
  isThinking: boolean = false;

  constructor(private readonly api: ApiUrlHelper, private readonly common: Common) {
    this.customerId = localStorage.getItem('CustomerId') || 0;
    this.chatsArray = [
      {
        type: 'bot',
        message: "👋 Hey! I'm GymBot. How can I help you crush your fitness goals today?"
      }
    ];
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  // Convert markdown to clean HTML
  parseMarkdown(text: string): string {
    if (!text) return '';

    let html = text

      // Bold: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')

      // Italic: *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')

      // Numbered list: lines starting with "1. ", "2. " etc.
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

      // Bullet list: lines starting with "- " or "* "
      .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')

      // Wrap consecutive <li> in <ul>
      .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, (match) => `<ul>${match}</ul>`)

      // Line breaks: double newline → paragraph break
      .replace(/\n{2,}/g, '</p><p>')

      // Single newline → <br>
      .replace(/\n/g, '<br/>');

    // Wrap in paragraph if not already structured
    if (!html.startsWith('<ul>') && !html.startsWith('<ol>')) {
      html = `<p>${html}</p>`;
    }

    return html;
  }

  buildMessageHistory(): { role: string; content: string }[] {
    return this.chatsArray
      .filter((chat: any) => chat.type === 'bot' || chat.type === 'customer')
      .map((chat: any) => ({
        role: chat.type === 'bot' ? 'assistant' : 'user',
        content: chat.message
      }));
  }

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
      history: this.buildMessageHistory()
    };

    this.common.postData(api, requestedModel).pipe().subscribe({
      next: (response: any) => {
        this.isThinking = false;
        this.chatsArray.push({
          type: 'bot',
          message: this.parseMarkdown(response.data) // parse markdown here
        });
      },
      error: (error: any) => {
        this.isThinking = false;
        this.chatsArray.push({
          type: 'bot',
          message: '⚠️ Oops! Something went wrong. Please try again.'
        });
        console.error(error);
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.chatWithAgent();
    }
  }
}