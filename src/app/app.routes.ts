import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ChefDashboardComponent } from './components/chef-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';

const adminGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAdmin()) return true;
  return inject(Router).parseUrl('/login');
};

const chefGuard = () => {
  const auth = inject(AuthService);
  if (auth.isChef()) return true;
  return inject(Router).parseUrl('/login');
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chef', component: ChefDashboardComponent, canActivate: [chefGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login' },
];
