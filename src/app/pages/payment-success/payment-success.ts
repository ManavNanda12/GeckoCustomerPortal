import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css'
})
export class PaymentSuccess {

  constructor(private route: ActivatedRoute, private readonly router: Router) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log(sessionId);

    setTimeout(() => {
      this.router.navigate(['/subscriptions']);
    }, 3000);
  }

}
