import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { NgxSpinnerService } from 'ngx-spinner';
import { Common } from '../../../../services/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEditAddressDialog } from './add-edit-address-dialog/add-edit-address-dialog';

@Component({
  selector: 'app-address',
  imports: [CommonModule , MatDialogModule],
  templateUrl: './address.html',
  styleUrl: './address.css'
})
export class Address {

  //Common Properties
  addressList:any;

  constructor(private readonly api:ApiUrlHelper,
    private readonly spinner:NgxSpinnerService,
    private readonly common:Common,
    private readonly dialog:MatDialog){}

  ngOnInit(): void {
    this.getAddressList();
  }

  getAddressList(){
    this.spinner.show();
    let api = this.api.Address.GetAddressList.replace('{customerId}',localStorage.getItem('CustomerId') || '0');
    this.common.getData(api).pipe().subscribe({
      next:(response)=>{
        if(response.success){
          this.addressList = response.data;
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

  openAddressDialog(address:any){
    let dialogRef = this.dialog.open(AddEditAddressDialog,{
      data:{address},
      disableClose:true
    });
    dialogRef.afterClosed().subscribe((result)=>{
      if(result){
        this.getAddressList();
      }
    })
  }

}
