import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Category } from './pages/category/category';
import { Products } from './pages/products/products';
import { Contact } from './pages/contact/contact';
import { Cart } from './pages/cart/cart';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './guard/auth.guard';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsAndConditions } from './pages/terms-and-conditions/terms-and-conditions';
import { Subscriptions } from './pages/subscriptions/subscriptions';
import { PaymentSuccess } from './pages/payment-success/payment-success';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/splash-screen/splash-screen').then((s) => s.SplashScreen),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login').then((s) => s.Login),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/auth/sign-up/sign-up').then((s) => s.SignUp),
  },
  {
    path: 'payment-success',
    loadComponent: () =>
      import('./pages/payment-success/payment-success').then(m => m.PaymentSuccess),
  },
  {
    path: 'payment-error',
    loadComponent: () =>
      import('./pages/payment-error/payment-error').then(m => m.PaymentError),
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'category', component: Category },
      { path: 'products', component: Products },
      { path: 'products/:categoryId', component: Products },
      { path: 'contact', component: Contact },
      { path: 'cart', component: Cart },
      { path: 'profile', component: Profile, canActivate: [AuthGuard] },
      { path: 'profile/orders', component: Profile, canActivate: [AuthGuard] },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'terms-and-conditions', component: TermsAndConditions },
      { path: 'subscriptions', component: Subscriptions },
      { path: 'success', component: PaymentSuccess },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
