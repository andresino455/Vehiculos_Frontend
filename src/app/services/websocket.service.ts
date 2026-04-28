import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket!: WebSocket;
  public mensajes$ = new Subject<any>();
  private conectado = false;
  private clienteIdActual = '';
  private tipoActual = '';

  conectar(tipo: string, clienteId: string) {
    // Si ya está conectado con el mismo cliente, no reconectar
    if (this.conectado && this.clienteIdActual === clienteId) {
      console.log('[WS] Ya conectado, ignorando reconexión');
      return;
    }

    // Si hay una conexión abierta, cerrarla primero
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    this.clienteIdActual = clienteId;
    this.tipoActual = tipo;

    const url = environment.apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    this.socket = new WebSocket(`${url}/ws/${tipo}/${clienteId}`);

    this.socket.onopen = () => {
      console.log('[WS] Conectado');
      this.conectado = true;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.mensajes$.next(data);
      } catch (e) {
        console.error('[WS] Error parseando mensaje', e);
      }
    };

    this.socket.onclose = () => {
      console.log('[WS] Desconectado');
      this.conectado = false;
      // Reconectar solo si no fue intencional
      setTimeout(() => {
        if (!this.conectado && this.clienteIdActual) {
          this.conectar(this.tipoActual, this.clienteIdActual);
        }
      }, 3000);
    };

    this.socket.onerror = (err) => {
      console.error('[WS] Error:', err);
      this.conectado = false;
    };
  }

  desconectar() {
    this.clienteIdActual = '';
    this.conectado = false;
    if (this.socket) {
      this.socket.close();
    }
  }
}