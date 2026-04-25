import { Routes } from '@angular/router';
import { authCanMatch } from './core/is-auth.can.mach';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/components/home/home').then((c) => c),
        canMatch: [authCanMatch()]
    },
    {
        path: '',
        loadChildren: () => import('./auth').then((c) => c.routesAuth),
        canMatch: [authCanMatch(true)]
    },
    {
        path: '**', redirectTo: ''
    }
];
