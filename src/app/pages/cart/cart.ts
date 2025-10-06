import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../../services/common';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { CommonModule } from '@angular/common';
import { gymImages } from '../../../common/models/CommonInterfaces';

@Component({
  selector: 'app-cart',
  imports: [CommonModule,RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy {

  // Common Properties
  cartItems: any[] = [];
  showCelebration: boolean = false;
  private animationFrame: any;
  customerId: number =0;
  cartId: number =0;

  constructor(
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly router:Router,
    private readonly api: ApiUrlHelper,
    private readonly ngZone: NgZone
  ) {
   }

  ngOnInit(): void {
    this.customerId = Number(sessionStorage.getItem('customerId')) || 0;
    this.getCartDetails();
  }

  getCartDetails(){
    this.spinner.show();
    let requestedModel ={
      sessionId: this.common.getSessionId(),
      customerId: this.customerId
    }
    this.common.postData(this.api.Cart.GetCartDetails,requestedModel).pipe().subscribe({
      next: (res) => {
        this.cartId = res.data[0]?.cartId;
        this.cartItems = res.data;
        this.common.setCartProductCount(this.cartItems.length);
        if(this.cartItems[0]?.cartId > 0 && this.customerId > 0 && this.cartItems.length > 0 && this.cartItems[0]?.customerId == 0){
          this.updateCartCustomerId();
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to fetch cart details");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  increaseQuantity(item: any) {
    item.quantity++;
    item.itemTotal = item.quantity * item.price;
    this.updateCart(item);
  }
  
  decreaseQuantity(item: any) {
      item.quantity--;
      item.itemTotal = item.quantity * item.price;
      this.updateCart(item);
  }
  
  getCartTotal() {
    return this.cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  }

  handleImageError(item: any) {
    item.imageUrl = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  updateCart(item: any) {
    let updatedItem = {
      productId: item.productId,
      newQuantity: item.quantity,
      sessionId: this.common.getSessionId(),
      customerId:this.customerId
    }
    this.common.postData(this.api.Cart.UpdateCartQuantity,updatedItem).pipe().subscribe({
      next: (res) => {
        if(res.success){
          this.toastr.success(res.message);
          this.getCartDetails();
        }
        else{
          this.toastr.error(res.message);
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to update cart");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  checkout(){
    this.spinner.show();
    let requestedModel ={
      cartSessionId: this.common.getSessionId(),
      customerId:this.customerId,
      billingAddress:"Jam",
      shippingAddress:"Jam",
      paymentMethod:"Cash On Delivery",
      shippingSameAsBilling:true,
      orderNotes:""
    }
    this.common.postData(this.api.Order.CheckOut,requestedModel).pipe().subscribe({
      next: (res) => {
        if(res.success){
          this.showCelebration = true;
          setTimeout(() => {
            this.ngZone.runOutsideAngular(() => {
              this.startFireworks();
            });
          }, 1000);
        
          setTimeout(() => {
            this.showCelebration = false;
            this.getCartDetails();
            cancelAnimationFrame(this.animationFrame);
          }, 10000);
        }
        else{
          this.toastr.error(res.message);
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to checkout");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  startFireworks() {
    const canvas = document.getElementById('fireworksCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];

    const createFirework = (x: number, y: number) => {
      const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#fd79a8', '#a29bfe'];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x, y,
          angle: Math.random() * 2 * Math.PI,
          speed: Math.random() * 6 + 2,
          radius: 2,
          life: 80,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.speed *= 0.95;
        p.life--;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.life <= 0) particles.splice(i, 1);
      }

      this.animationFrame = requestAnimationFrame(render);
    };

    // launch fireworks every 600ms
    const interval = setInterval(() => {
      if (!this.showCelebration) {
        clearInterval(interval);
        return;
      }
      createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5);
    }, 600);

    render();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
  }

  updateCartCustomerId(){
    this.spinner.show();
    let requestedModel ={
      cartId: this.cartId,
      customerId:this.customerId
    }
    this.common.postData(this.api.Cart.UpdateCartCustomerId,requestedModel).pipe().subscribe({
      next: (res) => {
        console.log(res)
        this.toastr.success("Cart updated successfully");
      },
      error: (err: any) => {
        this.toastr.error("Failed to update cart", "Error");
      },
      complete: () => { this.spinner.hide(); }
    })
  }


}
