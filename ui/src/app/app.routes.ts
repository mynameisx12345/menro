import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { FEATURES } from './features';

export const routes: Routes = [
  { path: '', redirectTo: 'menro/login', pathMatch: 'full' },
  { path: 'menro', redirectTo: 'menro/login', pathMatch: 'full' },
  { path: 'menro/login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'menro/register', canActivate: [() => FEATURES.registration || inject(Router).createUrlTree(['/menro/login'])], loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'menro/admin', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [authGuard] },
  { path: 'menro/resident', loadComponent: () => import('./components/resident-portal/resident-portal.component').then(m => m.ResidentPortalComponent), canActivate: [authGuard] },
  { path: 'menro/collector', loadComponent: () => import('./components/collector-app/collector-app.component').then(m => m.CollectorAppComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'menro/login' }
];
