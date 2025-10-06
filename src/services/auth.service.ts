import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Common } from './common';
import { ApiUrlHelper } from '../common/ApiUrlHelper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'JwtToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  // Store the URL so we can redirect after logging in
  public redirectUrl: string | null = null;

  constructor(private commonService: Common, private router: Router, private toastr: ToastrService, private spinner: NgxSpinnerService) {}

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  // Get authentication status as observable
  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Login method
  login(credentials: { UserEmail: string, password: string }, api: ApiUrlHelper): Observable<boolean> {
    this.commonService.postData(api.Auth.Login, credentials).subscribe({
      next:(response:any) =>{
        if(response?.success){
          this.setToken(response?.data?.jwtToken);
          this.isAuthenticatedSubject.next(true);
        }
        else{
          this.toastr.error(response?.message);
        }
      },
      error:(error:any) =>{
        this.toastr.error(error?.error?.message);
      },
      complete:() =>{
        this.spinner.hide();
      }
    })
    return this.isAuthenticatedSubject.asObservable();
  }

  // Logout method
  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if token exists
  private hasToken(): boolean {
    return !!this.getToken();
  }

  // Set token in local storage
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Remove token from local storage
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
