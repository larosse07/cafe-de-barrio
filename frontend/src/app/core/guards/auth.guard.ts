import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getAccessToken()) {
    return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
  }

  if (authService.isAdmin()) {
    return true;
  }

  return authService.fetchCurrentUser().pipe(
    map(user =>
      user.rol === 'ADMIN'
        ? true
        : router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } })
    ),
    catchError(() => {
      authService.clearSession();
      return of(router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } }));
    })
  );
};
