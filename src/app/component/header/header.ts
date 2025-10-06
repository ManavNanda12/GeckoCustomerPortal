import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { Common } from '../../../services/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  // Common Properties
  cartItems: number = 0;
  isLoggedIn: boolean = false;
  customerId: number =0;

  constructor(
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly router:Router,
    private readonly api: ApiUrlHelper
  ) {
    this.common.cartProductCount$.subscribe((count) => {
      this.cartItems = count;
    });
    this.common.cartAnimate$.subscribe(() => {
      this.animateCart();  
    });
    this.isLoggedIn = localStorage.getItem('JwtToken') !== null;
    this.customerId = Number(localStorage.getItem('CustomerId')) || 0;  
   }

   ngOnInit(): void {
    this.getCartDetails();
   }

   getCartDetails(){
    this.spinner.show();
    let requestedModel ={
      sessionId: this.common.getSessionId(),
      customerId:this.customerId
    }
    this.common.postData(this.api.Cart.GetCartDetails,requestedModel).pipe().subscribe({
      next: (res) => {
        this.cartItems = res.data.filter((item: any) => item.quantity > 0).length;
      },
      error: (err: any) => {
        this.toastr.error("Failed to fetch cart details", "Error");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  animateCart() {
    const cart = document.querySelector('.cart-icon');
    if (cart) {
      cart.classList.add('cart-bounce');
      setTimeout(() => cart.classList.remove('cart-bounce'), 700);
    }
  }

}
