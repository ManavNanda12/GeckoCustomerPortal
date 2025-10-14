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
      this.animate = true;
      
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 800);
      });

    }, 1500);
  }
}
