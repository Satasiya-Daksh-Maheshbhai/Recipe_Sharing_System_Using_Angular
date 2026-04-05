import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

type LoginTab = 'chef' | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  activeTab: LoginTab = 'chef';
  error = '';
  admin = {
    username: '',
    password: '',
  };
  chef = {
    email: '',
    password: '',
  };

  constructor(private auth: AuthService, private router: Router) {}

  setTab(tab: LoginTab): void {
    this.activeTab = tab;
    this.error = '';
  }

  loginAdmin(): void {
    this.error = '';
    if (!this.admin.username || !this.admin.password) {
      this.error = 'Please enter admin username and password.';
      return;
    }

    const ok = this.auth.loginAdmin(this.admin.username.trim(), this.admin.password.trim());
    if (!ok) {
      this.error = 'Invalid admin credentials.';
      return;
    }

    this.router.navigateByUrl('/admin');
  }

  loginChef(): void {
    this.error = '';
    if (!this.chef.email || !this.chef.password) {
      this.error = 'Please enter chef email and password.';
      return;
    }

    const result = this.auth.loginChef(this.chef.email.trim(), this.chef.password.trim());
    if (!result.ok) {
      this.error = result.error ?? 'Login failed.';
      return;
    }

    this.router.navigateByUrl('/chef');
  }
}
