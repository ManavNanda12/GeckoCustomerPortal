import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../../../../services/common';
import { ApiUrlHelper } from '../../../../../common/ApiUrlHelper';
import { CommonModule } from '@angular/common';
import { gymImages } from '../../../../../common/models/CommonInterfaces';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail {

  orderId: any;
  orderDetails: any;

  constructor(
    public dialogRef: MatDialogRef<OrderDetail>,
    private readonly api: ApiUrlHelper,
    private readonly commonService: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService
  ) {
    this.orderId = inject(MAT_DIALOG_DATA).orderId;
    console.log(this.orderId);
    this.getOrderDetails();
  }

  getOrderDetails() {
    this.spinner.show();
    let api = this.api.Order.GetOrderDetails.replace('{orderId}', this.orderId);
    this.commonService.getData(api).pipe().subscribe({
      next: (response) => {
        if (response.success) {
          this.orderDetails = response.data;
          console.log(this.orderDetails);
        }
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('Failed to load order details');
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  handleImageError(product: any) {
    product.imageUrl = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

  // Order Status Methods
  getOrderStatusClass(status: number): string {
    const statusMap: any = {
      0: 'pending',
      1: 'processing',
      2: 'shipped',
      3: 'delivered',
      4: 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  getOrderStatusIcon(status: number): string {
    const icons: any = {
      1: 'fa-regular fa-clock',           // Pending
      2: 'fa-solid fa-gears',             // Processing
      3: 'fa-solid fa-truck',             // Shipped
      4: 'fa-solid fa-circle-check',      // Delivered
      5: 'fa-solid fa-circle-xmark'       // Cancelled
    };
    return icons[status] || 'fa-regular fa-clock';
  }

  getOrderStatusText(status: number): string {
    const textMap: any = {
      1: 'Pending',
      2: 'Processing',
      3: 'Shipped',
      4: 'Delivered',
      5: 'Cancelled'
    };
    return textMap[status] || 'Unknown';
  }

  // Payment Status Methods
  getPaymentBadgeClass(paymentStatus: number | string): string {
    if (typeof paymentStatus === 'string') {
      const status = paymentStatus.toLowerCase();
      if (status === 'succeeded' || status === 'success') return 'succeeded';
      if (status === 'failed' || status === 'failure') return 'failed';
      if (status === 'canceled' || status === 'cancelled') return 'canceled';
      if (status === 'pending') return 'pending';
    } else {
      const statusMap: any = {
        0: 'pending',
        1: 'succeeded',
        2: 'failed',
        3: 'canceled'
      };
      return statusMap[paymentStatus] || 'pending';
    }
    return 'pending';
  }

  getPaymentStatusIcon(paymentStatus: number): string {
    const icons: any = {
      0: 'fa-solid fa-hourglass-half',      // Pending
      1: 'fa-solid fa-circle-check',        // Succeeded
      2: 'fa-solid fa-circle-xmark',        // Failed
      3: 'fa-solid fa-ban'                  // Canceled
    };
    return icons[paymentStatus] || 'fa-solid fa-hourglass-half';
  }

  getPaymentStatusText(paymentStatus: number | string): string {
    if (typeof paymentStatus === 'string') {
      return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
    } else {
      const textMap: any = {
        0: 'Pending',
        1: 'Paid',
        2: 'Failed',
        3: 'Canceled'
      };
      return textMap[paymentStatus] || 'Pending';
    }
  }

  getPaymentMethodIcon(method: string): string {
    const methodLower = method?.toLowerCase() || '';
    if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('debit')) {
      return 'fa-solid fa-credit-card';
    } else if (methodLower.includes('paypal')) {
      return 'fa-brands fa-paypal';
    } else if (methodLower.includes('cash')) {
      return 'fa-solid fa-money-bill-1';
    } else if (methodLower.includes('upi')) {
      return 'fa-solid fa-mobile-screen-button';
    } else if (methodLower.includes('bank')) {
      return 'fa-solid fa-building-columns';
    }
    return 'fa-solid fa-wallet';
  }

  printOrder() {
    window.print();
  }
}