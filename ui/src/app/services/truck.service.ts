import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { Truck } from '../models/models';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  truckId: string;
  fromId: string;
  fromName: string;
  toId: string;
  message: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class TruckService {
  private apiUrl = environment.apiUrl;
  trucks$ = new BehaviorSubject<Truck[]>([]);
  trucksLoaded = false;
  chat$ = new Subject<ChatMessage>();
  scheduleUpdate$ = new Subject<any>();
  scheduleCancelled$ = new Subject<any>();
  private ws!: WebSocket;
  _currentUserId = '';

  constructor(private http: HttpClient) {}

  loadTrucks() {
    return this.http.get<Truck[]>(`${this.apiUrl}/trucks`).pipe();
  }

  connectWebSocket() {
    this.loadTrucks().subscribe(trucks => { this.trucksLoaded = true; this.trucks$.next(trucks); });
    this.ws = new WebSocket(environment.wsUrl);
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'trucks') { this.trucksLoaded = true; this.trucks$.next(msg.data); }
      else if (msg.type === 'truck_update') {
        const current = this.trucks$.value;
        const idx = current.findIndex(t => t.id === msg.data.id);
        if (idx !== -1) { current[idx] = msg.data; this.trucks$.next([...current]); }
      } else if (msg.type === 'chat') {
        if (msg.data.fromId !== this._currentUserId) this.chat$.next(msg.data);
      } else if (msg.type === 'schedule_update') {
        this.scheduleUpdate$.next(msg.data);
      } else if (msg.type === 'schedule_cancelled') {
        this.scheduleCancelled$.next(msg.data);
      }
    };
    this.ws.onerror = () => console.warn('WS error, falling back to HTTP polling');
  }

  broadcastScheduleCancelled(schedule: any) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify({ type: 'schedule_cancelled', data: schedule }));
  }

  sendChat(msg: ChatMessage) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify({ type: 'chat', ...msg }));
  }

  sendLocation(truckId: string, lat: number, lng: number, collectorId?: string, scheduleId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify({ truckId, lat, lng, collectorId, scheduleId }));
  }

  disconnect() { this.ws?.close(); }

  updateLocation(id: string, lat: number, lng: number) {
    return this.http.put(`${this.apiUrl}/trucks/${id}/location`, { lat, lng });
  }

  createTruck(truck: Partial<Truck>) {
    return this.http.post<Truck>(`${this.apiUrl}/trucks`, truck).pipe(
      tap(created => this.trucks$.next([...this.trucks$.value, created]))
    );
  }

  updateTruck(id: string, truck: Partial<Truck>) {
    return this.http.put<Truck>(`${this.apiUrl}/trucks/${id}`, truck).pipe(
      tap(updated => this.trucks$.next(this.trucks$.value.map(t => t.id === id ? updated : t)))
    );
  }

  deleteTruck(id: string) {
    return this.http.delete(`${this.apiUrl}/trucks/${id}`).pipe(
      tap(() => this.trucks$.next(this.trucks$.value.filter(t => t.id !== id)))
    );
  }
}
