import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-historial-atenciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './historial-atenciones.html',
  styleUrls: ['./historial-atenciones.scss']
})
export class HistorialAtencionesComponent implements OnInit {

  incidentes: any[] = [];
  incidentesFiltrados: any[] = [];
  cargando = true;
  filtroEstado = 'todos';
  busqueda = '';

  stats = {
    total: 0,
    atendidos: 0,
    cancelados: 0,
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/incidentes/mis-atenciones`).subscribe({
      next: (data) => {
        this.incidentes = data;
        this.calcularStats();
        this.filtrar();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  calcularStats() {
    this.stats.total = this.incidentes.length;
    this.stats.atendidos = this.incidentes.filter(i => i.estado === 'atendido').length;
    this.stats.cancelados = this.incidentes.filter(i => i.estado === 'cancelado').length;
  }

  filtrar() {
    let resultado = this.incidentes;

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(i => i.estado === this.filtroEstado);
    }

    if (this.busqueda.trim()) {
      const b = this.busqueda.toLowerCase();
      resultado = resultado.filter(i =>
        (i.tipo_problema || '').toLowerCase().includes(b) ||
        (i.descripcion_texto || '').toLowerCase().includes(b) ||
        (i.resumen_ia || '').toLowerCase().includes(b)
      );
    }

    this.incidentesFiltrados = resultado;
    this.cdr.detectChanges();
  }

  getPrioridadClass(prioridad: string): string {
    const clases: any = {
      alta: 'prioridad-alta',
      media: 'prioridad-media',
      baja: 'prioridad-baja'
    };
    return clases[prioridad] || 'prioridad-media';
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      atendido: 'estado-atendido',
      cancelado: 'estado-cancelado',
      en_proceso: 'estado-proceso',
      pendiente: 'estado-pendiente'
    };
    return clases[estado] || '';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getTipoIcon(tipo: string): string {
  const iconos: any = {
    bateria: '🔋',
    llanta: '🔧',
    choque: '💥',
    motor: '⚙️',
    otros: '🚗',
    incierto: '❓'
  };
  return iconos[tipo] || '🚗';
}
}