import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TecnicoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTecnicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tecnicos/`);
  }

  crearTecnico(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tecnicos/`, datos);
  }

  actualizarEstado(id: string, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tecnicos/${id}/estado?estado=${estado}`, {});
  }
}