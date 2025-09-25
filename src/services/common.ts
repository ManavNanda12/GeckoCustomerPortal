import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, map, Observable, throwError } from 'rxjs';

export interface responseModel{
  success:boolean,
  message:string,
  data:any
}

@Injectable({
  providedIn: 'root'
})
export class Common {

  baseUrl: string = "https://localhost:44300/api/customer/";

  constructor(private readonly http: HttpClient , private spinner:NgxSpinnerService){ }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("jwtToken");
    let headers = new HttpHeaders({ 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    });

    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  // ✅ Common Methods with JWT Headers
  getData(url: string): Observable<responseModel> {
    return this.http.get(this.baseUrl + url, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data
        };
      }),
      catchError((error: any) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
  }

  postData(url: string, data: any): Observable<responseModel> {
    return this.http.post(this.baseUrl + url, data, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data
        };
      }),
      catchError((error: any) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
  }

  putData(url: string, data: any): Observable<responseModel> {
    return this.http.put(this.baseUrl + url, data, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data
        };
      }),
      catchError((error: any) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
  }

  deleteData(url: string): Observable<responseModel> {
    return this.http.delete(this.baseUrl + url, { headers: this.getHeaders() }).pipe(
      map((response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data
        };
      }),
      catchError((error: any) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
  }

  postFormData(url: string, formData: FormData): Observable<responseModel> {
    const token = localStorage.getItem("jwtToken");
    
    let headers = new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    });
    // Don't set Content-Type for FormData - let browser handle it

    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return this.http.post(this.baseUrl + url, formData, { headers }).pipe(
      map((response: any) => {
        return {
          success: response.success,
          message: response.message,
          data: response.data
        };
      }),
      catchError((error: any) => {
        this.spinner.hide();
        return throwError(() => error);
      })
    );
}
}
