import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { NgxSpinnerService } from 'ngx-spinner';
import { Common } from '../../../../services/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEditAddressDialog } from './add-edit-address-dialog/add-edit-address-dialog';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './address.html',
  styleUrl: './address.css',
})
export class Address {
  //Common Properties
  addressList: any;

  constructor(
    private readonly api: ApiUrlHelper,
    private readonly spinner: NgxSpinnerService,
    private readonly common: Common,
    private readonly dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAddressList();
  }

  getAddressList() {
    this.spinner.show();
    let api = this.api.Address.GetAddressList.replace(
      '{customerId}',
      localStorage.getItem('CustomerId') || '0'
    );
    this.common
      .getData(api)
      .pipe()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.addressList = response.data;
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

  openAddressDialog(address: any) {
    let dialogRef = this.dialog.open(AddEditAddressDialog, {
      data: { address },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAddressList();
      }
    });
  }

  makeAddressDefault(address: any) {
    if (address.isDefault) return;

    Swal.fire({
      title: 'Set as Default Address?',
      text: 'Do you want to make this your default address?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Set Default',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        let api = this.api.Address.MakeAddressDefault.replace(
          '{addressId}',
          address.addressId
        );
        this.spinner.show();

        this.common.getData(api).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastr.success(response.message);
              this.getAddressList();
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
    });
  }

  deleteAddress(address: any) {
    if (address.isDefault) {
      this.toastr.error('You cannot delete default address');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        let api = this.api.Address.DeleteAddress.replace(
          '{addressId}',
          address.addressId
        );
        this.spinner.show();

        this.common.deleteData(api).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastr.success(response.message);
              this.getAddressList();
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
    });
  }
}
