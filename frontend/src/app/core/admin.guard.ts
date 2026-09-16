import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (auth.token()) return true;
  router.navigateByUrl('/ea-admin/login', { replaceUrl: true });
  return false;
};

export const adminGuestGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (!auth.token()) return true;
  router.navigateByUrl('/ea-admin/dashboard', { replaceUrl: true });
  return false;
};