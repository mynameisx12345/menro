import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { geoSearch } from '../../utils/geocode';
import { FEATURES } from '../../features';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { TruckService, ChatMessage } from '../../services/truck.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Truck, WasteType, SegregationIssue, Schedule } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collector-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collector-app.component.html',
  styleUrls: ['./collector-app.component.scss']
})
export class CollectorAppComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly features = FEATURES;
  activeTab = 'map';
  user: any = null;
  myTruck: Truck | null = null;
  trucks: Truck[] = [];
  issue: any = {};
  wasteTypes: WasteType[] = [];
  myIssues: SegregationIssue[] = [];
  mySchedules: Schedule[] = [];
  selectedSchedule: Schedule | null = null;
  showRouteModal = false;
  showSettings = false;
  showCompleteModal = false;
  scheduleToComplete: Schedule | null = null;
  collectionCompleted = false;
  get activeSchedules() { return this.mySchedules.filter(s => s.status === 'in-progress'); }
  showWasteHint = false;
  get currentWasteType(): WasteType | null {
    if (!this.selectedSchedule) return null;
    return this.wasteTypes.find(w => w.name === this.selectedSchedule!.wasteType) ?? null;
  }
  installPrompt: any = (window as any).__installPrompt ?? null;
  isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !(window.navigator as any).standalone;
  showChat = false;
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  unreadCount = 0;
  // Draggable chat icon state
  chatIconPos: { x: number, y: number } | null = null;
  private dragging = false;
  private dragOffset = { x: 0, y: 0 };
  photos: string[] = [];
  selectedPhoto: string | null = null;
  showCamera = false;
  private stream!: MediaStream;
  collection: any = { wasteType: 'Biodegradable' };
  issueSubmitted = false;
  collectionLogged = false;
  step = 1;
  collectionLog: any[] = [];
  routeLoading = false;
  locationError = false;
  private watchId: number | string | null = null;
  private map!: L.Map;
  private myMarker!: L.Marker;
  private sub!: Subscription;

  constructor(private truckSvc: TruckService, private dataSvc: DataService, private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.user = this.auth.getStoredUser();
  }

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      (window as any).__installPrompt = e;
    });
    document.title = 'Collector View';
    this.truckSvc.connectWebSocket();
    this.truckSvc._currentUserId = this.user?.id || '';
    this.truckSvc.chat$.subscribe(msg => {
      // Only receive messages directed to this collector's truck
      if (msg.toId === this.user?.id || msg.truckId === this.myTruck?.id) {
        this.chatMessages.push(msg);
        if (!this.showChat) this.unreadCount++;
        setTimeout(() => { const el = document.getElementById('collector-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
      }
    });
    this.sub = this.truckSvc.trucks$.subscribe(trucks => {
      this.trucks = trucks;
      const truckId = this.user?.truckId;
      if (truckId) {
        this.myTruck = trucks.find(t => t.id === truckId) || null;
        this.updateMyMarker();
        // Show resident markers once we have truck data (runs once)
        if (trucks.length && !this.residentMarkersLoaded) {
          this.residentMarkersLoaded = true;
          this.showResidentMarkers();
        }
      }
    });
    this.dataSvc.getWasteTypes().subscribe(w => {
      this.wasteTypes = w;
      if (w.length) this.issue.wasteType = w[0].name;
    });
    this.dataSvc.getMySegregationIssues().subscribe(i => this.myIssues = i);
    this.loadMySchedules();
    this.showRouteModal = true;
  }

  loadMySchedules(showModal = false) {
    this.dataSvc.getSchedules().subscribe((schedules: Schedule[]) => {
      const truckId = this.user?.truckId;
      this.mySchedules = schedules.filter(s => s.truckId === truckId && s.status !== 'completed' && s.status !== 'cancelled');
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    const tryInit = () => {
      if (!document.getElementById('collector-map')) { setTimeout(tryInit, 100); return; }
      this.initMap();
      this.dataSvc.getSchedules().subscribe((schedules: Schedule[]) => {
        const truckId = this.user?.truckId;
        const inProgress = schedules.find(s => s.truckId === truckId && s.status === 'in-progress');
        if (inProgress && !this.selectedSchedule) {
          this.selectedSchedule = inProgress;
          this.drawRoute(inProgress);
        }
      });
    };
    setTimeout(tryInit, 100);
  }

  initMap() {
    const center: [number, number] = [14.5995, 120.9842];
    this.map = L.map('collector-map').setView(center, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    if (!navigator.geolocation) {
      this.locationError = true;
    }

    let recenterTimer: any;
    this.map.on('dragend', () => {
      clearTimeout(recenterTimer);
      recenterTimer = setTimeout(() => {
        if (this.myTruck) this.map.panTo([this.myTruck.lat, this.myTruck.lng]);
      }, 2000);
    });
  }

  private isDragging = false;

  updateMyMarker() {
    if (!this.map || !this.myTruck) return;
    const icon = L.divIcon({
      html: `<div style="position:relative;width:40px;height:48px"><div style="width:40px;height:40px;background:#e53e3e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:18px">🚛</span></div></div>`,
      className: 'leaflet-div-icon-clean', iconAnchor: [20, 48], popupAnchor: [0, -50]
    });
    if (this.myMarker) {
      this.myMarker.setLatLng([this.myTruck.lat, this.myTruck.lng]);
    } else {
      this.myMarker = L.marker([this.myTruck.lat, this.myTruck.lng], { icon })
        .addTo(this.map)
        .bindPopup(`<b>My Truck</b><br>${this.myTruck.plateNumber}<br>${this.myTruck.route}`);
      this.map.setView([this.myTruck.lat, this.myTruck.lng], 16);
      this.map.on('dragstart', () => this.isDragging = true);
      this.map.on('dragend', () => this.isDragging = false);
    }
    if (!this.isDragging) this.map.panTo([this.myTruck.lat, this.myTruck.lng]);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'map') setTimeout(() => this.map?.invalidateSize(), 50);
    if (tab === 'log') this.dataSvc.getMySegregationIssues().subscribe(i => this.myIssues = i);
  }

  private routeLine: L.Polyline | null = null;
  private residentMarkers: L.Marker[] = [];

  confirmRoute(s: Schedule) {
    this.selectedSchedule = s;
    this.showWasteHint = false;
    this.showRouteModal = false;

    // Set all other non-completed schedules for this truck to pending
    this.mySchedules
      .filter(x => x.id !== s.id && x.status !== 'completed' && x.status !== 'pending')
      .forEach(x => {
        this.dataSvc.updateSchedule(x.id, { status: 'pending' }).subscribe(() => x.status = 'pending');
      });

    if (s.status !== 'in-progress') {
      this.dataSvc.updateSchedule(s.id, { status: 'in-progress' }).subscribe(() => {
        s.status = 'in-progress';
        this.cdr.detectChanges();
      });
    }
    this.startLocationBroadcast(s);
    this.lastRoutePos = null;
    this.cachedResidentPts = [];
    this.routeLoading = true;
    this.drawRoute(s).finally(() => { this.routeLoading = false; this.cdr.detectChanges(); });
    this.showResidentMarkers();
  }

  private cachedAreaWaypoints: [number, number][] = [];
  navSteps: { instruction: string; distance: string }[] = [];
  navOpen = false;

  private async drawRoute(s: Schedule): Promise<void> {
    if (!s.areas?.length) return;
    let waited = 0;
    while (!this.map && waited < 3000) { await new Promise<void>(r => setTimeout(r, 100)); waited += 100; }
    if (!this.map) return;
    try {
      const start = await new Promise<[number, number]>(resolve => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => resolve([pos.coords.latitude, pos.coords.longitude]),
            () => resolve([14.5995, 120.9842]),
            { timeout: 5000, enableHighAccuracy: true }
          );
        } else { resolve([14.5995, 120.9842]); }
      });
      // Geocode areas once and cache
      this.cachedAreaWaypoints = [];
      for (const area of s.areas) {
        const pt = await geoSearch(area + ', Philippines'); if (pt) this.cachedAreaWaypoints.push([pt.lat, pt.lon]);
      }
      await this.rerouteFrom(start);
    } catch { /* silently skip */ }
  }

  private cachedResidentPts: [number, number][] = [];
  private lastRoutePos: [number, number] | null = null;
  private residentMarkersLoaded = false;

  private async rerouteFrom(pos: [number, number]): Promise<void> {
    if (!this.map || !this.cachedAreaWaypoints.length) return;
    // Throttle: only reroute if moved >50m
    if (this.lastRoutePos) {
      const R = 6371000;
      const dLat = (pos[0] - this.lastRoutePos[0]) * Math.PI / 180;
      const dLng = (pos[1] - this.lastRoutePos[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(this.lastRoutePos[0]*Math.PI/180)*Math.cos(pos[0]*Math.PI/180)*Math.sin(dLng/2)**2;
      if (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) < 50) return;
    }
    this.lastRoutePos = pos;
    try {
      // Fetch and geocode residents once, then filter by 1km from current pos
      if (!this.cachedResidentPts.length) {
        await new Promise<void>(resolve => {
          this.dataSvc.getResidents().subscribe(async residents => {
            for (const r of residents) {
              try {
                if (r.lat != null && r.lng != null) {
                  this.cachedResidentPts.push([r.lat, r.lng]);
                } else {
                  if (!r.address) continue;
                  const pt = await geoSearch(r.address); if (pt) this.cachedResidentPts.push([pt.lat, pt.lon]);
                }
              } catch { /* skip */ }
            }
            resolve();
          });
        });
      }

      const nearbyResidents = this.cachedResidentPts.filter(([lat, lng]) => {
        const R = 6371;
        const dLat = (lat - pos[0]) * Math.PI / 180;
        const dLng = (lng - pos[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(pos[0]*Math.PI/180) * Math.cos(lat*Math.PI/180) * Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= 1;
      });

      const waypoints: [number, number][] = [pos, ...nearbyResidents, ...this.cachedAreaWaypoints];
      const coords = waypoints.map(w => `${w[1]},${w[0]}`).join(';');
      const osrm = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`);
      const osrmData = await osrm.json();
      if (osrmData.code !== 'Ok') return;
      const line: [number, number][] = osrmData.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      if (this.routeLine) {
        this.routeLine.setLatLngs(line);
      } else {
        this.routeLine = L.polyline(line, { color: '#e94560', weight: 4, opacity: 0.8, dashArray: '8,4' }).addTo(this.map);
        this.map.fitBounds(this.routeLine.getBounds(), { padding: [40, 40] });
      }
      // Extract turn-by-turn steps
      const steps = osrmData.routes[0].legs.flatMap((leg: any) => leg.steps);
      this.navSteps = steps
        .filter((s: any) => s.maneuver?.type !== 'depart' || steps.indexOf(s) === 0)
        .map((s: any) => ({
          instruction: this.formatStep(s),
          distance: s.distance >= 1000 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`
        }));
      this.cdr.detectChanges();
    } catch { /* silently skip */ }
  }

  private formatStep(step: any): string {
    const type = step.maneuver?.type;
    const modifier = step.maneuver?.modifier;
    const name = step.name || '';
    const icons: Record<string, string> = {
      'turn left': '↰', 'turn right': '↱', 'turn slight left': '↖', 'turn slight right': '↗',
      'turn sharp left': '⬅', 'turn sharp right': '➡', 'continue': '⬆', 'merge': '⬆',
      'roundabout': '🔄', 'arrive': '📍', 'depart': '🚛'
    };
    const key = modifier ? `${type} ${modifier}` : type;
    const icon = icons[key] || icons[type] || '⬆';
    if (type === 'arrive') return `📍 Arrive${name ? ' at ' + name : ''}`;
    if (type === 'depart') return `🚛 Head ${modifier || ''} ${name ? 'on ' + name : ''}`.trim();
    return `${icon} ${modifier ? modifier.charAt(0).toUpperCase() + modifier.slice(1) : 'Continue'}${name ? ' on ' + name : ''}`;
  }

  private async showResidentMarkers() {
    let waited = 0;
    while (!this.map && waited < 5000) { await new Promise<void>(r => setTimeout(r, 100)); waited += 100; }
    if (!this.map) return;
    this.residentMarkers.forEach(m => m.remove());
    this.residentMarkers = [];

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

    this.dataSvc.getResidents().subscribe(async residents => {
      for (const r of residents) {
        try {
          let lat: number, lng: number;
          if (r.lat != null && r.lng != null) {
            lat = r.lat; lng = r.lng;
          } else {
            if (!r.address) continue;
            const pt = await geoSearch(r.address);
            if (!pt) continue;
            lat = pt.lat; lng = pt.lon;
          }
          const marker = L.marker([lat, lng], { icon: homeIcon })
            .addTo(this.map)
            .bindPopup(`<b>${r.name}</b><br>📍 ${r.address}`);
          this.residentMarkers.push(marker);
        } catch { /* skip */ }
      }
    });
  }

  private startLocationBroadcast(s: Schedule) {
    if (!this.myTruck) return;
    const callback = (lat: number, lng: number) => {
      this.truckSvc.sendLocation(this.myTruck!.id, lat, lng, this.user?.id, s.id);
      this.rerouteFrom([lat, lng]);
    };

    if (Capacitor.isNativePlatform()) {
      // Native app: uses OS background location — works even when app is minimized
      Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
        if (pos) callback(pos.coords.latitude, pos.coords.longitude);
      }).then(id => { this.watchId = id as any; });
    } else {
      // Browser: standard geolocation — works while tab is open
      if (!navigator.geolocation) return;
      if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId as number);
      this.watchId = navigator.geolocation.watchPosition(
        pos => callback(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      ) as any;
    }
  }

  private stopLocationBroadcast() {
    if (this.watchId === null) return;
    if (Capacitor.isNativePlatform()) {
      Geolocation.clearWatch({ id: this.watchId as any });
    } else {
      navigator.geolocation.clearWatch(this.watchId as number);
    }
    this.watchId = null;
  }

  completeCollection() {
    if (!this.scheduleToComplete) return;
    const completedAt = new Date().toISOString();
    const wasSelected = this.selectedSchedule?.id === this.scheduleToComplete.id;
    this.dataSvc.updateSchedule(this.scheduleToComplete.id, { status: 'completed', completedAt }).subscribe(() => {
      this.scheduleToComplete!.status = 'completed';
      this.scheduleToComplete!.completedAt = completedAt;
      this.showCompleteModal = false;
      this.collectionCompleted = true;
      this.scheduleToComplete = null;
      if (wasSelected) {
        this.selectedSchedule = null;
        this.showRouteModal = true;
      }
      this.loadMySchedules();
      setTimeout(() => this.collectionCompleted = false, 4000);
    });
  }

  openChatInbox() { if (this.dragging) return; this.showChat = true; this.unreadCount = 0; setTimeout(() => { const el = document.getElementById('collector-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50); }
  closeChatInbox() { this.showChat = false; }

  sendChatReply(msg: ChatMessage) {
    if (!this.chatInput.trim()) return;
    const reply: ChatMessage = {
      truckId: msg.truckId,
      fromId: this.user?.id || '',
      fromName: this.user?.name || 'Collector',
      toId: msg.fromId,
      message: this.chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    this.truckSvc.sendChat(reply);
    this.chatMessages.push(reply);
    this.chatInput = '';
    setTimeout(() => { const el = document.getElementById('collector-chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
  }

  onDragStart(e: MouseEvent | TouchEvent) {
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!this.chatIconPos) this.chatIconPos = { x: el.left, y: el.top };
    const startX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const startY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    this.dragging = false;
    this.dragOffset = { x: startX - this.chatIconPos.x, y: startY - this.chatIconPos.y };
    const move = (ev: MouseEvent | TouchEvent) => {
      const cx = ev instanceof MouseEvent ? ev.clientX : (ev as TouchEvent).touches[0].clientX;
      const cy = ev instanceof MouseEvent ? ev.clientY : (ev as TouchEvent).touches[0].clientY;
      if (Math.abs(cx - startX) > 4 || Math.abs(cy - startY) > 4) this.dragging = true;
      if (this.dragging) this.chatIconPos = { x: cx - this.dragOffset.x, y: cy - this.dragOffset.y };
    };
    const up = (ev: MouseEvent | TouchEvent) => {
      if (this.dragging) ev.stopImmediatePropagation();
      this.dragging = false;
      window.removeEventListener('mousemove', move as any);
      window.removeEventListener('touchmove', move as any);
      window.removeEventListener('mouseup', up as any);
      window.removeEventListener('touchend', up as any);
    };
    window.addEventListener('mousemove', move as any);
    window.addEventListener('touchmove', move as any, { passive: true });
    window.addEventListener('mouseup', up as any);
    window.addEventListener('touchend', up);
  }

  async installApp() {
    if (this.isIOS) { alert('To install: tap the Share button (□↑) in Safari, then "Add to Home Screen".'); return; }
    if (!this.installPrompt) return;
    this.installPrompt.prompt();
    await this.installPrompt.userChoice;
    this.installPrompt = null;
    (window as any).__installPrompt = null;
  }

  logout() { this.stopLocationBroadcast(); this.auth.logout(); this.router.navigate(['/menro/login']); }

  onPhotosSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.photos.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async openCamera() {
    this.showCamera = true;
    await new Promise(r => setTimeout(r, 50));
    const video = document.getElementById('collector-camera') as HTMLVideoElement;
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = this.stream;
  }

  capturePhoto() {
    const video = document.getElementById('collector-camera') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.photos.push(canvas.toDataURL('image/jpeg', 0.85));
    this.closeCamera();
  }

  closeCamera() { this.stream?.getTracks().forEach(t => t.stop()); this.showCamera = false; }

  removePhoto(i: number) { this.photos.splice(i, 1); }

  submitIssue() {
    const payload = { ...this.issue, photoUrls: this.photos, photoUrl: this.photos[0] || null };
    this.dataSvc.createSegregationIssue(payload).subscribe(created => {
      this.myIssues = [created, ...this.myIssues];
      this.issueSubmitted = true;
      this.issue = { wasteType: this.wasteTypes[0]?.name || '' };
      this.photos = [];
      setTimeout(() => this.issueSubmitted = false, 4000);
    });
  }

  logCollection() {
    this.collectionLog.unshift({ ...this.collection, time: new Date() });
    this.collectionLogged = true;
    this.collection = { wasteType: 'Biodegradable' };
    setTimeout(() => this.collectionLogged = false, 3000);
  }

  ngOnDestroy() {
    this.stopLocationBroadcast();
    this.routeLine?.remove();
    this.cachedAreaWaypoints = [];
    this.cachedResidentPts = [];
    this.lastRoutePos = null;
    this.residentMarkers.forEach(m => m.remove());
    this.sub?.unsubscribe();
    this.truckSvc.disconnect();
    this.map?.remove();
  }
}
