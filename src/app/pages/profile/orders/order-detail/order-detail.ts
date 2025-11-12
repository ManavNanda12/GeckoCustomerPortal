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

    // Common Properties
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

  getOrderDetails(){
    this.spinner.show();
    let api = this.api.Order.GetOrderDetails.replace('{orderId}',this.orderId);
    this.commonService.getData(api).pipe().subscribe({
      next:(response)=>{
        if(response.success){
          this.orderDetails = response.data;
          console.log(this.orderDetails);
        }
      },
      error:(error)=>{
        console.log(error);
      },
      complete:()=>{
        this.spinner.hide();
      }
    })
  }

  handleImageError(product: any) {
    product.imageUrl = gymImages[Math.floor(Math.random() * gymImages.length)];
  }

}
