import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FriendlyHttpError, errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should surface backend error message for 409 Conflict', () => {
    let caught: FriendlyHttpError | undefined;
    http.post('/api/pedidos', {}).subscribe({
      error: (err: FriendlyHttpError) => (caught = err)
    });

    const req = httpMock.expectOne('/api/pedidos');
    req.flush(
      { status: 409, error: 'Conflict', message: 'Stock insuficiente para Cajamarca.' },
      { status: 409, statusText: 'Conflict' }
    );

    expect(caught?.status).toBe(409);
    expect(caught?.message).toBe('Stock insuficiente para Cajamarca.');
  });

  it('should show friendly connection error when backend is unreachable (status 0)', () => {
    let caught: FriendlyHttpError | undefined;
    http.get('/api/productos').subscribe({
      error: (err: FriendlyHttpError) => (caught = err)
    });

    const req = httpMock.expectOne('/api/productos');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(caught?.status).toBe(0);
    expect(caught?.message).toContain('No se pudo conectar');
  });
});
