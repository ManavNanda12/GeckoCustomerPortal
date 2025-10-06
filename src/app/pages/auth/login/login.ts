import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { Common } from '../../../../services/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule,CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit,OnInit {

  loginForm!: FormGroup;
  returnUrl!: string;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly router:Router,
    private readonly api: ApiUrlHelper,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {
   this.initializeLoginForm();
  }

  ngAfterViewInit() {
    const video = document.querySelector('.bg-video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
          const playOnInteraction = () => {
            video.play();
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
      });
    }
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }   
  }

  initializeLoginForm(){
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submitLoginForm(){
    this.spinner.show();
    let requestedModel = {
      customerEmail:this.loginForm.value.email,
      password:this.loginForm.value.password
    };
    this.common.postData(this.api.Auth.Login,requestedModel).pipe().subscribe({
      next: (res) => {
        console.log(res);
        if(res.success){
          localStorage.setItem('JwtToken',res.data.jwtToken);
          localStorage.setItem('CustomerId',res.data.customerId);
          this.toastr.success("Login successful");
          this.router.navigate([this.returnUrl]);
        }
        else{
          this.toastr.error(res.message);
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to login");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

}
