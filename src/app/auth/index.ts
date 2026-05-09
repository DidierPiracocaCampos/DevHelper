import { Route } from '@angular/router';

export const routesAuth: Route[] =
    [
        {
            path: 'login',
            loadComponent: () => import('./pages/login/login').then((c) => c),
            children: [
                { path: '', loadComponent: () => import('./pages/form-login/form-login').then((c) => c) },
                { path: 'register', loadComponent: () => import('./pages/form-register/form-register').then((c) => c) },
            ]
        },
        {
            path: '**', redirectTo: 'login'
        }
    ];