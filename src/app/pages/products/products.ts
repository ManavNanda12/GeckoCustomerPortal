import { Component } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { gymImages, ProductResponse } from '../../../common/models/CommonInterfaces';
import { Common } from '../../../services/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductDetail } from './product-detail/product-detail';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-products',
  imports: [CommonModule,MatIconModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {

  // Common Properties
  products:ProductResponse[] = [];
  categoryId:any;
  customerId:any;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly activatedRoute:ActivatedRoute,
    private readonly router:Router,
    private readonly dialog: MatDialog
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      this.getProducts(this.categoryId);
    });
    this.customerId = localStorage.getItem('CustomerId') || 0;
   }

  getProducts(categoryId?:number){
    let api = this.api.Product.GetProducts.replace(":categoryId", categoryId?.toString() || "0");
    this.spinner.show();
    this.common.getData(api).pipe().subscribe({
      next: (res) => {
        this.products = res.data;
      },
      error: (err: any) => {
        this.toastr.error("Failed to fetch products", "Error");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  toggleWishlist(product: any) {
    product.isWishlisted = !product.isWishlisted;
  }

  handleImageError(product: ProductResponse) {
    product.productImage = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  redirectToCategory(){
    this.router.navigate(['/category']);
  }

  addToCart(product:ProductResponse,event: MouseEvent){
    let sessionId = this.common.getSessionId();
    if(sessionId == null || sessionId == ""){
      sessionId = this.common.resetSession();
    }
    let cartItem = {
      productId: product.productID,
      price: product.price,
      quantity: 1,
      sessionId: sessionId,
      customerId:this.customerId,
      discount:0
    }
    this.common.postData(this.api.Cart.AddToCart, cartItem).pipe().subscribe({
      next: (res) => {
        if(res.success){
          this.toastr.success(res.message);
          this.flyToCart(event , res.data);
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to add product to cart", "Error");
      },
      complete: () => { this.spinner.hide(); }
    });
}

flyToCart(event: MouseEvent,count:number) {
  const cart = document.querySelector('.cart-icon') as HTMLElement;
  if (!cart) return;

  // Create rocket element (FontAwesome)
  const rocket = document.createElement('i');
  rocket.classList.add('fa-solid', 'fa-rocket', 'flying-rocket');
  document.body.appendChild(rocket);

  // Start (button click) and end (cart) positions
  const startX = event.clientX;
  const startY = event.clientY;
  const cartRect = cart.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // Initial position
  rocket.style.left = `${startX}px`;
  rocket.style.top = `${startY}px`;

  // Force reflow
  rocket.getBoundingClientRect();

  // Animate along a smooth curved path using translate + rotate
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const rotate = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // angle to cart
  rocket.style.transition = 'transform 0.8s cubic-bezier(0.68,-0.55,0.27,1.55), opacity 0.8s ease';
  rocket.style.transform = `translate(${deltaX}px, ${deltaY - 50}px) rotate(${rotate}deg) scale(1.5)`; // slight arc up

  // Optional: fade out at end
  setTimeout(() => rocket.style.opacity = '0', 600);

  // Remove rocket after animation ends
  rocket.addEventListener('transitionend', () => {
    rocket.remove();
    this.common.triggerCartAnimation(); 
    this.common.setCartProductCount(count);
  });
}

openProductDetail(product :ProductResponse){
  this.dialog.open(ProductDetail, {
    data: { product: product },
    maxWidth:'1000px'
  });
}




    
}
