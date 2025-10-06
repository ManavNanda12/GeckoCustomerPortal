import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ApiUrlHelper {
  Auth = {
    Login: "login"
  };
  Category = {
    GetCategories: "category/get-category-list"
  };
  Product = {
    GetProducts: "product/get-product-list/:categoryId"
  }
  Cart = {
    AddToCart: "cart/add-to-cart",
    GetCartDetails:'cart/get-cart-details',
    UpdateCartQuantity:'cart/update-cart-item-quantity',
    UpdateCartCustomerId:'cart/update-cart-customer-id'
  }
  Order = {
   CheckOut:'order/checkout' 
  }
  Customer = {
    GetCustomerDetails:'customer/get-customer-by-id/{customerId}'
  }
}