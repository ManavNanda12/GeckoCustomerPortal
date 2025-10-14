import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { Common } from '../../../../services/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  // Common Properties
  orderList:any;

  constructor(private readonly api:ApiUrlHelper,
    private readonly spinner:NgxSpinnerService,
    private readonly common:Common){}

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders(){
    this.spinner.show();
    let api = this.api.Order.GetOrderList.replace('{customerId}',localStorage.getItem('CustomerId') || '0');
    this.common.getData(api).pipe().subscribe({
      next:(response)=>{
        if(response.success){
          const result = Object.values(
            response.data.reduce((acc:any, curr:any) => {
              if (!acc[curr.id]) {
                acc[curr.id] = {   ...curr, itemCount: 0 };
              }
              acc[curr.id].itemCount += 1;
              return acc;
            }, {})
          );
          this.orderList = result;
          console.log(this.orderList);
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

  getStatusClass(status: any): string {
    let statusClass = '';
    if(status == 1){
      statusClass = 'pending';
    }else if(status == 2){
      statusClass = 'processing';
    }else if(status == 3){
      statusClass = 'shipped';
    }else if(status == 4){
      statusClass = 'delivered';
    }else if(status == 5){
      statusClass = 'cancelled';
    }
    return statusClass.toLowerCase().replace(' ', '-');
  }
  
  getStatusIcon(status: any): any {
    const icons: any = {
      1: 'fa-regular fa-clock', 
      2: 'fa-solid fa-gear',         
      3: 'fa-solid fa-truck',        
      4: 'fa-solid fa-circle-check',  
      5: 'fa-solid fa-circle-xmark'   
    };
    return icons[status] || 'fa-regular fa-circle';
  }
  
  
  navigateToOrderDetail(orderId: number): void {
    // Add your navigation logic here
    console.log('Navigate to order detail:', orderId);
  }
  
  navigateToProducts(): void {
    // Add your navigation logic here
    console.log('Navigate to products page');
  }
}
