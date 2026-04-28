import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent implements AfterViewInit {

  datos = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    direccion: '',
    latitud: null as number | null,
    longitud: null as number | null,
    tipos_servicio: [] as string[],
    capacidad_max: 1
  };

  error = '';
  cargando = false;
  serviciosDisponibles = ['bateria', 'llanta', 'motor', 'remolque', 'choque', 'general'];

  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    this.map = L.map('mapa-registro').setView([-17.7833, -63.1821], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.datos.latitud = parseFloat(lat.toFixed(6));
      this.datos.longitud = parseFloat(lng.toFixed(6));

      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng, { icon: iconDefault, draggable: true }).addTo(this.map);
        this.marker.on('dragend', (ev: any) => {
          const pos = ev.target.getLatLng();
          this.datos.latitud = parseFloat(pos.lat.toFixed(6));
          this.datos.longitud = parseFloat(pos.lng.toFixed(6));
        });
      }
    });
  }

  toggleServicio(servicio: string) {
    const idx = this.datos.tipos_servicio.indexOf(servicio);
    if (idx > -1) {
      this.datos.tipos_servicio.splice(idx, 1);
    } else {
      this.datos.tipos_servicio.push(servicio);
    }
  }

  tieneServicio(servicio: string): boolean {
    return this.datos.tipos_servicio.includes(servicio);
  }

  registrar() {
    if (!this.datos.latitud || !this.datos.longitud) {
      this.error = 'Por favor marcá la ubicación de tu taller en el mapa.';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.authService.registroTaller(this.datos).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err) => {
        this.error = err.error?.detail || 'Error al registrar. Intentá de nuevo.';
        this.cargando = false;
      }
    });
  }
}