import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ApiUrlHelper } from '../../../../../common/ApiUrlHelper';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Common } from '../../../../../services/common';

@Component({
  selector: 'app-add-edit-address-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './add-edit-address-dialog.html',
  styleUrl: './add-edit-address-dialog.css'
})
export class AddEditAddressDialog implements OnInit {

  // Common Properties
  address: any;
  addressForm!: FormGroup;
  countries:any;
  states:any;
  cities:any;

  constructor(
    private readonly fb: FormBuilder , private readonly api: ApiUrlHelper , 
    private readonly spinner: NgxSpinnerService, private readonly toastr:ToastrService,
    private readonly service: Common , private readonly dialogRef: MatDialogRef<AddEditAddressDialog>
  ) {
    this.address = inject(MAT_DIALOG_DATA)?.address;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.getCountries();
  }

  initializeForm() {
    this.addressForm = this.fb.group({
      addressName: [this.address?.addressName || '', Validators.required],
      fullAddress: [this.address?.fullAddress || '', Validators.required],
      countryName: [this.address?.countryId || '', Validators.required],
      stateName: [this.address?.stateId || '', Validators.required],
      cityName: [this.address?.cityId || '', Validators.required]
    });
    if(this.address?.addressId > 0){
      this.getStates(false);
      this.getCities(false);
    }
  }

  submitForm() {
    if (this.addressForm.valid) {
      let api = this.api.Address.SaveAddress;
      this.spinner.show();
      let requestedModel ={
        addressId:this.address?.addressId | 0,
        addressName:this.addressForm.value.addressName,
        fullAddress:this.addressForm.value.fullAddress,
        countryId:this.addressForm.value.countryName,
        stateId:this.addressForm.value.stateName,
        cityId:this.addressForm.value.cityName,
        customerId: Number.parseInt(localStorage.getItem('CustomerId') as any)
      }
      this.service.postData(api,requestedModel).pipe().subscribe({
        next:(response) =>{
          if(response.success){
            this.toastr.success(response.message);
            this.dialogRef.close(true);
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
  }

  getCountries(){
    let api = this.api.General.GetCountryList;
    this.spinner.show();
    this.service.getData(api).pipe().subscribe({
      next:(response)=>{
        this.countries = response.data;
      },
      error:(error)=>{
        console.log(error);
      },
      complete:()=>{
        this.spinner.hide();
      } 
    })
  }

  getStates(isChangedByCountry:boolean){
    this.spinner.show();
    let countryId = this.addressForm.value.countryName;
    if(isChangedByCountry){
      this.addressForm.get('stateName')?.setValue('');
      this.addressForm.get('cityName')?.setValue('');
    }
    let api = this.api.General.GetStateList.replace('{CountryId}',countryId);
    this.service.getData(api).pipe().subscribe({
      next:(response)=>{
        this.states = response.data;
      },
      error:(error)=>{
        console.log(error);
      },
      complete:()=>{
        this.spinner.hide();
      }
    })
  }

  getCities(isChangedByState:boolean){
    this.spinner.show();
    let stateId = this.addressForm.value.stateName;
    if(isChangedByState){
      this.addressForm.get('cityName')?.setValue('');
    }
    let api = this.api.General.GetCityList.replace('{StateId}',stateId);
    this.service.getData(api).pipe().subscribe({
      next:(response)=>{
        this.cities = response.data;
      },
      error:(error)=>{
        console.log(error);
      },
      complete:()=>{
        this.spinner.hide();
      }
    })
  }
}
