import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-gym-loader',
  imports: [CommonModule],
  templateUrl: './gym-loader.html',
  styleUrl: './gym-loader.css'
})
export class GymLoader {

   // Random loader selection
  selectedLoader: number = 1;
 
  // Available loaders array
  loaders = [
    { id: 1, name: 'Spinning Dumbbell' },
    { id: 2, name: 'Barbell Lift' },
    { id: 3, name: 'Bouncing Weights' },
    { id: 4, name: 'Kettlebell Swing' },
    { id: 5, name: 'Pulsing Muscle' },
    { id: 6, name: 'Progress Bar' },
    { id: 7, name: 'Rotating Plates' },
    { id: 8, name: 'Lifting Dots' }
  ];
 
  // Loading messages (optional - randomly select one)
  loadingMessages = [
    'Loading your gains...',
    'Pumping up the data...',
    'Flexing the muscles...',
    'Warming up the weights...',
    'Getting swole...',
    'Loading...',
    'Just a moment...',
    'Preparing your workout...'
  ];
 
  selectedMessage: string = 'Loading...';
 
  ngOnInit(): void {
    // Randomly select a loader when component initializes
    this.selectRandomLoader();
    this.selectRandomMessage();
  }
 
  selectRandomLoader(): void {
    const randomIndex = Math.floor(Math.random() * this.loaders.length);
    this.selectedLoader = this.loaders[randomIndex].id;
  }
 
  selectRandomMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.loadingMessages.length);
    this.selectedMessage = this.loadingMessages[randomIndex];
  }
 
  // Method to manually set a specific loader (optional)
  setLoader(loaderId: number): void {
    this.selectedLoader = loaderId;
  }

}
