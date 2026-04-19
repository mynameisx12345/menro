import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { Truck, Schedule } from '../../../models/models';

interface NoSignalEvent {
  truckId: string;
  plateNumber: string;
  collectorName: string;
  wasteType: string;
  scheduleDate: string;
  detectedAt: Date;
  durationMinutes: number;
}

interface TruckSummary {
  truckId: string;
  plateNumber: string;
  collectorName: string;
  wasteType: string;
  totalEvents: number;
  totalDurationMinutes: number;
  daysWithNoSignal: number;
  events: NoSignalEvent[];
}

@Component({
  selector: 'app-no-signal-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './no-signal-report.component.html',
  styleUrls: ['./no-signal-report.component.scss']
})
export class NoSignalReportComponent implements OnInit, OnChanges {
  @Input() trucks: Truck[] = [];

  viewMode: 'weekly' | 'monthly' | 'yearly' = 'weekly';
  loading = true;

  private schedules: Schedule[] = [];
  private noSignalThresholdMs = 15 * 60 * 1000;

  // Computed report data
  truckSummaries: TruckSummary[] = [];
  totalNoSignalEvents = 0;
  totalAffectedTrucks = 0;
  mostAffectedTruck: TruckSummary | null = null;

  // Chart data: label -> count of events
  chartData: { label: string; count: number; durationMin: number }[] = [];

  constructor(private dataSvc: DataService) {}

  ngOnInit() {
    this.dataSvc.getSettings().subscribe(s => {
      if (s['noSignalThresholdMinutes']) this.noSignalThresholdMs = +s['noSignalThresholdMinutes'] * 60 * 1000;
    });
    this.dataSvc.getSchedules().subscribe(schedules => {
      this.schedules = schedules;
      this.buildReport();
      this.loading = false;
    });
  }

  ngOnChanges() {
    if (this.schedules.length) this.buildReport();
  }

  setView(mode: 'weekly' | 'monthly' | 'yearly') {
    this.viewMode = mode;
    this.buildReport();
  }

  private buildReport() {
    const now = new Date();
    const rangeStart = this.getRangeStart(now);

    // Simulate no-signal events from trucks with lastUpdated older than threshold
    // during in-progress schedules within the selected range
    const events: NoSignalEvent[] = [];

    const relevantSchedules = this.schedules.filter(s => {
      const d = new Date(s.date);
      return d >= rangeStart && d <= now;
    });

    for (const schedule of relevantSchedules) {
      const truck = this.trucks.find(t => t.id === schedule.truckId);
      if (!truck) continue;

      // A truck is considered no-signal if it went offline or had no movement
      // while the schedule was in-progress
      const isNoSignal = this.wasNoSignalDuringSchedule(truck, schedule);
      if (!isNoSignal) continue;

      const last = truck.lastUpdated ? new Date(truck.lastUpdated).getTime() : 0;
      const durationMs = last ? Date.now() - last : this.noSignalThresholdMs;

      events.push({
        truckId: truck.id,
        plateNumber: truck.plateNumber,
        collectorName: truck.collectorName,
        wasteType: truck.wasteType,
        scheduleDate: schedule.date,
        detectedAt: truck.lastUpdated ? new Date(truck.lastUpdated) : new Date(schedule.date),
        durationMinutes: Math.round(durationMs / 60000)
      });
    }

    // Build per-truck summaries
    const summaryMap = new Map<string, TruckSummary>();
    for (const ev of events) {
      if (!summaryMap.has(ev.truckId)) {
        summaryMap.set(ev.truckId, {
          truckId: ev.truckId,
          plateNumber: ev.plateNumber,
          collectorName: ev.collectorName,
          wasteType: ev.wasteType,
          totalEvents: 0,
          totalDurationMinutes: 0,
          daysWithNoSignal: 0,
          events: []
        });
      }
      const s = summaryMap.get(ev.truckId)!;
      s.totalEvents++;
      s.totalDurationMinutes += ev.durationMinutes;
      s.events.push(ev);
    }

    // Count unique days per truck
    summaryMap.forEach(s => {
      const days = new Set(s.events.map(e => e.scheduleDate));
      s.daysWithNoSignal = days.size;
    });

    this.truckSummaries = Array.from(summaryMap.values()).sort((a, b) => b.totalEvents - a.totalEvents);
    this.totalNoSignalEvents = events.length;
    this.totalAffectedTrucks = summaryMap.size;
    this.mostAffectedTruck = this.truckSummaries[0] || null;

    this.buildChartData(events, rangeStart, now);
  }

  private wasNoSignalDuringSchedule(truck: Truck, schedule: Schedule): boolean {
    if (schedule.status !== 'in-progress' && schedule.status !== 'completed') return false;
    const last = truck.lastUpdated ? new Date(truck.lastUpdated).getTime() : 0;
    return Date.now() - last > this.noSignalThresholdMs;
  }

  private getRangeStart(now: Date): Date {
    const d = new Date(now);
    if (this.viewMode === 'weekly') {
      d.setDate(d.getDate() - 6);
    } else if (this.viewMode === 'monthly') {
      d.setDate(1);
    } else {
      d.setMonth(0, 1);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private buildChartData(events: NoSignalEvent[], rangeStart: Date, now: Date) {
    const buckets = new Map<string, { count: number; durationMin: number }>();

    if (this.viewMode === 'weekly') {
      // One bucket per day (last 7 days)
      for (let i = 0; i < 7; i++) {
        const d = new Date(rangeStart);
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        buckets.set(key, { count: 0, durationMin: 0 });
      }
      for (const ev of events) {
        const key = new Date(ev.scheduleDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (buckets.has(key)) {
          buckets.get(key)!.count++;
          buckets.get(key)!.durationMin += ev.durationMinutes;
        }
      }
    } else if (this.viewMode === 'monthly') {
      // One bucket per week of the month
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      weeks.forEach(w => buckets.set(w, { count: 0, durationMin: 0 }));
      for (const ev of events) {
        const day = new Date(ev.scheduleDate).getDate();
        const weekIdx = Math.min(Math.floor((day - 1) / 7), 4);
        const key = weeks[weekIdx];
        buckets.get(key)!.count++;
        buckets.get(key)!.durationMin += ev.durationMinutes;
      }
    } else {
      // One bucket per month
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      months.forEach(m => buckets.set(m, { count: 0, durationMin: 0 }));
      for (const ev of events) {
        const m = months[new Date(ev.scheduleDate).getMonth()];
        buckets.get(m)!.count++;
        buckets.get(m)!.durationMin += ev.durationMinutes;
      }
    }

    this.chartData = Array.from(buckets.entries()).map(([label, v]) => ({ label, ...v }));
  }

  get chartMax(): number {
    return Math.max(...this.chartData.map(d => d.count), 1);
  }

  get viewLabel(): string {
    const now = new Date();
    if (this.viewMode === 'weekly') {
      const start = this.getRangeStart(now);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (this.viewMode === 'monthly') {
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return now.getFullYear().toString();
    }
  }
}
