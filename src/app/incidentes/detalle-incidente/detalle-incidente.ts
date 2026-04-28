import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { IncidenteService } from '../../services/incidente';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detalle-incidente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './detalle-incidente.html',
  styleUrls: ['./detalle-incidente.scss']
})
export class DetalleIncidenteComponent implements OnInit {

  incidente: any = null;
  historial: any[] = [];
  cargando = true;
  estadoSeleccionado = '';
  nota = '';
  actualizando = false;
  analizando = false;
  mensaje = '';
  mensajeIA = '';

  estados = ['pendiente', 'en_proceso', 'atendido', 'cancelado'];

  constructor(
    private route: ActivatedRoute,
    private incidenteService: IncidenteService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarIncidente(id);
  }

  cargarIncidente(id: string) {
    this.cargando = true;
    this.incidenteService.getDetalle(id).subscribe({
      next: (inc) => {
        this.incidente = inc;
        this.estadoSeleccionado = inc.estado;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando incidente:', err);
        this.cargando = false;
        this.mensaje = `Error ${err.status}: ${err.error?.detail || 'No se pudo cargar'}`;
        this.cdr.detectChanges();
      }
    });

    this.incidenteService.getHistorial(id).subscribe({
      next: (h) => {
        this.historial = h;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando historial:', err)
    });
  }

  actualizarEstado() {
    this.actualizando = true;
    this.incidenteService.actualizarEstado(
      this.incidente.id,
      this.estadoSeleccionado,
      this.nota
    ).subscribe({
      next: () => {
        this.mensaje = 'Estado actualizado correctamente';
        this.cargarIncidente(this.incidente.id);
        this.actualizando = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al actualizar el estado';
        this.actualizando = false;
        this.cdr.detectChanges();
      }
    });
  }

  finalizarServicio() {
    this.actualizando = true;
    this.incidenteService.actualizarEstado(
      this.incidente.id,
      'atendido',
      'Servicio finalizado por el taller'
    ).subscribe({
      next: () => {
        this.mensaje = 'Servicio marcado como atendido';
        this.cargarIncidente(this.incidente.id);
        this.actualizando = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.mensaje = 'Error al finalizar el servicio';
        this.actualizando = false;
        this.cdr.detectChanges();
      }
    });
  }

  analizarConIA() {
    this.analizando = true;
    this.mensajeIA = '';
    this.http.post(
      `${environment.apiUrl}/ia/analizar/${this.incidente.id}`, {}
    ).subscribe({
      next: (res: any) => {
        this.mensajeIA = `Análisis completado. Tipo: ${res.tipo_problema} · Prioridad: ${res.prioridad}`;
        this.cargarIncidente(this.incidente.id);
        this.analizando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeIA = 'Error al analizar con IA';
        this.analizando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPrioridadClass(prioridad: string): string {
    const clases: any = {
      alta: 'prioridad-alta',
      media: 'prioridad-media',
      baja: 'prioridad-baja'
    };
    return clases[prioridad] || 'prioridad-media';
  }

  actualizarUbicacionTecnico() {
    if (!this.incidente.tecnico_id) return;
    navigator.geolocation.getCurrentPosition(pos => {
      this.http.patch(
        `${environment.apiUrl}/tecnicos/${this.incidente.tecnico_id}/ubicacion`,
        {
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude
        }
      ).subscribe({
        next: () => console.log('Ubicación actualizada'),
        error: (e) => console.error(e)
      });
    });
  }
}