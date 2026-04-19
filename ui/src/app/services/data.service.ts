import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Schedule, Complaint, SegregationIssue, WasteType } from '../models/models';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = environment.apiUrl;

  private wasteTypes$ = new BehaviorSubject<WasteType[]>([]);
  readonly wasteTypes = this.wasteTypes$.asObservable();
  private complaints$ = new BehaviorSubject<Complaint[]>([]);
  readonly complaints = this.complaints$.asObservable();
  private segregationIssues$ = new BehaviorSubject<SegregationIssue[]>([]);
  readonly segregationIssues = this.segregationIssues$.asObservable();

  complaintsLoaded = false;
  issuesLoaded = false;

  constructor(private http: HttpClient) {
    this.http.get<WasteType[]>(`${this.apiUrl}/waste-types`).subscribe(w => this.wasteTypes$.next(w));
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role === 'admin') {
      this.http.get<Complaint[]>(`${this.apiUrl}/complaints`).subscribe(c => { this.complaintsLoaded = true; this.complaints$.next(c); });
      this.http.get<SegregationIssue[]>(`${this.apiUrl}/segregation`).subscribe(s => { this.issuesLoaded = true; this.segregationIssues$.next(s); });
    }
  }

  getMe() { return this.http.get<any>(`${this.apiUrl}/auth/me`); }
  updateMe(data: any) { return this.http.put<any>(`${this.apiUrl}/auth/me`, data); }
  getResidents() { return this.http.get<{ id: string; name: string; address: string; lat?: number; lng?: number }[]>(`${this.apiUrl}/auth/residents`); }

  getSchedules(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.http.get<Schedule[]>(`${this.apiUrl}/schedules${params}`);
  }
  createSchedule(s: Partial<Schedule>) { return this.http.post<Schedule>(`${this.apiUrl}/schedules`, s); }
  updateSchedule(id: string, s: Partial<Schedule>) { return this.http.put<Schedule>(`${this.apiUrl}/schedules/${id}`, s); }
  deleteSchedule(id: string) { return this.http.delete(`${this.apiUrl}/schedules/${id}`); }

  getComplaints() { return this.complaints; }
  getHttpComplaints() { return this.http.get<Complaint[]>(`${this.apiUrl}/complaints`); }
  seedComplaints(list: Complaint[]) { this.complaintsLoaded = true; this.complaints$.next(list); }
  getMyComplaints() { return this.http.get<Complaint[]>(`${this.apiUrl}/complaints/mine`); }
  createComplaint(c: Partial<Complaint>) {
    return this.http.post<Complaint>(`${this.apiUrl}/complaints`, c).pipe(
      tap(created => this.complaints$.next([...this.complaints$.value, created]))
    );
  }
  updateComplaint(id: string, c: Partial<Complaint>) {
    return this.http.put<Complaint>(`${this.apiUrl}/complaints/${id}`, c).pipe(
      tap(updated => this.complaints$.next(this.complaints$.value.map(x => x.id === id ? updated : x)))
    );
  }

  getSegregationIssues() { return this.segregationIssues; }
  getHttpSegregationIssues() { return this.http.get<SegregationIssue[]>(`${this.apiUrl}/segregation`); }
  seedIssues(list: SegregationIssue[]) { this.issuesLoaded = true; this.segregationIssues$.next(list); }
  getMySegregationIssues() { return this.http.get<SegregationIssue[]>(`${this.apiUrl}/segregation/mine`); }
  createSegregationIssue(s: Partial<SegregationIssue>) { return this.http.post<SegregationIssue>(`${this.apiUrl}/segregation`, s); }
  updateSegregationIssue(id: string, s: Partial<SegregationIssue>) {
    return this.http.put<SegregationIssue>(`${this.apiUrl}/segregation/${id}`, s).pipe(
      tap(updated => this.segregationIssues$.next(this.segregationIssues$.value.map(x => x.id === id ? updated : x)))
    );
  }

  getWasteTypes() { return this.wasteTypes; }
  getSettings() { return this.http.get<Record<string, string>>(`${this.apiUrl}/settings`); }
  updateSettings(s: Record<string, string | number>) { return this.http.put<{ ok: boolean }>(`${this.apiUrl}/settings`, s); }
  createWasteType(w: Partial<WasteType>) {
    return this.http.post<WasteType>(`${this.apiUrl}/waste-types`, w).pipe(
      tap(created => this.wasteTypes$.next([...this.wasteTypes$.value, created]))
    );
  }
  updateWasteType(id: string, w: Partial<WasteType>) {
    return this.http.put<WasteType>(`${this.apiUrl}/waste-types/${id}`, w).pipe(
      tap(updated => this.wasteTypes$.next(this.wasteTypes$.value.map(x => x.id === id ? updated : x)))
    );
  }
  deleteWasteType(id: string) {
    return this.http.delete(`${this.apiUrl}/waste-types/${id}`).pipe(
      tap(() => this.wasteTypes$.next(this.wasteTypes$.value.filter(x => x.id !== id)))
    );
  }
}
