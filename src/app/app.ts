import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { GymLoader } from "./pages/gym-loader/gym-loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule, GymLoader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'GeckoCustomerPortal';
  constructor(private spinner:NgxSpinnerService) {}
}
