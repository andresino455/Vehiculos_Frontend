import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../dashboard/sidebar/sidebar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard-kpis.html',
  styleUrls: ['./dashboard-kpis.scss']
})
export class DashboardKpisComponent implements OnInit, AfterViewInit {

  kpis: any = null;
  cargando = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargar();
  }

  ngAfterViewInit() {}

  cargar() {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/kpis/dashboard`).subscribe({
      next: (data) => {
        this.kpis = data;
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.dibujarGraficos(), 100);
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  dibujarGraficos() {
    if (!this.kpis) return;
    this.dibujarTorta();
    this.dibujarBarras();
  }

  dibujarTorta() {
    const canvas = document.getElementById('grafico-tipos') as HTMLCanvasElement;
    if (!canvas || !this.kpis.incidentes_por_tipo?.length) return;
    const ctx = canvas.getContext('2d')!;
    const datos = this.kpis.incidentes_por_tipo;
    const colores = ['#534AB7', '#1D9E75', '#D85A30', '#BA7517', '#185FA5', '#A32D2D'];
    const total = datos.reduce((s: number, d: any) => s + d.total, 0);
    let angulo = -Math.PI / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    datos.forEach((d: any, i: number) => {
      const slice = (d.total / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angulo, angulo + slice);
      ctx.closePath();
      ctx.fillStyle = colores[i % colores.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const midAngle = angulo + slice / 2;
      const lx = cx + (r * 0.65) * Math.cos(midAngle);
      const ly = cy + (r * 0.65) * Math.sin(midAngle);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (d.total / total > 0.05) ctx.fillText(`${d.total}`, lx, ly);
      angulo += slice;
    });
  }

  dibujarBarras() {
    const canvas = document.getElementById('grafico-dias') as HTMLCanvasElement;
    if (!canvas || !this.kpis.incidentes_por_dia?.length) return;
    const ctx = canvas.getContext('2d')!;
    const datos = this.kpis.incidentes_por_dia;
    const max = Math.max(...datos.map((d: any) => d.total), 1);
    const w = canvas.width;
    const h = canvas.height;
    const pad = 40;
    const barW = (w - pad * 2) / datos.length - 8;

    ctx.clearRect(0, 0, w, h);

    datos.forEach((d: any, i: number) => {
      const barH = ((d.total / max) * (h - pad * 2));
      const x = pad + i * ((w - pad * 2) / datos.length) + 4;
      const y = h - pad - barH;

      ctx.fillStyle = '#534AB7';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();

      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.dia.slice(5), x + barW / 2, h - 10);

      ctx.fillStyle = '#534AB7';
      ctx.font = '11px sans-serif';
      ctx.fillText(d.total, x + barW / 2, y - 6);
    });
  }

  getTipoColor(tipo: string): string {
    const colores: any = {
      bateria: '#534AB7', llanta: '#1D9E75', choque: '#D85A30',
      motor: '#BA7517', otros: '#185FA5', incierto: '#888'
    };
    return colores[tipo] || '#888';
  }

  getSlaColor(pct: number): string {
    if (pct >= 80) return '#276749';
    if (pct >= 60) return '#B7791F';
    return '#C53030';
  }

  getSlaLabel(pct: number): string {
    if (pct >= 80) return 'Excelente';
    if (pct >= 60) return 'Regular';
    return 'Por mejorar';
  }
}