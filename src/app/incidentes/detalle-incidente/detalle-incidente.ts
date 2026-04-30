import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { IncidenteService } from '../../services/incidente';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

@Component({
  selector: 'app-detalle-incidente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './detalle-incidente.html',
  styleUrls: ['./detalle-incidente.scss']
})
export class DetalleIncidenteComponent implements OnInit, AfterViewInit {

  incidente: any = null;
  historial: any[] = [];
  cargando = true;
  estadoSeleccionado = '';
  nota = '';
  actualizando = false;
  analizando = false;
  mensaje = '';
  mensajeIA = '';
  actualizandoUbicacion = false;
  mensajeUbicacion = '';
  rastreando = false;
  private _watchId: number | null = null;
  private mapaDetalle!: L.Map;


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
        setTimeout(() => this.iniciarMapaDetalle(), 200);
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
  if (!this.incidente?.tecnico_id) return;
  this.actualizandoUbicacion = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      this.http.patch(
        `${environment.apiUrl}/tecnicos/${this.incidente.tecnico_id}/ubicacion`,
        {
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude
        }
      ).subscribe({
        next: () => {
          this.mensajeUbicacion = `Ubicación actualizada: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          this.actualizandoUbicacion = false;
          this.cdr.detectChanges();
          setTimeout(() => { this.mensajeUbicacion = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => {
          this.mensajeUbicacion = 'Error al actualizar ubicación';
          this.actualizandoUbicacion = false;
          this.cdr.detectChanges();
        }
      });
    },
    (err) => {
      this.mensajeUbicacion = 'No se pudo obtener la ubicación del navegador';
      this.actualizandoUbicacion = false;
      this.cdr.detectChanges();
    }
  );
}

iniciarActualizacionAutomatica() {
  if (!this.incidente?.tecnico_id) return;

  this._watchId = navigator.geolocation.watchPosition(
    (pos) => {
      // Solo enviar si tenemos coordenadas válidas
      if (!pos.coords.latitude || !pos.coords.longitude) return;

      this.http.patch(
        `${environment.apiUrl}/tecnicos/${this.incidente.tecnico_id}/ubicacion`,
        {
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude
        }
      ).subscribe({
        next: () => console.log('[GPS] Ubicación actualizada'),
        error: (e) => console.error('[GPS] Error:', e)
      });
    },
    (err) => console.error('[GPS]', err),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );

  this.rastreando = true;
  this.cdr.detectChanges();
}

detenerRastreo() {
  if (this._watchId !== null) {
    navigator.geolocation.clearWatch(this._watchId);
    this._watchId = null;
  }
  this.rastreando = false;
  this.cdr.detectChanges();
}

ngOnDestroy() {
  this.detenerRastreo();
}
ngAfterViewInit() {
  if (this.incidente) {
    this.iniciarMapaDetalle();
  }
}

iniciarMapaDetalle() {
  const el = document.getElementById('mapa-detalle');
  if (!el || this.mapaDetalle) return;

  this.mapaDetalle = L.map('mapa-detalle').setView(
    [this.incidente.latitud, this.incidente.longitud], 15
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(this.mapaDetalle);

  L.marker(
    [this.incidente.latitud, this.incidente.longitud],
    {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
    }
  ).addTo(this.mapaDetalle)
   .bindPopup('Ubicación del incidente')
   .openPopup();
}  

}