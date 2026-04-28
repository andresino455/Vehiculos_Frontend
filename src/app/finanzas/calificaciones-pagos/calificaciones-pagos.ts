import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calificaciones-pagos',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './calificaciones-pagos.html',
  styleUrls: ['./calificaciones-pagos.scss']
})
export class CalificacionesPagosComponent implements OnInit {

  tabActiva: 'calificaciones' | 'pagos' = 'calificaciones';
  cargando = true;

  calificaciones: any[] = [];
  resumenCalif: any = null;

  pagos: any[] = [];
  resumenPagos: any = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCalificaciones();
    this.cargarPagos();
  }

  cargarCalificaciones() {
    this.http.get<any>(`${environment.apiUrl}/calificaciones/mis-calificaciones`).subscribe({
      next: (data) => {
        this.calificaciones = data.calificaciones;
        this.resumenCalif = data.resumen;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  cargarPagos() {
    this.http.get<any>(`${environment.apiUrl}/pagos/mis-cobros`).subscribe({
      next: (data) => {
        this.pagos = data.pagos;
        this.resumenPagos = data.resumen;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  getEstrellas(puntuacion: number): string {
    return '★'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion);
  }

  getColorEstrella(puntuacion: number): string {
    if (puntuacion >= 4) return '#BA7517';
    if (puntuacion >= 3) return '#B7791F';
    return '#C53030';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  getPorcentaje(cantidad: number): number {
    if (!this.resumenCalif?.total) return 0;
    return Math.round((cantidad / this.resumenCalif.total) * 100);
  }
}