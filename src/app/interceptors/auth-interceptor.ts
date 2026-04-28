import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  console.log('[Interceptor] Token:', token ? 'existe' : 'no existe');
  console.log('[Interceptor] URL:', req.url);

  if (token) {
    const reqClone = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqClone);
  }
  return next(req);
};