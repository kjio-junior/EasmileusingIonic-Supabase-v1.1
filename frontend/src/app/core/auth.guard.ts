import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.token()) return true;

  // Remember where the user was going
  sessionStorage.setItem('returnUrl', state.url);

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};