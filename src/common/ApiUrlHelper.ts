import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ApiUrlHelper {
  Auth = {
    Login: "User/login"
  };
  Category = {
    GetCategories: "category/get-category-list"
  }
}