import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { geoSearch, geoReverse } from '../../utils/geocode';
import { FEATURES } from '../../features';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { TruckService, ChatMessage } from '../../services/truck.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from '../../services/push.service';
import { NotificationService, ResidentNotification } from '../../services/notification.service';
import { Truck, Schedule, Complaint, WasteType } from '../../models/models';
import { Subscription } from 'rxjs';

const RESIDENT_HOME_DEFAULT: [number, number] = [14.6005, 120.9855];
const ALERT_DISTANCE_KM = 1;

@Component({
  selector: 'app-resident-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './resident-portal.component.html',
  styleUrls: ['./resident-portal.component.scss']
})
export class ResidentPortalComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly features = FEATURES;
  activeTab = 'map';
  trucks: Truck[] = [];
  schedules: Schedule[] = [];
  inProgressTruckIds = new Set<string>();
  myComplaints: Complaint[] = [];
  nearbyTruck: Truck | null = null;
  complaintSubmitted = false;
  newComplaint: Partial<Complaint> = { type: 'missed-collection' };
  photos: string[] = [];
  selectedPhoto: string | null = null;
  showCamera = false;
  private stream!: MediaStream;
  user: any = null;
  private homeCoords: [number, number] = RESIDENT_HOME_DEFAULT;
  locationError = false;
  pushEnabled = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  installPrompt: any = (window as any).__installPrompt ?? null;
  isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !(window.navigator as any).standalone;
  chatTruck: Truck | null = null;
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  showNotifications = false;
  notifications: ResidentNotification[] = [];
  unreadCount = 0;
  mapLoading = false;
  wasteTypes: WasteType[] = [];
  showWasteHint = false;
  get activeWasteType(): WasteType | null {
    const schedule = this.nearbyTruck
      ? this.schedules.find(s => s.truckId === this.nearbyTruck!.id && s.status === 'in-progress')
      : this.schedules.find(s => s.status === 'in-progress');
    if (!schedule) return null;
    return this.wasteTypes.find(w => w.name === schedule.wasteType) ?? null;
  }
  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private homeMarker!: L.Marker;
  private sub!: Subscription;

  constructor(private truckSvc: TruckService, private dataSvc: DataService, private auth: AuthService, private router: Router, private push: PushService, private notifSvc: NotificationService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.user = this.auth.getStoredUser();
  }

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      (window as any).__installPrompt = e;
    });
    document.title = 'Resident View';
    this.truckSvc.connectWebSocket();
    this.truckSvc._currentUserId = this.user?.id || '';
    (window as any).__openChat = (truckId: string) => {
      const truck = this.trucks.find(t => t.id === truckId);
      if (truck) { this.map.closePopup(); this.openChat(truck); }
    };
    this.truckSvc.chat$.subscribe(msg => {
      if (this.chatTruck && msg.truckId === this.chatTruck.id) {
        this.chatMessages.push(msg);
        setTimeout(() => { const el = document.getElementById('chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
      }
    });
    this.sub = this.truckSvc.trucks$.subscribe(trucks => {
      this.trucks = trucks;
      this.dataSvc.getSchedules().subscribe(s => {
        this.schedules = s.filter(x => x.status !== 'completed');
        this.inProgressTruckIds = new Set(this.schedules.filter(x => x.status === 'in-progress').map(x => x.truckId));
        this.updateMarkers();
      });
      this.checkProximity();
    });
    this.truckSvc.scheduleUpdate$.subscribe(schedule => {
      const idx = this.schedules.findIndex(s => s.id === schedule.id);
      if (schedule.status === 'completed') {
        this.schedules = this.schedules.filter(s => s.id !== schedule.id);
      } else if (idx !== -1) {
        this.schedules[idx] = schedule;
      } else {
        this.schedules.push(schedule);
      }
      this.inProgressTruckIds = new Set(this.schedules.filter(x => x.status === 'in-progress').map(x => x.truckId));
      // Clear route cache for this truck so it redraws
      this.routeLines.get(schedule.truckId)?.remove();
      this.routeLines.delete(schedule.truckId);
      this.areaWaypoints.delete(schedule.id);
      this.drawnSchedule.delete(schedule.truckId);
      this.lastRoutePos.delete(schedule.truckId);
      this.updateMarkers();
    });
    this.dataSvc.getMyComplaints().subscribe(c => this.myComplaints = c);
    this.dataSvc.getWasteTypes().subscribe(w => this.wasteTypes = w);

    this.notifSvc.notifications$.subscribe(n => {
      this.notifications = n;
      this.unreadCount = this.notifSvc.unreadCount;
    });
    this.truckSvc.scheduleCancelled$.subscribe(schedule => {
      this.notifSvc.add({
        type: 'schedule_cancelled',
        title: 'Schedule Cancelled',
        message: `Collection for ${schedule.routeId} (${schedule.wasteType}) on ${schedule.date} has been cancelled.`,
        timestamp: new Date().toISOString()
      });
    });
  }

  ngAfterViewInit() {
    const initWithCoords = (coords: [number, number]) => {
      this.homeCoords = coords;
      this.coordsResolved = true;
      this.checkProximity();
      setTimeout(() => this.initMap(), 300);
    };
    const geocodeAddress = (address: string) => {
      geoSearch(address)
        .then(pt => {
          if (pt) initWithCoords([pt.lat, pt.lon]);
          else initWithCoords(RESIDENT_HOME_DEFAULT);
        })
        .catch(() => initWithCoords(RESIDENT_HOME_DEFAULT));
    };
    this.dataSvc.getMe().subscribe({
      next: u => {
        this.user = { ...this.user, ...u };
        if (u.lat != null && u.lng != null) initWithCoords([u.lat, u.lng]);
        else if (u.address) geocodeAddress(u.address);
        else initWithCoords(RESIDENT_HOME_DEFAULT);
      },
      error: () => {
        const address = this.user?.address;
        if (address) geocodeAddress(address);
        else initWithCoords(RESIDENT_HOME_DEFAULT);
      }
    });
  }

  initMap() {
    this.mapLoading = true;
    this.map = L.map('resident-map').setView(this.homeCoords, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    this.map.once('load', () => this.mapLoading = false);
    setTimeout(() => { this.map?.invalidateSize(); this.mapLoading = false; }, 500); // fallback

    // Home marker
    const homeIcon = L.divIcon({ html: '<div style="font-size:32px;line-height:1">🏠</div>', className: 'leaflet-div-icon-clean', iconAnchor: [16, 16] });
    this.homeMarker = L.marker(this.homeCoords, { icon: homeIcon })
      .addTo(this.map)
      .bindPopup('<b>Your Home</b>');

    // 1km radius circle (FR-4)
    L.circle(this.homeCoords, { radius: 1000, color: '#2d6a4f', fillOpacity: 0.05, dashArray: '5,5' }).addTo(this.map);
    this.updateMarkers();
  }

  private routeLines = new Map<string, L.Polyline>();
  private areaWaypoints = new Map<string, [number, number][]>();
  private drawnSchedule = new Map<string, string>(); // truckId -> scheduleId
  private lastRoutePos = new Map<string, [number, number]>(); // truckId -> last rerouted pos
  private cachedResidentPts: [number, number][] = [];

  updateMarkers() {
    if (!this.map) return;
    this.trucks.forEach(truck => {
      if (truck.lat == null || truck.lng == null) return;
      const nearby = this.isNearby(truck);
      const color = nearby ? '#e53e3e' : '#2d6a4f';
      const icon = L.divIcon({
        html: `<div style="position:relative;width:40px;height:48px">
          <div style="width:40px;height:40px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center">
            <span style="transform:rotate(45deg);font-size:18px">🚛</span>
          </div>
        </div>`,
        className: 'leaflet-div-icon-clean',
        iconAnchor: [20, 48],
        popupAnchor: [0, -50]
      });
      if (this.markers.has(truck.id)) {
        this.markers.get(truck.id)!.setLatLng([truck.lat, truck.lng]).setIcon(icon);
      } else {
        const marker = L.marker([truck.lat, truck.lng], { icon })
          .addTo(this.map)
          .bindPopup(`<b>${truck.plateNumber}</b><br>♻️ ${truck.wasteType}<br>📍 ${truck.route}<br><button onclick="window.__openChat('${truck.id}')" style="margin-top:6px;background:#1565c0;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">💬 Chat</button>`);
        this.markers.set(truck.id, marker);
      }
      if (truck.status === 'active') this.drawRoute(truck);
    });
  }

  async drawRoute(truck: Truck) {
    const schedule = this.schedules.find(s => s.truckId === truck.id && s.status === 'in-progress');
    if (!schedule?.areas?.length) return;
    if (!truck.lat || !truck.lng || Math.abs(truck.lat) < 1 || Math.abs(truck.lng) < 1) return;

    if (this.drawnSchedule.get(truck.id) !== schedule.id) {
      this.routeLines.get(truck.id)?.remove();
      this.routeLines.delete(truck.id);
      this.areaWaypoints.delete(schedule.id);
      this.drawnSchedule.set(truck.id, schedule.id);
      this.lastRoutePos.delete(truck.id);
    }

    // Throttle: only reroute if truck moved >50m
    const last = this.lastRoutePos.get(truck.id);
    if (last) {
      const R = 6371000;
      const dLat = (truck.lat - last[0]) * Math.PI / 180;
      const dLng = (truck.lng - last[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(last[0]*Math.PI/180)*Math.cos(truck.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      if (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) < 50) return;
    }
    this.lastRoutePos.set(truck.id, [truck.lat, truck.lng]);

    try {
      // Geocode areas once per schedule
      if (!this.areaWaypoints.has(schedule.id)) {
        const pts: [number, number][] = [];
        for (const area of schedule.areas) {
          const pt = await geoSearch(area + ', Philippines'); if (pt) pts.push([pt.lat, pt.lon]);
        }
        if (!pts.length) return;
        this.areaWaypoints.set(schedule.id, pts);
      }

      // Geocode residents once
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
        const dLat = (lat - truck.lat) * Math.PI / 180;
        const dLng = (lng - truck.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(truck.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= 1;
      });

      const areaPoints = this.areaWaypoints.get(schedule.id)!;
      const waypoints: [number, number][] = [[truck.lat, truck.lng], ...nearbyResidents, ...areaPoints];
      const coords = waypoints.map(w => `${w[1]},${w[0]}`).join(';');
      const osrm = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const osrmData = await osrm.json();
      if (osrmData.code !== 'Ok') return;
      const line: [number, number][] = osrmData.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      if (this.routeLines.has(truck.id)) {
        this.routeLines.get(truck.id)!.setLatLngs(line);
      } else {
        this.routeLines.set(truck.id, L.polyline(line, { color: '#1565c0', weight: 4, opacity: 0.7, dashArray: '8,4' }).addTo(this.map));
      }
    } catch { /* silently skip if routing fails */ }
  }

  getTruck(truckId: string) { return this.trucks.find(t => t.id === truckId) || null; }

  isNearby(truck: Truck): boolean {
    if (truck.lat == null || truck.lng == null) return false;
    const R = 6371;
    const dLat = (truck.lat - this.homeCoords[0]) * Math.PI / 180;
    const dLng = (truck.lng - this.homeCoords[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(this.homeCoords[0]*Math.PI/180) * Math.cos(truck.lat*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= ALERT_DISTANCE_KM;
  }

  private lastNearbyTruckId: string | null = null;
  private coordsResolved = false;

  checkProximity() {
    // Don't check until real coords are resolved
    if (!this.coordsResolved) return;
    const found = this.trucks.find(t => t.status === 'active' && this.isNearby(t)) || null;
    this.nearbyTruck = found;
    // Reset so re-entry fires again
    if (!found) { this.lastNearbyTruckId = null; return; }
    if (found.id === this.lastNearbyTruckId) return;
    this.lastNearbyTruckId = found.id;
    if (Notification.permission === 'granted') {
      new Notification('🚛 Truck Nearby!', {
        body: `Truck ${found.plateNumber} (${found.wasteType}) is within 1km of your location.`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
    this.notifSvc.add({
      type: 'truck_nearby',
      title: '🚛 Truck Nearby!',
      message: `Truck ${found.plateNumber} (${found.wasteType}) is within 1km of your location.`,
      timestamp: new Date().toISOString()
    });
  }

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
    await new Promise(r => setTimeout(r, 50)); // let DOM render
    const video = document.getElementById('camera-preview') as HTMLVideoElement;
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = this.stream;
  }

  capturePhoto() {
    const video = document.getElementById('camera-preview') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.photos.push(canvas.toDataURL('image/jpeg', 0.85));
    this.closeCamera();
  }

  closeCamera() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.showCamera = false;
  }

  removePhoto(i: number) { this.photos.splice(i, 1); }

  submitComplaint() {
    const payload = { ...this.newComplaint, photoUrls: this.photos };
    this.dataSvc.createComplaint(payload).subscribe(c => {
      this.myComplaints.unshift(c);
      this.complaintSubmitted = true;
      this.newComplaint = { type: 'missed-collection' };
      this.photos = [];
      setTimeout(() => this.complaintSubmitted = false, 4000);
    });
  }

  refreshMap() {
    if (!this.map) return;
    this.mapLoading = true;
    this.markers.forEach(m => m.remove());
    this.markers.clear();
    this.routeLines.forEach(l => l.remove());
    this.routeLines.clear();
    this.areaWaypoints.clear();
    this.drawnSchedule.clear();
    this.lastRoutePos.clear();
    this.cachedResidentPts = [];
    this.map.setView(this.homeCoords, 15);
    this.updateMarkers();
    setTimeout(() => this.mapLoading = false, 2000);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => {
        this.map?.invalidateSize();
        if (!this.map) this.initMap();
      }, 150);
    }
  }

  async enablePush() {
    const permission = await Notification.requestPermission();
    this.pushEnabled = permission === 'granted';
    if (this.pushEnabled) {
      this.push.subscribe(this.homeCoords[0], this.homeCoords[1]);
    }
  }

  async installApp() {
    if (this.isIOS) {
      alert('To install: tap the Share button (□↑) in Safari, then "Add to Home Screen".');
      return;
    }
    if (!this.installPrompt) return;
    this.installPrompt.prompt();
    await this.installPrompt.userChoice;
    this.installPrompt = null;
    (window as any).__installPrompt = null;
  }

  openChat(truck: Truck) { this.chatTruck = truck; this.chatMessages = []; }
  closeChat() { this.chatTruck = null; this.chatMessages = []; this.chatInput = ''; }

  openNotifications() {
    if (!this.pushEnabled) this.enablePush();
    this.showNotifications = true;
    this.notifSvc.markAllRead();
    this.unreadCount = 0;
  }
  closeNotifications() { this.showNotifications = false; }
  clearNotifications() { this.notifSvc.clear(); }

  sendChatMessage() {
    if (!this.chatInput.trim() || !this.chatTruck) return;
    const truck = this.chatTruck;
    const schedule = this.schedules.find(s => s.truckId === truck.id && s.status === 'in-progress');
    const toId = (truck as any).collectorId || '';
    const msg: ChatMessage = {
      truckId: truck.id,
      fromId: this.user?.id || '',
      fromName: this.user?.name || 'Resident',
      toId,
      message: this.chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    this.truckSvc.sendChat(msg);
    this.chatMessages.push(msg);
    this.chatInput = '';
    setTimeout(() => { const el = document.getElementById('chat-messages'); if (el) el.scrollTop = el.scrollHeight; }, 50);
  }

  showAccountMenu = false;
  toggleAccountMenu() { this.showAccountMenu = !this.showAccountMenu; }
  closeAccountMenu() { this.showAccountMenu = false; }

  showProfile = false;
  profileForm!: FormGroup;
  profileError = '';
  profileSuccess = '';
  profileLoading = false;
  showProfileMap = false;
  showProfilePw = false;
  private profileMap!: L.Map;

  openProfile() {
    this.closeAccountMenu();
    this.profileError = ''; this.profileSuccess = ''; this.showProfileMap = false;
    this.profileForm = this.fb.group({
      name:     [this.user?.name || '', Validators.required],
      email:    [this.user?.email || '', [Validators.required, Validators.email]],
      password: [''],
      address:  [this.user?.address || ''],
      lat:      [this.user?.lat ?? null],
      lng:      [this.user?.lng ?? null]
    });
    this.showProfile = true;
  }
  closeProfile() { this.showProfile = false; this.showProfileMap = false; this.profileMap?.remove(); (this.profileMap as any) = null; }

  toggleProfileMap() {
    this.showProfileMap = !this.showProfileMap;
    if (!this.showProfileMap) { this.profileMap?.remove(); (this.profileMap as any) = null; return; }
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = document.getElementById('profile-map');
      if (!el) return;
      if (this.profileMap) { this.profileMap.remove(); (this.profileMap as any) = null; }
      const lat = this.profileForm.value.lat || this.homeCoords[0];
      const lng = this.profileForm.value.lng || this.homeCoords[1];
      this.profileMap = L.map('profile-map').setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.profileMap);
      if (this.profileForm.value.lat) {
        L.marker([lat, lng]).addTo(this.profileMap).bindPopup(this.profileForm.value.address || 'Your location').openPopup();
      }
      this.profileMap.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        try {
          const address = await geoReverse(lat, lng);
          this.profileForm.patchValue({ address: address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
        } catch {
          this.profileForm.patchValue({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
        }
        this.profileMap.eachLayer(l => { if ((l as any)._latlng) this.profileMap.removeLayer(l); });
        L.marker([lat, lng]).addTo(this.profileMap).bindPopup(this.profileForm.value.address).openPopup();
        this.cdr.detectChanges();
      });
    }, 50);
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.profileError = ''; this.profileSuccess = ''; this.profileLoading = true;
    const payload: any = { ...this.profileForm.value };
    if (!payload.password) delete payload.password;
    this.dataSvc.updateMe(payload).subscribe({
      next: u => {
        this.user = { ...this.user, ...u };
        this.profileSuccess = 'Profile updated successfully.';
        this.profileLoading = false;
        this.profileForm.patchValue({ password: '' });
      },
      error: err => { this.profileError = err.error?.message || 'Failed to update profile.'; this.profileLoading = false; }
    });
  }

  logout() { this.auth.logout(); this.router.navigate(['/menro/login']); }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.truckSvc.disconnect();
    this.routeLines.forEach(l => l.remove());
    this.map?.remove();
  }
}
