import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { VERSION, BUILD } from '../../../version';
import { FEATURES } from '../../features';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <span class="logo-icon">♻️</span>
          <h1>MENRO EcoTrack</h1>
          <p>Waste Management System</p>
        </div>
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <div class="demo-accounts">
          <p>Demo Accounts:</p>
          <button class="demo-btn" (click)="fillDemo('admin@menro.gov','admin123')">Admin</button>
          <button class="demo-btn" (click)="fillDemo('resident@menro.gov','resident123')">Resident</button>
          <button class="demo-btn" (click)="fillDemo('collector@menro.gov','collector123')">Collector</button>
        </div>
        <div class="register-link" *ngIf="features.registration">
          New resident? <a routerLink="/menro/register">Register here</a>
        </div>
        <div class="version-tag">v{{ version }} build {{ build }}</div>
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a472a,#2d6a4f); }
    .login-card { background:#fff; border-radius:12px; padding:2rem; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
    .logo { text-align:center; margin-bottom:2rem; }
    .logo-icon { font-size:3rem; }
    .logo h1 { color:#1a472a; margin:0.5rem 0 0; font-size:1.5rem; }
    .logo p { color:#666; margin:0.25rem 0 0; font-size:0.9rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:0.4rem; font-weight:600; color:#333; font-size:0.9rem; }
    input { width:100%; padding:0.75rem; border:1px solid #ddd; border-radius:8px; font-size:1rem; box-sizing:border-box; }
    input:focus { outline:none; border-color:#2d6a4f; }
    .password-wrapper { position:relative; }
    .password-wrapper input { padding-right:2.8rem; }
    .toggle-pw { position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:1.1rem; padding:0; width:auto; margin:0; }
    button[type=submit] { width:100%; padding:0.85rem; background:#2d6a4f; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:0.5rem; }
    button[type=submit]:hover { background:#1a472a; }
    button[type=submit]:disabled { opacity:0.6; cursor:not-allowed; }
    .error { color:#e53e3e; font-size:0.85rem; margin-bottom:0.5rem; }
    .demo-accounts { margin-top:1.5rem; text-align:center; border-top:1px solid #eee; padding-top:1rem; }
    .demo-accounts p { color:#666; font-size:0.85rem; margin-bottom:0.5rem; }
    .demo-btn { margin:0 0.25rem; padding:0.4rem 0.8rem; background:#e8f5e9; color:#2d6a4f; border:1px solid #2d6a4f; border-radius:6px; cursor:pointer; font-size:0.8rem; }
    .demo-btn:hover { background:#2d6a4f; color:#fff; }
    .register-link { text-align:center; margin-top:1rem; font-size:0.9rem; color:#666; }
    .register-link a { color:#2d6a4f; font-weight:600; text-decoration:none; }
    .register-link a:hover { text-decoration:underline; }
    .version-tag { text-align:center; margin-top:1rem; font-size:0.75rem; color:#aaa; }
  `]
})
export class LoginComponent {
  email = ''; password = ''; error = ''; loading = false; showPassword = false;
  version = VERSION; build = BUILD;
  readonly features = FEATURES;

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo(email: string, password: string) { this.email = email; this.password = password; }

  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        const role = res.user.role;
        if (role === 'admin') this.router.navigate(['/menro/admin']);
        else if (role === 'collector') this.router.navigate(['/menro/collector']);
        else this.router.navigate(['/menro/resident']);
      },
      error: () => { this.error = 'Invalid email or password'; this.loading = false; }
    });
  }
}
