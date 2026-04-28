import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TallerService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/talleres/perfil`);
  }

  actualizarPerfil(datos: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/talleres/perfil`, datos);
  }
}