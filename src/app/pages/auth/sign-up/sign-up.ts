import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../../../../services/common';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';

@Component({
  selector: 'app-sign-up',
  imports: [RouterModule,CommonModule,FormsModule,ReactiveFormsModule,MatInputModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {

  // Common Properties
  signUpForm!:FormGroup;
  submitted:boolean = false;
  
  // Constructor
  constructor(
    private readonly common:Common,
    private readonly router:Router,
    private readonly fb:FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly api: ApiUrlHelper
  ) {
    this.initializeForm();
  }

  initializeForm(){
    this.signUpForm = this.fb.group({
      FirstName:['',[Validators.required]],
      LastName:['',[Validators.required]],
      Email:['',[Validators.required, Validators.email]],
      MobileNumber:['',[Validators.required,Validators.pattern('^[0-9]{10}$')]]
    });
  }

  submitSignUpForm(){
    this.submitted = true;
    let api = this.api.Customer.SaveCustomer;
    if(this.signUpForm.invalid){
      return;
    }
    this.spinner.show();
    let requestedModel = {
      CustomerId: 0,
      FirstName: this.signUpForm.value.FirstName,
      LastName: this.signUpForm.value.LastName,
      Email: this.signUpForm.value.Email,
      ContactNumber: this.signUpForm.value.MobileNumber,
      CountryCode:'+91'
    }
    this.common.postData(api,requestedModel).pipe().subscribe({
      next: (response) => {
        if(response.success){
          this.toastr.success(response.message);
          this.router.navigate(['/login']);
        }
        else{
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete:()=>{
        console.log('Request completed');
        this.spinner.hide();
      }
    })
  }

  login(){
    this.router.navigate(['/login']);
  }
}
