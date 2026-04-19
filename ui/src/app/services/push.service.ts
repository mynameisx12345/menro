import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async subscribe(lat: number, lng: number): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push not supported'); return;
    }
    try {
      const keyRes: any = await this.http.get(`${this.apiUrl}/push/vapid-public-key`).toPromise();

      // Get or create push subscription directly from pushManager
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) => setTimeout(() => reject('SW not ready'), 8000))
      ]) as ServiceWorkerRegistration;

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(keyRes.key)
        });
      }
      console.log('Push subscription obtained, saving to server...');
      await this.http.post(`${this.apiUrl}/push/subscribe`, { subscription, lat, lng }).toPromise();
      console.log('Push subscription saved successfully');
    } catch (e) { console.warn('Push subscribe failed:', e); }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  unsubscribe(): void {
    this.http.delete(`${this.apiUrl}/push/subscribe`).subscribe();
  }

  broadcastCancellation(schedule: any) {
    return this.http.post(`${this.apiUrl}/push/broadcast`, {
      title: '🚫 Schedule Cancelled',
      body: `Collection for ${schedule.routeId} (${schedule.wasteType}) on ${schedule.date} has been cancelled.`
    });
  }
}
