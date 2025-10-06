import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Category } from './pages/category/category';
import { Products } from './pages/products/products';
import { Contact } from './pages/contact/contact';
import { Cart } from './pages/cart/cart';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/splash-screen/splash-screen').then(s => s.SplashScreen)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(s => s.Login)
    },
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'home', component: Home },
            { path: 'category', component: Category },
            { path: 'products', component: Products },
            { path: 'products/:categoryId', component: Products },
            { path:'contact',component:Contact},
            { path:'cart',component:Cart},
            { path:'profile',component:Profile , canActivate: [AuthGuard] }
        ]
    },
    { path: '**', redirectTo: 'home' }

];
