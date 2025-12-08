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
    GetProducts: "product/get-product-list/:categoryId",
    GetProductImage: "product/get-product-images/{Id}", 
  }
  Cart = {
    AddToCart: "cart/add-to-cart",
    GetCartDetails:'cart/get-cart-details',
    UpdateCartQuantity:'cart/update-cart-item-quantity',
    UpdateCartCustomerId:'cart/update-cart-customer-id'
  }
  Order = {
   CheckOut:'order/checkout' ,
   GetOrderList:'order/get-order-list/{customerId}',
   GetOrderDetails:'order/get-order-detail/{orderId}'
  }
  Customer = {
    GetCustomerDetails:'get-customer-by-id/{customerId}'
  }
  Wishlist = {
    SaveWishlist:'wishlist/save-wishlist-item',
    RemoveWishlistItem:'wishlist/remove-wishlist-item',
    GetWishList:'wishlist/get-customer-wishlist'
  }
  ContactUs = {
    ContactUs:'contactus/save-contactus-request'
  }
  Coupon = {
    ApplyCoupon:'order/apply-coupon/{couponCode}'
  }
  SitePolicy = {
    GetPolicy:'site-policy/get-site-policies'
  }
  Address = {
    GetAddressList:'address/get-address-list/{customerId}',
    SaveAddress:'address/save-address'
  }
  General = {
    GetCountryList:'general/get-country-list',
    GetStateList:'general/get-state-list/{CountryId}',
    GetCityList:'general/get-city-list/{StateId}'
  }
}