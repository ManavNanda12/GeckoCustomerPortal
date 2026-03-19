import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiUrlHelper } from '../../../../common/ApiUrlHelper';
import { Common } from '../../../../services/common';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';
import { SocialAuthService, SocialUser, GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleSigninButtonDirective],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit, OnInit, OnDestroy {

  loginForm!: FormGroup;
  returnUrl!: string;
  user: SocialUser | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly common: Common,
    private readonly spinner: NgxSpinnerService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly api: ApiUrlHelper,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService
  ) {
    this.initializeLoginForm();
  }

  ngAfterViewInit() {
    const video = document.querySelector('.bg-video') as HTMLVideoElement;
    if (video) {
      video.muted = true;

      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => {
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
     this.subscription.add(this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.handleGoogleLogin(user);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initializeLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submitLoginForm() {
    this.spinner.show();
    let requestedModel = {
      customerEmail: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    this.common.postData(this.api.Auth.Login, requestedModel).pipe().subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('JwtToken', res.data.jwtToken);
          localStorage.setItem('CustomerId', res.data.customerId);
          this.toastr.success("Login successful");
          this.router.navigate([this.returnUrl]);
        }
        else {
          this.toastr.error(res.message);
        }
      },
      error: (err: any) => {
        this.toastr.error("Failed to login");
      },
      complete: () => { this.spinner.hide(); }
    })
  }

  signUp() {
    this.router.navigate(['/sign-up']);
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
          this.user = null;
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
