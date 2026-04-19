import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUser$ = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser$.next(res.user);
      })
    );
  }

  register(data: { name: string; email: string; password: string; role: string; [key: string]: any }) {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  getUsers() {
    return this.http.get<User[]>(`${this.apiUrl}/auth/users`);
  }

  updateUser(id: string, data: any) {
    return this.http.put<User>(`${this.apiUrl}/auth/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/auth/users/${id}`);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser$.next(null);
  }

  getToken() { return localStorage.getItem('token'); }
  getStoredUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  isLoggedIn() { return !!this.getToken(); }
}
