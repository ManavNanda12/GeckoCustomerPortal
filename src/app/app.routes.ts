import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Category } from './pages/category/category';
import { Products } from './pages/products/products';
import { Contact } from './pages/contact/contact';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/splash-screen/splash-screen').then(s => s.SplashScreen)
    },
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'home', component: Home },
            { path: 'category', component: Category },
            { path: 'products', component: Products },
            { path: 'products/:categoryId', component: Products },
            { path:'contact',component:Contact}
        ]
    },
    { path: '**', redirectTo: 'home' }

];
