import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-error',
  imports: [],
  templateUrl: './payment-error.html',
  styleUrl: './payment-error.css'
})
export class PaymentError {

  constructor(private readonly router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/subscriptions']);
    }, 3000);
  }
}

