import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { DataService } from '../../../services/data.service';
import { TruckService } from '../../../services/truck.service';
import { PushService } from '../../../services/push.service';
import { geoReverse, geoReverseRaw } from '../../../utils/geocode';
import { Schedule, Truck, WasteType } from '../../../models/models';
import { Observable } from 'rxjs';
import { sortData } from '../../../shared/sort.util';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @Input() trucks: Truck[] = [];

  schedules: Schedule[] = [];
  loading = true;
  search = '';
  sortCol = 'date'; sortDir: 'asc' | 'desc' = 'desc';
  page = 1; pageSize = 10;
  setSort(col: string) { this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc'; this.sortCol = col; this.page = 1; }
  get filtered() {
    const q = this.search.toLowerCase();
    const list = this.schedules.filter(s =>
      s.routeId?.toLowerCase().includes(q) || s.wasteType?.toLowerCase().includes(q) ||
      s.date?.includes(q) || s.status?.toLowerCase().includes(q) ||
      s.areas?.join(' ').toLowerCase().includes(q) || this.getTruckLabel(s.truckId).toLowerCase().includes(q)
    );
    return sortData(list, this.sortCol, this.sortDir);
  }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged() { const s = (this.page - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); }
  wasteTypes$: Observable<WasteType[]>;
  showForm = false;
  showMap = false;
  editingSchedule: Schedule | null = null;
  cancelTarget: Schedule | null = null;
  selectedAreas: string[] = [];
  form: FormGroup;

  private scheduleMap!: L.Map;
  private areaMarkers: L.Marker[] = [];

  constructor(private dataSvc: DataService, private truckSvc: TruckService, private push: PushService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.wasteTypes$ = this.dataSvc.getWasteTypes();
    this.form = this.fb.group({
      routeId:   ['', Validators.required],
      wasteType: ['', Validators.required],
      truckId:   ['', Validators.required],
      date:      ['', Validators.required],
      timeFrom:  ['', Validators.required],
      timeTo:    ['', Validators.required],
      areasInput:['', Validators.required]
    });
  }

  ngOnInit() { this.dataSvc.getSchedules().subscribe(s => { this.schedules = s; this.loading = false; }); }

  getTruckLabel(truckId?: string) {
    const t = this.trucks.find(t => t.id === truckId);
    return t ? `${t.plateNumber} — ${t.route}` : (truckId || '—');
  }

  openForm() {
    this.showForm = true; this.showMap = false; this.editingSchedule = null;
    this.selectedAreas = []; this.form.reset();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        try {
          const data = await geoReverseRaw(pos.coords.latitude, pos.coords.longitude);
          const label = data?.address?.suburb || data?.address?.village || data?.address?.neighbourhood
            || data?.address?.city_district || data?.display_name?.split(',')[0];
          if (label) {
            this.selectedAreas = [label];
            this.form.patchValue({ areasInput: label });
            this.cdr.detectChanges();
          }
        } catch { /* silently skip */ }
      }, () => {});
    }
  }

  editSchedule(s: Schedule) {
    this.showForm = true; this.showMap = false; this.editingSchedule = s;
    this.selectedAreas = [...s.areas];
    const [timeFrom, timeTo] = s.timeSlot?.split('-') ?? ['', ''];
    this.form.setValue({ routeId: s.routeId, wasteType: s.wasteType, truckId: s.truckId,
      date: s.date, timeFrom, timeTo, areasInput: s.areas.join(', ') });
  }

  cancelForm() {
    this.showForm = false; this.showMap = false;
    this.scheduleMap?.remove(); this.scheduleMap = null!; this.areaMarkers = [];
  }

  toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap) { this.cdr.detectChanges(); setTimeout(() => this.initMap(), 50); }
    else { this.scheduleMap?.remove(); this.scheduleMap = null!; this.areaMarkers = []; }
  }

  private initMap() {
    if (this.scheduleMap) { this.scheduleMap.remove(); this.scheduleMap = null!; }
    const el = document.getElementById('schedule-map');
    if (!el) return;
    this.scheduleMap = L.map(el).setView([14.5995, 120.9842], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.scheduleMap);
    navigator.geolocation?.getCurrentPosition(
      pos => this.scheduleMap?.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
    this.scheduleMap.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
    this.areaMarkers = this.selectedAreas.map((label, i) => {
      const existing = this.areaMarkers[i];
      if (!existing) return null as any;
      return L.marker(existing.getLatLng()).addTo(this.scheduleMap).bindPopup(label);
    }).filter(Boolean);
  }

  async onMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;
    try {
      const data = await geoReverseRaw(lat, lng);
      const label = data?.address?.suburb || data?.address?.village || data?.address?.neighbourhood
        || data?.address?.city_district || data?.display_name?.split(',')[0];
      if (!this.selectedAreas.includes(label)) {
        this.selectedAreas.push(label);
        this.form.patchValue({ areasInput: this.selectedAreas.join(', ') });
        this.areaMarkers.push(L.marker([lat, lng]).addTo(this.scheduleMap).bindPopup(label).openPopup());
      }
    } catch {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      this.selectedAreas.push(fallback);
      this.form.patchValue({ areasInput: this.selectedAreas.join(', ') });
    }
  }

  removeArea(i: number) {
    this.selectedAreas.splice(i, 1);
    this.areaMarkers.splice(i, 1)[0]?.remove();
    this.form.patchValue({ areasInput: this.selectedAreas.join(', ') });
  }

  syncAreasFromInput() {
    this.selectedAreas = (this.form.value.areasInput || '').split(',').map((a: string) => a.trim()).filter(Boolean);
  }

  saveSchedule() {
    if (this.form.invalid) return;
    const { routeId, wasteType, truckId, date, timeFrom, timeTo, areasInput } = this.form.value;
    const areas = this.selectedAreas.length ? this.selectedAreas : areasInput.split(',').map((a: string) => a.trim()).filter(Boolean);
    const payload = { routeId, wasteType, truckId, date, timeSlot: `${timeFrom}-${timeTo}`, areas };
    const reset = () => { this.showForm = false; this.showMap = false; this.editingSchedule = null;
      this.selectedAreas = []; this.form.reset(); this.scheduleMap?.remove(); this.scheduleMap = null!; this.areaMarkers = []; };
    if (this.editingSchedule) {
      this.dataSvc.updateSchedule(this.editingSchedule.id, payload).subscribe(updated => {
        const idx = this.schedules.findIndex(s => s.id === updated.id);
        if (idx !== -1) this.schedules[idx] = updated;
        reset();
      });
    } else {
      this.dataSvc.createSchedule(payload).subscribe(s => { this.schedules.push(s); reset(); });
    }
  }

  updateStatus(id: string, status: string) {
    this.dataSvc.updateSchedule(id, { status: status as any }).subscribe(updated => {
      const idx = this.schedules.findIndex(s => s.id === id);
      if (idx !== -1) this.schedules[idx] = updated;
    });
  }

  openCancelModal(s: Schedule) { this.cancelTarget = s; }

  confirmCancel(notify: boolean) {
    if (!this.cancelTarget) return;
    const s = this.cancelTarget;
    this.cancelTarget = null;
    this.dataSvc.updateSchedule(s.id, { status: 'cancelled' as any }).subscribe(updated => {
      const idx = this.schedules.findIndex(x => x.id === s.id);
      if (idx !== -1) this.schedules[idx] = updated;
      if (notify) {
        this.truckSvc.broadcastScheduleCancelled(updated);
        this.push.broadcastCancellation(updated).subscribe();
      }
    });
  }

  deleteSchedule(id: string) {
    this.dataSvc.deleteSchedule(id).subscribe(() => { this.schedules = this.schedules.filter(s => s.id !== id); });
  }
}
