import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { IncidenteService } from '../../services/incidente';
import { TecnicoService } from '../../services/tecnico';
import { TallerService } from '../../services/taller';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  incidentesPendientes: any[] = [];
  tecnicos: any[] = [];
  perfil: any = null;
  cargando = true;
  mapaListo = false;
  notificaciones: any[] = [];
  private pollingInterval: any;

  private map!: L.Map;
  private marcadores: L.Marker[] = [];
  private wsSub!: Subscription;
  private wsConectado = false;

  constructor(
    private incidenteService: IncidenteService,
    private tecnicoService: TecnicoService,
    private tallerService: TallerService,
    private wsService: WebsocketService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit() {
  this.cargarDatos();
  this.solicitarPermisoNotificaciones();
  this.pollingInterval = setInterval(() => {
    const cantidadAnterior = this.incidentesPendientes.filter(i => i.estado === 'buscando_taller').length;
    this.incidenteService.getDisponibles().subscribe({
      next: (incidentes) => {
        const cantidadNueva = incidentes.filter((i: any) => i.estado === 'buscando_taller').length;
        if (cantidadNueva > cantidadAnterior) {
          this.mostrarNotificacionNavegador('Nueva emergencia', 'Hay un nuevo incidente ');
        }
        this.incidentesPendientes = incidentes;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }, 15000);
}

solicitarPermisoNotificaciones() {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
}

mostrarNotificacionNavegador(titulo: string, mensaje: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensaje,
      icon: '/favicon.ico'
    });
  }
}
  ngAfterViewInit() {
    setTimeout(() => {
      this.iniciarMapa();
      this.mapaListo = true;
    }, 100);
  }

  ngOnDestroy() {
    if (this.wsSub) this.wsSub.unsubscribe();
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  cargarDatos() {
    this.tallerService.getPerfil().subscribe({
      next: (p) => {
        this.perfil = p;
        // Conectar WS solo una vez
        if (!this.wsConectado && p?.id) {
          this.wsConectado = true;
          this.wsService.conectar('taller', p.id);
          this.wsSub = this.wsService.mensajes$.subscribe(msg => {
            this.notificaciones.unshift(msg);
            if (msg.tipo === 'nuevo_incidente') {
              this.cargarIncidentes();
            }
            this.cdr.detectChanges();
          });
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.cargarIncidentes();

    this.tecnicoService.getTecnicos().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
        this.actualizarMarcadores();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  cargarIncidentes() {
    this.incidenteService.getDisponibles().subscribe({
      next: (incidentes) => {
        this.incidentesPendientes = incidentes;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  iniciarMapa() {
    const el = document.getElementById('mapa-tecnicos');
    if (!el || this.map) return;
    this.map = L.map('mapa-tecnicos').setView([-17.7833, -63.1821], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    this.actualizarMarcadores();
  }

  actualizarMarcadores() {
    if (!this.map) return;
    this.marcadores.forEach(m => m.remove());
    this.marcadores = [];
    this.tecnicos.forEach(t => {
      if (t.latitud_actual && t.longitud_actual) {
        const marker = L.marker([t.latitud_actual, t.longitud_actual], { icon: iconDefault })
          .addTo(this.map)
          .bindPopup(`<b>${t.nombre} ${t.apellido}</b><br>Estado: ${t.estado}`);
        this.marcadores.push(marker);
      }
    });
  }

  get stats() {
    return {
      pendientes: this.incidentesPendientes.filter(i => i.estado === 'buscando_taller').length,
      enProceso: this.incidentesPendientes.filter(i => i.estado === 'en_camino' || i.estado === 'en_atencion' ).length,
    };
  }

  get tecnicosDisponibles(): number {
    return this.tecnicos.filter(t => t.estado === 'disponible').length;
  }

  getPrioridadClass(prioridad: string): string {
    const clases: any = { alta: 'prioridad-alta', media: 'prioridad-media', baja: 'prioridad-baja' };
    return clases[prioridad] || 'prioridad-media';
  }

getEstadoClass(estado: string): string {
  const clases: any = {
    buscando_taller: 'estado-buscando',
    taller_asignado: 'estado-asignado',
    en_camino: 'estado-camino',
    en_atencion: 'estado-atencion',
    finalizado: 'estado-finalizado',
    cancelado: 'estado-cancelado',
    pendiente: 'estado-pendiente'
  };
  return clases[estado] || '';
}

rechazarIncidente(id: string) {
  this.http.post(`${environment.apiUrl}/incidentes/${id}/rechazar`, {motivo: 'No disponible'}).subscribe({
    next: () => this.cargarIncidentes(),
    error: (err) => alert(err.error?.detail || 'Error al rechazar')
  });
}
  aceptarIncidente(id: string) {
    this.incidenteService.asignarTaller(id).subscribe({
      next: () => this.cargarDatos(),
      error: (err) => alert(err.error?.detail || 'Error al aceptar el incidente')
    });
  }
}