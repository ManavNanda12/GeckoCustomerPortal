import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  imports: [MatIconModule],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.css'
})
export class SplashScreen {
 animate = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.animate = true; // start animation
      setTimeout(() => {
        this.router.navigate(['/home']); // after animation, go to Home
      }, 1000); // match animation duration (1s)
    }, 2000); // show splash for 2s
  }
}
