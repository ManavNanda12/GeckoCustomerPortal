import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { Common } from '../../../../services/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  gymImages,
  ProductResponse,
} from '../../../../common/models/CommonInterfaces';
import { ProductDetail } from '../../products/product-detail/product-detail';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, MatIconModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  // Common Properties
  wishList: any;
  customerId: any;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly spinner: NgxSpinnerService,
    private readonly common: Common,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getWishList();
    this.customerId = localStorage.getItem('CustomerId') || '';
  }

  getWishList() {
    this.spinner.show();
    let api = this.api.Wishlist.GetWishList;
    this.common
      .getData(api)
      .pipe()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.wishList = response.data;
          }
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          this.spinner.hide();
        },
      });
  }

  handleImageError(product: ProductResponse) {
    product.productImage =
      gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  openProductDetail(product: ProductResponse) {
    this.dialog.open(ProductDetail, {
      data: { product: product },
      maxWidth: '1000px',
    });
  }

  removeFromWishlist(product: ProductResponse) {
    Swal.fire({
      title: 'Remove item from wishlist?',
      text: 'Do you want to remove item from wishlist?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        let api = this.api.Wishlist.RemoveWishlistItem;
        let data = {
          ProductId: product.productID,
          CustomerId: this.customerId,
        };
        this.common
          .postData(api, data)
          .pipe()
          .subscribe({
            next: (res) => {
              if (res.success) {
                this.toastr.success(res.message);
                this.getWishList();
              }
            },
            error: (err: any) => {
              this.toastr.error(
                'Failed to remove product from wishlist',
                'Error'
              );
            },
            complete: () => {
              this.spinner.hide();
            },
          });
      }
    });
  }
}
