import { geoSearch, geoReverse } from '../../utils/geocode';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  error = ''; success = ''; loading = false;
  showRegMap = false;
  showPw = false;
  showPushPrompt = false;
  pushStatus = '';
  registeredEmail = '';
  private regMap!: L.Map;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef, private http: HttpClient) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      address:  [''],
      lat:      [null],
      lng:      [null]
    });
  }

  toggleRegMap() {
    this.showRegMap = !this.showRegMap;
    if (!this.showRegMap) { this.regMap?.remove(); (this.regMap as any) = null; return; }
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = document.getElementById('reg-map');
      if (!el) return;
      if (this.regMap) { this.regMap.remove(); (this.regMap as any) = null; }
      this.regMap = L.map('reg-map').setView([14.5995, 120.9842], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(this.regMap);
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

  private pendingSuccess = false;

  resolvePrompt() {
    this.showPushPrompt = false;
    if (this.pendingSuccess) {
      this.success = 'Registration submitted! Please wait for admin approval before logging in.';
      this.pendingSuccess = false;
    }
  }

  async enablePush() {
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.pushStatus = '❌ Permission denied. You can enable it later from your browser settings.';
        setTimeout(() => this.resolvePrompt(), 3000);
        return;
      }
    }
    try {
      const keyRes: any = await this.http.get(`${environment.apiUrl}/push/vapid-public-key`).toPromise();
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const padding = '='.repeat((4 - keyRes.key.length % 4) % 4);
        const base64 = (keyRes.key + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        const key = Uint8Array.from([...raw].map((c: string) => c.charCodeAt(0)));
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      }
      await this.http.post(`${environment.apiUrl}/push/subscribe-pending`, {
        email: this.registeredEmail, subscription: sub
      }).toPromise();
      this.pushStatus = '✅ You\'ll be notified when your account is approved!';
    } catch {
      this.pushStatus = '⚠️ Could not save notification preference. Try again after login.';
    }
    setTimeout(() => this.resolvePrompt(), 3000);
  }

  submit() {
    if (this.form.invalid) return;
    this.error = ''; this.loading = true;
    const payload = { ...this.form.value, role: 'resident', status: 'pending' };
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.registeredEmail = this.form.value.email;
        this.form.reset();
        this.showRegMap = false; this.regMap?.remove();
        if ('Notification' in window && Notification.permission !== 'denied') {
          this.pendingSuccess = true;
          this.showPushPrompt = true;
        } else {
          this.success = 'Registration submitted! Please wait for admin approval before logging in.';
        }
      },
      error: (err) => { this.error = err.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
