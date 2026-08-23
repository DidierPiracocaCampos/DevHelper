import { Routes } from '@angular/router';
import { authCanMatch } from './core/is-auth.can.mach';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./landing').then((m) => m.routesLanding),
  },
  {
    path: 'home',
    title: 'Dashboard | DevHelper',
    loadComponent: () => import('./home/pages/home/home').then((c) => c),
    canMatch: [authCanMatch()],
  },
  {
    path: 'proyect/:projectId/issues/:issueId',
    loadComponent: () =>
      import('./home/pages/issue-detail/issue-detail').then((c) => c.IssueDetail),
    canMatch: [authCanMatch()],
  },
  {
    path: '',
    loadChildren: () => import('./auth').then((c) => c.routesAuth),
    canMatch: [authCanMatch(true)],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
