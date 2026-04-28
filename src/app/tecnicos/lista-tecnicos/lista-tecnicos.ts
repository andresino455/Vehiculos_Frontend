import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { TecnicoService } from '../../services/tecnico';

@Component({
  selector: 'app-lista-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './lista-tecnicos.html',
  styleUrls: ['./lista-tecnicos.scss']
})
export class ListaTecnicosComponent implements OnInit {

  tecnicos: any[] = [];
  cargando = true;
  mostrarFormulario = false;
  guardando = false;
  mensaje = '';
  error = '';

  nuevoTecnico = { nombre: '', apellido: '', telefono: '' };

  constructor(
    private tecnicoService: TecnicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarTecnicos();
  }

  cargarTecnicos() {
    this.cargando = true;
    this.tecnicoService.getTecnicos().subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  agregarTecnico() {
    if (!this.nuevoTecnico.nombre || !this.nuevoTecnico.apellido) return;
    this.guardando = true;
    this.error = '';
    this.tecnicoService.crearTecnico(this.nuevoTecnico).subscribe({
      next: (tecnicoCreado) => {
        this.tecnicos = [...this.tecnicos, tecnicoCreado];
        this.mensaje = 'Técnico agregado correctamente';
        this.mostrarFormulario = false;
        this.nuevoTecnico = { nombre: '', apellido: '', telefono: '' };
        this.guardando = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al agregar técnico';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(tecnico: any, estado: string) {
    this.tecnicoService.actualizarEstado(tecnico.id, estado).subscribe({
      next: () => {
        tecnico.estado = estado;
        this.tecnicos = [...this.tecnicos];
        this.cdr.detectChanges();
      },
      error: () => alert('Error al cambiar el estado')
    });
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      disponible: 'estado-disponible',
      ocupado: 'estado-ocupado',
      inactivo: 'estado-inactivo'
    };
    return clases[estado] || '';
  }

  get totalDisponibles(): number {
    return this.tecnicos.filter(t => t.estado === 'disponible').length;
  }

  get totalOcupados(): number {
    return this.tecnicos.filter(t => t.estado === 'ocupado').length;
  }
}