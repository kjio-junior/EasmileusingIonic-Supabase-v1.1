import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  role: 'admin' | 'dentist' | 'staff' | 'patient' | 'guest';
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(this.readUser());

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
    return res.user;
  }

  async register(payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, payload)
    );
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
    return res.user;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async refreshUser(): Promise<void> {
    if (!this.token()) return;
    try {
      const res = await firstValueFrom(
        this.http.get<{ user: User }>(`${environment.apiUrl}/auth/profile`)
      );
      this.user.set(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } catch {
      // Silent — if it fails, keep the cached value
    }
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  constructor(private http: HttpClient) {}
}