import { geoSearch, geoReverse } from '../../utils/geocode';
import { FEATURES } from '../../features';
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { TruckService, ChatMessage } from '../../services/truck.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Truck } from '../../models/models';
import { Subscription, Observable, merge, of, BehaviorSubject, combineLatest, skip } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { ScheduleComponent } from './schedule/schedule.component';
import { WasteTypeComponent } from './waste-type/waste-type.component';
import { FleetComponent } from './fleet/fleet.component';
import { UsersComponent } from './users/users.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { NoSignalReportComponent } from './no-signal-report/no-signal-report.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent, WasteTypeComponent, FleetComponent, UsersComponent, ComplaintsComponent, AppSettingsComponent, NoSignalReportComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly features = FEATURES;
  activeTab = 'map';
  trucks: Truck[] = [];
  loadingTrucks = true;
  protected inProgressTruckIds = new BehaviorSubject<Set<string>>(new Set());
  subTab = 'schedules';
  mapLoading = true;
  noSignalThresholdMs = 15 * 60 * 1000; // default 15 min, overridden by settings
  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private routeLines = new Map<string, L.Polyline>();
  private areaWaypointsCache = new Map<string, [number, number][]>(); // scheduleId -> pts
  private residentPtsCache: [number, number][] = [];
  private drawnSchedule = new Map<string, string>(); // truckId -> scheduleId
  private lastRoutePos = new Map<string, [number, number]>(); // truckId -> last rerouted pos
  private schedules: any[] = [];
  private sub!: Subscription;

  activeTrucks$!: Observable<number | null>;

  openComplaints$!: Observable<number | null>;
  openCollectorIssues$!: Observable<number | null>;
  activeResidents$!: Observable<number | null>;
  chatTruck: Truck | null = null;
  chatMessages: ChatMessage[] = [];
  chatInput = '';

  constructor(private truckSvc: TruckService, private dataSvc: DataService, protected auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    document.title = 'Dashboard';
    if (this.auth.getStoredUser()?.role !== 'admin') {
      this.auth.logout();
      this.router.navigate(['/menro/login']);
      return;
    }
    this.activeTrucks$ = merge(of(null), combineLatest([this.truckSvc.trucks$, this.inProgressTruckIds]).pipe(filter(() => this.truckSvc.trucksLoaded), map(([trucks, ids]) => trucks.filter(t => t.status === 'active' && ids.has(t.id)).length)));
    this.openComplaints$ = merge(
      of(null),
      this.dataSvc.getHttpComplaints().pipe(tap(list => this.dataSvc.seedComplaints(list)), map(list => list.filter(c => c.status === 'open').length)),
      this.dataSvc.getComplaints().pipe(skip(1), map(list => list.filter(c => c.status === 'open').length))
    );
    this.openCollectorIssues$ = merge(
      of(null),
      this.dataSvc.getHttpSegregationIssues().pipe(tap(list => this.dataSvc.seedIssues(list)), map(list => list.filter(s => s.status === 'open').length)),
      this.dataSvc.getSegregationIssues().pipe(skip(1), map(list => list.filter(s => s.status === 'open').length))
    );
    this.activeResidents$ = merge(of(null), this.auth.getUsers().pipe(map(users => users.filter(u => u.role === 'resident' && u.status === 'approved').length)));
    this.truckSvc.connectWebSocket();
    this.dataSvc.getSettings().subscribe(s => {
      if (s['noSignalThresholdMinutes']) this.noSignalThresholdMs = +s['noSignalThresholdMinutes'] * 60 * 1000;
    });
    this.truckSvc._currentUserId = this.auth.getStoredUser()?.id || '';
    this.truckSvc.chat$.subscribe(msg => {
      if (this.chatTruck && msg.truckId === this.chatTruck.id) {
        this.chatMessages.push(msg);
        setTimeout(() => { const el = document.getElementById('admin-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
      }
    });
    this.dataSvc.getSchedules().subscribe(schedules => {
      this.schedules = schedules;
      const ids = new Set<string>();
      schedules.filter(s => s.status === 'in-progress').forEach(s => ids.add(s.truckId));
      this.inProgressTruckIds.next(ids);
    });
    this.truckSvc.scheduleUpdate$.subscribe(schedule => {
      // Update local schedules list
      const idx = this.schedules.findIndex(s => s.id === schedule.id);
      if (idx !== -1) this.schedules[idx] = schedule; else this.schedules.push(schedule);
      // Rebuild in-progress set
      const ids = new Set<string>();
      this.schedules.filter(s => s.status === 'in-progress').forEach(s => ids.add(s.truckId));
      this.inProgressTruckIds.next(ids);
      // Clear cached route for this truck so it redraws with new areas
      this.routeLines.get(schedule.truckId)?.remove();
      this.routeLines.delete(schedule.truckId);
      this.areaWaypointsCache.delete(schedule.id);
      this.drawnSchedule.delete(schedule.truckId);
      // Redraw
      const truck = this.trucks.find(t => t.id === schedule.truckId);
      if (truck && schedule.status === 'in-progress') this.drawTruckRoute(truck);
    });
    this.sub = this.truckSvc.trucks$.subscribe(trucks => {
      this.trucks = trucks;
      this.loadingTrucks = false;
      this.updateMarkers();
      if (this.map) {
        trucks.filter(t => t.status === 'active' && this.inProgressTruckIds.value.has(t.id))
              .forEach(t => this.drawTruckRoute(t));
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    if (!document.getElementById('admin-map')) return;
    this.map = L.map('admin-map').setView([14.5995, 120.9842], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Wait for trucks + schedules to be loaded before rendering map content
    const waitForData = new Promise<void>(resolve => {
      if (this.truckSvc.trucksLoaded) { resolve(); return; }
      const check = setInterval(() => {
        if (this.truckSvc.trucksLoaded) { clearInterval(check); resolve(); }
      }, 100);
    });

    waitForData.then(async () => {
      this.updateMarkers();
      const visibleTrucks = this.trucks.filter(t => t.status === 'active' && this.inProgressTruckIds.value.has(t.id));
      if (!visibleTrucks.length && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        });
      }
      const routePromises = visibleTrucks.map(t => this.drawTruckRoute(t));
      await Promise.all([this.showResidentMarkers(), ...routePromises]);
      this.mapLoading = false;
      this.cdr.markForCheck();
    });
  }

  private async showResidentMarkers(): Promise<void> {
    if (!this.map) return;
    const homeIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#2d6a4f;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center">
        <svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>`,
      className: 'leaflet-div-icon-clean',
      iconAnchor: [16, 32],
      popupAnchor: [0, -34]
    });
    return new Promise<void>(resolve => {
      this.dataSvc.getResidents().subscribe({
        next: async residents => {
          for (const r of residents) {
            if (!r.address && r.lat == null) continue;
            try {
              let lat: number, lng: number;
              if (r.lat != null && r.lng != null) {
                lat = r.lat; lng = r.lng;
              } else {
                const pt = await geoSearch(r.address);
                if (!pt) continue;
                lat = pt.lat; lng = pt.lon;
              }
              L.marker([lat, lng], { icon: homeIcon })
                .addTo(this.map)
                .bindPopup(`<b>${r.name}</b><br>📍 ${r.address}`);
            } catch { /* skip */ }
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  updateMarkers() {
    if (!this.map) return;
    const visibleTrucks = this.trucks.filter(t => t.status === 'active' && this.inProgressTruckIds.value.has(t.id));
    // Remove markers for trucks no longer visible
    this.markers.forEach((marker, id) => {
      if (!visibleTrucks.find(t => t.id === id)) { marker.remove(); this.markers.delete(id); }
    });
    visibleTrucks.forEach(truck => {
      const noSignal = this.isNoSignal(truck);
      const color = noSignal ? '#e67e22' : (truck.status === 'active' ? '#2d6a4f' : '#999');
      const emoji = noSignal ? '⚠️' : '🚛';
      const icon = L.divIcon({
        html: `<div style="position:relative;width:40px;height:48px"><div style="width:40px;height:40px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:18px">${emoji}</span></div></div>`,
        className: 'leaflet-div-icon-clean', iconAnchor: [20, 48], popupAnchor: [0, -50]
      });
      if (this.markers.has(truck.id)) {
        this.markers.get(truck.id)!.setLatLng([truck.lat, truck.lng]);
      } else {
        const marker = L.marker([truck.lat, truck.lng], { icon })
          .addTo(this.map)
          .bindPopup(() => {
            const s = this.schedules.find(s => s.truckId === truck.id && s.status === 'in-progress');
            return `<b>${truck.plateNumber}</b><br>${truck.collectorName}<br>♻️ ${s?.wasteType || truck.wasteType}<br>📍 ${s?.routeId || truck.route}`;
          });
        this.markers.set(truck.id, marker);
      }
    });
    // Zoom to first truck on initial load
    if (visibleTrucks.length && this.markers.size === visibleTrucks.length) {
      const first = visibleTrucks[0];
      this.map.setView([first.lat, first.lng], 16);
    } else if (!visibleTrucks.length && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      });
    }
  }

  onTrucksChange(trucks: Truck[]) {
    this.trucks = trucks;
    this.truckSvc.trucks$.next(trucks);
    this.markers.forEach(m => m.remove());
    this.markers.clear();
    this.updateMarkers();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'map') setTimeout(() => this.map?.invalidateSize(), 50);
  }

  getInProgressSchedule(truckId: string) {
    return this.schedules.find(s => s.truckId === truckId && s.status === 'in-progress');
  }

  focusTruck(truck: Truck) {
    this.setTab('map');
    setTimeout(() => {
      this.map?.setView([truck.lat, truck.lng], 16);
      this.markers.get(truck.id)?.openPopup();
    }, 100);
  }

  private async drawTruckRoute(truck: Truck) {
    if (!this.map || !truck.lat || !truck.lng) return;
    const schedule = this.schedules.find(s => s.truckId === truck.id && s.status === 'in-progress');
    if (!schedule?.areas?.length) return;

    // If schedule changed, clear old route line and area cache
    if (this.drawnSchedule.get(truck.id) !== schedule.id) {
      this.routeLines.get(truck.id)?.remove();
      this.routeLines.delete(truck.id);
      this.areaWaypointsCache.delete(this.drawnSchedule.get(truck.id) || '');
      this.drawnSchedule.set(truck.id, schedule.id);
      this.lastRoutePos.delete(truck.id);
    }

    // Geocode areas once per schedule
    if (!this.areaWaypointsCache.has(schedule.id)) {
      const pts: [number, number][] = [];
      for (const area of schedule.areas) {
        try {
          const pt = await geoSearch(area + ', Philippines'); if (pt) pts.push([pt.lat, pt.lon]);
        } catch { /* skip */ }
      }
      if (!pts.length) return;
      this.areaWaypointsCache.set(schedule.id, pts);
    }

    // Geocode residents once
    if (!this.residentPtsCache.length) {
      await new Promise<void>(resolve => {
        this.dataSvc.getResidents().subscribe(async residents => {
          for (const r of residents) {
            try {
              if (r.lat != null && r.lng != null) {
                this.residentPtsCache.push([r.lat, r.lng]);
              } else {
                if (!r.address) continue;
                const pt = await geoSearch(r.address);
                if (pt) this.residentPtsCache.push([pt.lat, pt.lon]);
              }
            } catch { /* skip */ }
          }
          resolve();
        });
      });
    }

    const pos: [number, number] = [truck.lat, truck.lng];

    // Only reroute if truck moved more than 50m from last rerouted position
    const last = this.lastRoutePos.get(truck.id);
    if (last) {
      const R = 6371000;
      const dLat = (pos[0] - last[0]) * Math.PI / 180;
      const dLng = (pos[1] - last[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(last[0]*Math.PI/180)*Math.cos(pos[0]*Math.PI/180)*Math.sin(dLng/2)**2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      if (dist < 50) return;
    }
    this.lastRoutePos.set(truck.id, pos);

    const areaPoints = this.areaWaypointsCache.get(schedule.id)!;
    const nearbyResidents = this.residentPtsCache.filter(([lat, lng]) => {
      const R = 6371;
      const dLat = (lat - pos[0]) * Math.PI / 180;
      const dLng = (lng - pos[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(pos[0]*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= 1;
    });

    try {
      const waypoints: [number, number][] = [pos, ...nearbyResidents, ...areaPoints];
      const coords = waypoints.map(w => `${w[1]},${w[0]}`).join(';');
      const osrm = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const osrmData = await osrm.json();
      if (osrmData.code !== 'Ok') return;
      const line: [number, number][] = osrmData.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      if (this.routeLines.has(truck.id)) {
        this.routeLines.get(truck.id)!.setLatLngs(line);
      } else {
        this.routeLines.set(truck.id, L.polyline(line, { color: '#e94560', weight: 4, opacity: 0.8, dashArray: '8,4' }).addTo(this.map));
      }
    } catch { /* skip */ }
  }

  isNoSignal(truck: Truck): boolean {
    if (!this.inProgressTruckIds.value.has(truck.id)) return false;
    const last = truck.lastUpdated ? new Date(truck.lastUpdated).getTime() : 0;
    return Date.now() - last > this.noSignalThresholdMs;
  }

  logout() { this.auth.logout(); this.router.navigate(['/menro/login']); }

  async refreshMap() {
    this.mapLoading = true;
    this.cdr.markForCheck();
    // Clear all drawn layers
    this.markers.forEach(m => m.remove()); this.markers.clear();
    this.routeLines.forEach(l => l.remove()); this.routeLines.clear();
    this.areaWaypointsCache.clear();
    this.residentPtsCache = [];
    this.drawnSchedule.clear();
    this.lastRoutePos.clear();
    // Redraw
    this.updateMarkers();
    const visibleTrucks = this.trucks.filter(t => t.status === 'active' && this.inProgressTruckIds.value.has(t.id));
    const routePromises = visibleTrucks.map(t => this.drawTruckRoute(t));
    await Promise.all([this.showResidentMarkers(), ...routePromises]);
    this.mapLoading = false;
    this.cdr.markForCheck();
  }

  openChat(truck: Truck) { this.chatTruck = truck; this.chatMessages = []; }
  closeChat() { this.chatTruck = null; this.chatMessages = []; this.chatInput = ''; }

  sendChatMessage() {
    if (!this.chatInput.trim() || !this.chatTruck) return;
    const user = this.auth.getStoredUser();
    const msg: ChatMessage = {
      truckId: this.chatTruck.id,
      fromId: user?.id || '',
      fromName: user?.name || 'Admin',
      toId: (this.chatTruck as any).collectorId || '',
      message: this.chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    this.truckSvc.sendChat(msg);
    this.chatMessages.push(msg);
    this.chatInput = '';
    setTimeout(() => { const el = document.getElementById('admin-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.truckSvc.disconnect();
    this.routeLines.forEach(l => l.remove());
    this.map?.remove();
  }
}
