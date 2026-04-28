import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IncidenteService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDisponibles(): Observable<any[]> {
   return this.http.get<any[]>(`${this.apiUrl}/incidentes/disponibles`);
  }

  getDetalle(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/incidentes/${id}`);
  }

  getHistorial(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/incidentes/${id}/historial`);
  }

  asignarTaller(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/incidentes/${id}/asignar`, {});
  }

  actualizarEstado(id: string, estado: string, nota?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/incidentes/${id}/estado`, { estado, nota });
  }
}