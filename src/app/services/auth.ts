import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  registroTaller(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro-taller`, datos);
  }

  loginTaller(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login-taller`, datos).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('tipo', res.tipo_usuario);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}