import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiUrlHelper } from '../../../common/ApiUrlHelper';
import { NgxSpinnerService } from 'ngx-spinner';
import { Common } from '../../../services/common';
import { Orders } from './orders/orders';
import { ActivatedRoute } from '@angular/router';
import { Wishlist } from './wishlist/wishlist';

@Component({
  selector: 'app-profile',
  imports: [ MatTabsModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Orders  ,
    Wishlist
    ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  activeTab = 'home';
  currentAnimation = '';
  profileForm!:FormGroup;
  isEditMode = false;
  private animations = [
    'fadeIn',
    'slideInRight',
    'bounceIn',
    'zoomIn',
    'flipIn',
    'slideInUp',
    'rotateIn',
    'expandIn'
  ];
  customerId!:number;
  customerDetails!:any;

  constructor(private readonly fb:FormBuilder , private readonly api:ApiUrlHelper,
              private readonly spinner:NgxSpinnerService , private readonly common:Common,
              private readonly activatedRoute:ActivatedRoute  
            ){
    this.activatedRoute.url.subscribe((params) => {
      this.activeTab = params[1]?.path || 'home';
    });
  }

  ngOnInit(): void {
    this.initializeProfileForm();
    this.customerId = Number(localStorage.getItem('CustomerId')) || 0;
    this.getCustomerDetails();
  }

  changeTab(tab: string) {
    if (this.activeTab !== tab) {
      const randomIndex = Math.floor(Math.random() * this.animations.length);
      this.currentAnimation = this.animations[randomIndex];
      this.activeTab = tab;
    }
  }

  initializeProfileForm(){
    this.profileForm = this.fb.group({
      firstName: [{ value: 'John', disabled: true }, Validators.required],
      lastName: [{ value: 'Doe', disabled: true }, Validators.required],
      email: [{ value: 'john.doe@example.com', disabled: true }, [Validators.required, Validators.email]],
      contactNumber: [{ value: '+1234567890', disabled: true }, Validators.required]
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      this.profileForm.get('firstName')?.enable();
      this.profileForm.get('lastName')?.enable();
      this.profileForm.get('contactNumber')?.enable();
    } else {
      this.profileForm.get('firstName')?.disable();
      this.profileForm.get('lastName')?.disable();
      this.profileForm.get('contactNumber')?.disable();
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.getRawValue());
      this.toggleEdit();
    }
  }

  getCustomerDetails(){
    this.spinner.show();
    let api = this.api.Customer.GetCustomerDetails.replace('{customerId}',this.customerId.toString());
    this.common.getData(api).pipe().subscribe({
      next:(response)=>{
        if(response.success){
          this.customerDetails = response.data;
          this.profileForm.patchValue({
            firstName: this.customerDetails.firstName,
            lastName: this.customerDetails.lastName,
            email: this.customerDetails.email,
            contactNumber: this.customerDetails.contactNumber
          });
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
