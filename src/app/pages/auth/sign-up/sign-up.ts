import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../../../../services/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { GoogleSigninButtonDirective, SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, GoogleSigninButtonDirective],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp implements OnInit, OnDestroy {

  // Common Properties
  signUpForm!:FormGroup;
  submitted:boolean = false;
  user: SocialUser | null = null;
  returnUrl!: string;
  private subscription: Subscription = new Subscription();
  
  // Constructor
  constructor(
    private readonly common:Common,
    private readonly router:Router,
    private readonly fb:FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly api: ApiUrlHelper,
    private readonly socialAuthService: SocialAuthService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
     this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
    this.subscription.add(this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.handleGoogleLogin(user);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
          this.user = null;
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
        this.spinner.hide();
      }
    })
  }

  login(){
    this.router.navigate(['/login']);
  }

   handleGoogleLogin(user: SocialUser) {
    let api = this.api.Auth.GoogleLogin;
    let requestedModel = {
      token: user.idToken
    }
    this.spinner.show();
    this.common.postData(api, requestedModel).pipe().subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('JwtToken', response.data.jwtToken);
          localStorage.setItem('CustomerId', response.data.customerId);
          this.toastr.success("Login successful");
          this.router.navigate([this.returnUrl]);
        }
        else {
          this.toastr.error(response.message);
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error("Google login failed");
      },
      complete: () => { this.spinner.hide(); }
    });
  }
}
