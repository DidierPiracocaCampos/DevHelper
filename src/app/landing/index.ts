import { Routes } from '@angular/router';

export const routesLanding: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((c) => c.Landing),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((c) => c.About),
  },
  {
    path: 'legal/terms',
    loadComponent: () => import('./pages/legal-terms/legal-terms').then((c) => c.LegalTerms),
  },
];
