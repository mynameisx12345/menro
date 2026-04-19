import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ResidentNotification {
  id: string;
  type: 'schedule_cancelled' | 'truck_nearby';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'resident_notifications';
// Auto-clear notifications older than 7 days
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifs$ = new BehaviorSubject<ResidentNotification[]>(this.load());
  readonly notifications$ = this.notifs$.asObservable();

  get unreadCount() { return this.notifs$.value.filter(n => !n.read).length; }

  private load(): ResidentNotification[] {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ResidentNotification[];
      const cutoff = Date.now() - MAX_AGE_MS;
      return raw.filter(n => n.type !== 'truck_nearby' && new Date(n.timestamp).getTime() > cutoff);
    } catch { return []; }
  }

  private save(notifs: ResidentNotification[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    this.notifs$.next(notifs);
  }

  add(notif: Omit<ResidentNotification, 'id' | 'read'>) {
    const last = this.notifs$.value.find(n => n.type === notif.type);
    if (last?.message === notif.message) return;
    const all = [{ ...notif, id: crypto.randomUUID(), read: false }, ...this.notifs$.value];
    this.save(all);
  }

  markAllRead() {
    this.save(this.notifs$.value.map(n => ({ ...n, read: true })));
  }

  clear() {
    this.save([]);
  }
}
