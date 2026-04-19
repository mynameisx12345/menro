import { geoSearch, geoReverse } from '../../../utils/geocode';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { sortData } from '../../../shared/sort.util';
import { Truck } from '../../../models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @Input() trucks: Truck[] = [];

  usersList: any[] = [];
  search = '';
  pendingOnly = false;
  sortCol = ''; sortDir: 'asc' | 'desc' = 'asc';
  page = 1; pageSize = 10;
  setSort(col: string) { this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc'; this.sortCol = col; this.page = 1; }
  get filtered() {
    const q = this.search.toLowerCase();
    const list = this.usersList.filter(u =>
      (!this.pendingOnly || u.status === 'pending') &&
      (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) || u.address?.toLowerCase().includes(q))
    );
    return sortData(list, this.sortCol, this.sortDir);
  }
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged() { const s = (this.page - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); }
  showForm = false;
  editingUser: any = null;
  error = ''; success = ''; loading = false;
  loadingUsers = true;
  showRegMap = false;
  showPw = false;
  form: FormGroup;
  private regMap!: L.Map;

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef, private fb: FormBuilder, private confirm: ConfirmDialogService) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role:     ['', Validators.required],
      truckId:  [''],
      address:  [''],
      lat:      [null],
      lng:      [null],
      status:   ['approved'],
      isDisabled: [false]
    });
  }

  ngOnInit() { this.loadUsers(); }

  loadUsers() { this.auth.getUsers().subscribe(users => { this.usersList = users; this.loadingUsers = false; }); }

  openForm() {
    this.showForm = true; this.editingUser = null; this.error = ''; this.success = '';
    this.form.reset();
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
  }

  editUser(u: any) {
    this.showForm = true; this.editingUser = u; this.error = ''; this.success = '';
    this.form.patchValue({ name: u.name, email: u.email, password: '', role: u.role, truckId: u.truckId || '', address: u.address || '', lat: u.lat ?? null, lng: u.lng ?? null, status: u.status || 'approved', isDisabled: !!u.disabled });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
  }

  cancelForm() {
    this.showForm = false; this.editingUser = null; this.form.reset();
    this.showRegMap = false; this.regMap?.remove();
  }

  onRoleChange(role: string) {
    this.form.patchValue({ role, truckId: '', address: '' });
    if (this.showRegMap) { this.showRegMap = false; this.regMap?.remove(); }
  }

  toggleRegMap() {
    this.showRegMap = !this.showRegMap;
    if (!this.showRegMap) { this.regMap?.remove(); (this.regMap as any) = null; return; }
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = document.getElementById('reg-map');
      if (!el) return;
      if (this.regMap) { this.regMap.remove(); (this.regMap as any) = null; }
      // Init at default first so map renders immediately
      this.regMap = L.map('reg-map').setView([14.5995, 120.9842], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.regMap);
      // Then pan to GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => { this.regMap.setView([pos.coords.latitude, pos.coords.longitude], 16); },
          () => {},
          { timeout: 6000, enableHighAccuracy: true }
        );
      }
      this.regMap.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        try {
          const address = await geoReverse(lat, lng);
          this.form.patchValue({ address: address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
        } catch {
          this.form.patchValue({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
        }
        this.regMap.eachLayer(l => { if ((l as any)._latlng) this.regMap.removeLayer(l); });
        L.marker([lat, lng]).addTo(this.regMap).bindPopup(this.form.value.address).openPopup();
        this.cdr.detectChanges();
      });
    }, 50);
  }

  getTruckLabel(truckId?: string) {
    const t = this.trucks.find(t => t.id === truckId);
    return t ? `${t.plateNumber} — ${t.route}` : '—';
  }

  approveUser(u: any) {
    this.auth.updateUser(u.id, { status: 'approved' }).subscribe(() => {
      u.status = 'approved';
    });
  }

  async deleteUser(id: string) {
    const ok = await this.confirm.confirm({ title: 'Delete User', message: 'This user will be removed and can no longer log in. Continue?', confirmText: 'Delete', dangerMode: true });
    if (!ok) return;
    this.auth.deleteUser(id).subscribe(() => { this.usersList = this.usersList.filter(u => u.id !== id); });
  }

  save() {
    if (this.form.invalid) return;
    this.error = ''; this.success = ''; this.loading = true;
    const payload: any = { ...this.form.value, disabled: this.form.value.isDisabled };
    delete payload.isDisabled;
    if (payload.role !== 'collector') delete payload.truckId;
    if (payload.role !== 'resident') { delete payload.address; delete payload.lat; delete payload.lng; delete payload.status; }
    if (!payload.password) delete payload.password;

    const done = (name: string, role: string) => {
      this.success = `User "${name}" saved as ${role}.`;
      this.loading = false; this.showForm = false; this.editingUser = null;
      this.form.reset(); this.showRegMap = false; this.regMap?.remove();
      this.loadUsers();
    };
    const fail = (err: any) => { this.error = err.error?.message || 'Failed'; this.loading = false; };

    if (this.editingUser) {
      this.auth.updateUser(this.editingUser.id, payload).subscribe({ next: u => done(u.name, u.role), error: fail });
    } else {
      this.auth.register(payload).subscribe({ next: u => done(u.name, u.role), error: fail });
    }
  }
}
