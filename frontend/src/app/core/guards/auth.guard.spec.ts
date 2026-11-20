import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let router: Router;
  let authMock: {
    getAccessToken: ReturnType<typeof vi.fn>;
    isAdmin: ReturnType<typeof vi.fn>;
    fetchCurrentUser: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authMock = {
      getAccessToken: vi.fn(),
      isAdmin: vi.fn(),
      fetchCurrentUser: vi.fn(),
      clearSession: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authMock
        }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('should redirect to /admin/login when there is no token', () => {
    authMock.getAccessToken.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin/dashboard' } as RouterStateSnapshot)
    );

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toContain('/admin/login');
  });

  it('should allow access when user is authenticated ADMIN', () => {
    authMock.getAccessToken.mockReturnValue('valid-jwt');
    authMock.isAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin/dashboard' } as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });
});
