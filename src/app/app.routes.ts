import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'registro',
        loadComponent: () => import('./auth/registro/registro').then(m => m.RegistroComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'incidentes/:id',
        loadComponent: () => import('./incidentes/detalle-incidente/detalle-incidente').then(m => m.DetalleIncidenteComponent)
      },
      {
        path: 'tecnicos',
        loadComponent: () => import('./tecnicos/lista-tecnicos/lista-tecnicos').then(m => m.ListaTecnicosComponent)
      },
      {
  path: 'historial',
  loadComponent: () => import('./incidentes/historial-atenciones/historial-atenciones').then(m => m.HistorialAtencionesComponent)
},
{
  path: 'finanzas',
  loadComponent: () => import('./finanzas/calificaciones-pagos/calificaciones-pagos').then(m => m.CalificacionesPagosComponent)
},
{
  path: 'kpis',
  loadComponent: () => import('./kpis/dashboard-kpis/dashboard-kpis').then(m => m.DashboardKpisComponent)
},
{
  path: 'tenants',
  loadComponent: () => import('./admin/tenants/tenants').then(m => m.TenantsComponent)
},
    ]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];