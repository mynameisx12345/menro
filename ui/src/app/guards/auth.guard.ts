import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/menro/login']);
};

export const roleGuard = (...roles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getStoredUser();
  if (user && roles.includes(user.role)) return true;
  return router.createUrlTree(['/dashboard']);
};
