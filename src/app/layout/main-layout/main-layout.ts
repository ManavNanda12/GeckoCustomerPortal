import { AfterViewInit, Component } from '@angular/core';
import { Header } from "../../component/header/header";
import { Footer } from "../../component/footer/footer";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chatbot } from '../../pages/chatbot/chatbot'; // adjust path

@Component({
  selector: 'app-main-layout',
  imports: [Header, Footer, RouterOutlet, CommonModule, Chatbot],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements AfterViewInit {

  isChatOpen = false;

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  ngAfterViewInit() {
    const video = document.querySelector('.bg-video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => {
          const playOnInteraction = () => {
            video.play();
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
      });
    }
  }
}