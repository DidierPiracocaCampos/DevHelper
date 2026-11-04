import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { httpErrorInterceptor, SKIP_ERROR_TOAST } from './http-error.interceptor';
import { ToastService } from '../service/toast';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const toast = { error: vi.fn() };

  beforeEach(() => {
    toast.error.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toast },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows an error toast for failed requests', () => {
    const onError = vi.fn();
    http.get('/api/thing').subscribe({ error: onError });
    httpMock.expectOne('/api/thing').flush(null, { status: 500, statusText: 'Server Error' });
    expect(toast.error).toHaveBeenCalledWith('Error interno del servidor', undefined);
    expect(onError).toHaveBeenCalled();
  });

  it('does not toast when the request opts out with SKIP_ERROR_TOAST, but still errors', () => {
    const onError = vi.fn();
    http
      .get('/api/optional', { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })
      .subscribe({ error: onError });
    httpMock.expectOne('/api/optional').flush(null, { status: 500, statusText: 'Server Error' });
    expect(toast.error).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
