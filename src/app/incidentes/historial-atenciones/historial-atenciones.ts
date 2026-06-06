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

  stats = { total: 0, finalizados: 0, cancelados: 0, enProceso: 0 };

  estados = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'buscando_taller', label: 'Buscando taller' },
    { valor: 'taller_asignado', label: 'Taller asignado' },
    { valor: 'en_camino', label: 'En camino' },
    { valor: 'en_atencion', label: 'En atención' },
    { valor: 'finalizado', label: 'Finalizados' },
    { valor: 'cancelado', label: 'Cancelados' },
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargar(); }

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
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  calcularStats() {
    this.stats.total = this.incidentes.length;
    this.stats.finalizados = this.incidentes.filter(i => i.estado === 'finalizado').length;
    this.stats.cancelados = this.incidentes.filter(i => i.estado === 'cancelado').length;
    this.stats.enProceso = this.incidentes.filter(i =>
      ['taller_asignado', 'en_camino', 'en_atencion'].includes(i.estado)
    ).length;
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

  getEstadoClass(estado: string): string {
    const clases: any = {
      buscando_taller: 'e-buscando',
      taller_asignado: 'e-asignado',
      en_camino: 'e-camino',
      en_atencion: 'e-atencion',
      finalizado: 'e-finalizado',
      cancelado: 'e-cancelado',
      pendiente: 'e-pendiente'
    };
    return clases[estado] || '';
  }

  getEstadoLabel(estado: string): string {
    return estado.replaceAll('_', ' ');
  }

  getPrioridadClass(prioridad: string): string {
    const clases: any = { alta: 'prioridad-alta', media: 'prioridad-media', baja: 'prioridad-baja' };
    return clases[prioridad] || 'prioridad-media';
  }

  getTipoIcon(tipo: string): string {
    const iconos: any = {
      bateria: '🔋', llanta: '🔧', choque: '💥',
      motor: '⚙️', otros: '🚗', incierto: '❓'
    };
    return iconos[tipo] || '🚗';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}