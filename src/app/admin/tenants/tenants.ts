import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './tenants.html',
  styleUrls: ['./tenants.scss']
})
export class TenantsComponent implements OnInit {

  tenants: any[] = [];
  estadisticas: any = {};
  cargando = true;
  mostrarFormulario = false;
  guardando = false;
  mensaje = '';

  nuevoTenant = { nombre: '', descripcion: '', codigo: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/tenants/`).subscribe({
      next: (data) => {
        this.tenants = data;
        this.cargando = false;
        data.forEach(t => this.cargarEstadisticas(t.id));
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  cargarEstadisticas(tenantId: string) {
    this.http.get<any>(`${environment.apiUrl}/tenants/${tenantId}/estadisticas`).subscribe({
      next: (data) => {
        this.estadisticas[tenantId] = data;
        this.cdr.detectChanges();
      }
    });
  }

  crearTenant() {
    if (!this.nuevoTenant.nombre) return;
    this.guardando = true;
    this.http.post(`${environment.apiUrl}/tenants/`, this.nuevoTenant).subscribe({
      next: () => {
        this.mensaje = 'Tenant creado correctamente';
        this.mostrarFormulario = false;
        this.nuevoTenant = { nombre: '', descripcion: '', codigo: '' };
        this.guardando = false;
        this.cargar();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: () => { this.guardando = false; }
    });
  }
}