import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { AdminAuthService } from './admin-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Never attach a token to auth endpoints
  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/admin-login');

  if (isAuthEndpoint || !req.url.includes('/api/')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const adminAuth = inject(AdminAuthService);

  const isAdminCall = req.url.includes('/api/admin/');
  const token = isAdminCall ? adminAuth.token() : auth.token();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};