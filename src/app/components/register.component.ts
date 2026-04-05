import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  error = '';
  form = {
    name: '',
    email: '',
    password: '',
    confirm: '',
  };

  constructor(private auth: AuthService, private router: Router) {}

  register(): void {
    this.error = '';
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    if (this.form.password !== this.form.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }

    const result = this.auth.registerChef(
      this.form.name.trim(),
      this.form.email.trim(),
      this.form.password.trim(),
    );

    if (!result.ok) {
      this.error = result.error ?? 'Registration failed.';
      return;
    }

    this.router.navigateByUrl('/chef');
  }
}
