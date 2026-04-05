import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Chef, Session } from '../models';

const SESSION_KEY = 'rs_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly adminUser = {
    username: 'admin',
    password: 'admin123',
  };

  readonly session = signal<Session | null>(null);

  constructor(private data: DataService, private router: Router) {
    this.loadSession();
  }

  private loadSession(): void {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Session;
      this.session.set(parsed);
    } catch {
      this.session.set(null);
    }
  }

  private saveSession(): void {
    const current = this.session();
    if (!current) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(current));
  }

  isAdmin(): boolean {
    return this.session()?.role === 'admin';
  }

  isChef(): boolean {
    return this.session()?.role === 'chef';
  }

  currentChefId(): string | null {
    return this.session()?.chefId ?? null;
  }

  currentChefName(): string | null {
    return this.session()?.chefName ?? null;
  }

  loginAdmin(username: string, password: string): boolean {
    if (username !== this.adminUser.username || password !== this.adminUser.password) {
      return false;
    }

    this.session.set({ role: 'admin' });
    this.saveSession();
    return true;
  }

  loginChef(email: string, password: string): { ok: boolean; error?: string; chef?: Chef } {
    const chef = this.data.getChefByEmail(email);
    if (!chef || chef.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    this.session.set({ role: 'chef', chefId: chef.id, chefName: chef.name });
    this.saveSession();

    return { ok: true, chef };
  }

  registerChef(name: string, email: string, password: string): { ok: boolean; error?: string; chef?: Chef } {
    const result = this.data.addChef(name, email, password);
    if (!result.ok || !result.chef) return result;

    this.session.set({ role: 'chef', chefId: result.chef.id, chefName: result.chef.name });
    this.saveSession();

    return result;
  }

  logout(): void {
    this.session.set(null);
    this.saveSession();
    this.router.navigateByUrl('/login');
  }
}
