import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { Common } from '../../../../services/common';
import { CommonModule } from '@angular/common';
import { OrderDetail } from './order-detail/order-detail';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  orderList: any;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly spinner: NgxSpinnerService,
    private readonly common: Common,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
  this.spinner.show();
  let api = this.api.Order.GetOrderList.replace('{customerId}', localStorage.getItem('CustomerId') || '0');
  this.common.getData(api).pipe().subscribe({
    next: (response) => {
      if (response.success) {
        const seen = new Set();
        const result: any[] = [];
        for (const item of response.data) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            result.push({ ...item, itemCount: 1 });
          } else {
            const existing = result.find(r => r.id === item.id);
            if (existing) existing.itemCount += 1;
          }
        }
        this.orderList = result; // order is exactly as API sent it
      }
    },
    error: (error) => {
      console.log(error);
    },
    complete: () => {
      this.spinner.hide();
    }
  });
}

  // Order Status Methods
  getStatusClass(status: number): string {
    const statusMap: any = {
      1: 'pending',
      2: 'processing',
      3: 'shipped',
      4: 'delivered',
      5: 'cancelled'
    };
    return statusMap[status] || 'pending';
  }
  
  getStatusIcon(status: number): string {
    const icons: any = {
      1: 'fa-regular fa-clock',           // Pending
      2: 'fa-solid fa-gears',             // Processing
      3: 'fa-solid fa-truck',             // Shipped
      4: 'fa-solid fa-circle-check',      // Delivered
      5: 'fa-solid fa-circle-xmark'       // Cancelled
    };
    return icons[status] || 'fa-regular fa-clock';
  }

  getStatusText(status: number): string {
    const textMap: any = {
      1: 'Pending',
      2: 'Processing',
      3: 'Shipped',
      4: 'Delivered',
      5: 'Cancelled'
    };
    return textMap[status] || 'Pending';
  }

  // Payment Status Methods
  getPaymentStatusClass(paymentStatus: number): string {
    const statusMap: any = {
      0: 'payment-pending',
      1: 'payment-succeeded',
      2: 'payment-failed',
      3: 'payment-canceled'
    };
    return statusMap[paymentStatus] || 'payment-pending';
  }

  getPaymentBadgeClass(paymentStatus: number): string {
    const statusMap: any = {
      0: 'pending',
      1: 'succeeded',
      2: 'failed',
      3: 'canceled'
    };
    return statusMap[paymentStatus] || 'pending';
  }

  getPaymentStatusIcon(paymentStatus: number): string {
    const icons: any = {
      0: 'fa-solid fa-hourglass-half',      // Pending
      1: 'fa-solid fa-circle-check',        // Succeeded/Paid
      2: 'fa-solid fa-circle-xmark',        // Failed
      3: 'fa-solid fa-ban'                  // Canceled
    };
    return icons[paymentStatus] || 'fa-solid fa-hourglass-half';
  }

  getPaymentStatusText(paymentStatus: number): string {
    const textMap: any = {
      0: 'Payment Pending',
      1: 'Paid',
      2: 'Payment Failed',
      3: 'Cancelled'
    };
    return textMap[paymentStatus] || 'Pending';
  }
  
  navigateToOrderDetail(orderId: number): void {
    this.dialog.open(OrderDetail, {
      data: { orderId: orderId },
      maxWidth: '100vw',
      width: 'auto',
      disableClose: true
    });
  }
  
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}