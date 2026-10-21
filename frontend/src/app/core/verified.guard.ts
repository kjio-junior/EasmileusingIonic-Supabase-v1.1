import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (u && u.role === 'patient' && u.email_verified === false) {
    router.navigateByUrl('/verify-email', { replaceUrl: true });
    return false;
  }
  return true;
};