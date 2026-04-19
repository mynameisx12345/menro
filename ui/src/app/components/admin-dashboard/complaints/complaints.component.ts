import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { Complaint, SegregationIssue } from '../../../models/models';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { TableColumn, TableAction } from '../../../shared/data-table/data-table.types';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss']
})
export class ComplaintsComponent implements OnInit {
  activeTab: 'resident' | 'collector' = 'resident';

  complaints: Complaint[] = [];
  viewingComplaint: Complaint | null = null;

  segregationIssues: SegregationIssue[] = [];
  viewingIssue: SegregationIssue | null = null;

  selectedPhoto: string | null = null;
  loadingComplaints = true;
  loadingIssues = true;

  residentColumns: TableColumn[] = [
    { key: 'residentName', label: 'Resident' },
    { key: 'type',         label: 'Type' },
    { key: 'routeId',      label: 'Route' },
    { key: 'address',      label: 'Address' },
    { key: 'description',  label: 'Description', sortable: false },
    { key: 'timestamp',    label: 'Date', type: 'date' },
    { key: 'status',       label: 'Status', type: 'badge', badgeClass: (r) => r.status }
  ];

  residentActions: TableAction[] = [
    { label: 'View',    handler: (r) => this.viewingComplaint = r },
    { label: 'Review',  handler: (r) => this.resolveComplaint(r.id, 'reviewing') },
    { label: 'Resolve', class: 'success', handler: (r) => this.resolveComplaint(r.id, 'resolved') }
  ];

  collectorColumns: TableColumn[] = [
    { key: 'collectorName', label: 'Collector' },
    { key: 'address',       label: 'Address' },
    { key: 'wasteType',     label: 'Waste Type' },
    { key: 'issue',         label: 'Issue', sortable: false },
    { key: 'timestamp',     label: 'Date', type: 'date' },
    { key: 'status',        label: 'Status', type: 'badge', badgeClass: (r) => r.status }
  ];

  collectorActions: TableAction[] = [
    { label: 'View',    handler: (r) => this.viewingIssue = r },
    { label: 'Review',  handler: (r) => this.resolveIssue(r.id, 'reviewing') },
    { label: 'Resolve', class: 'success', handler: (r) => this.resolveIssue(r.id, 'resolved') }
  ];

  constructor(private dataSvc: DataService) {}

  ngOnInit() {
    this.dataSvc.getComplaints().subscribe(c => { this.complaints = c; this.loadingComplaints = false; });
    this.dataSvc.getSegregationIssues().subscribe(s => { this.segregationIssues = s; this.loadingIssues = false; });
  }

  resolveComplaint(id: string, status: string) {
    this.dataSvc.updateComplaint(id, { status: status as any }).subscribe(updated => {
      const idx = this.complaints.findIndex(c => c.id === id);
      if (idx !== -1) this.complaints[idx] = updated;
      if (this.viewingComplaint?.id === id) this.viewingComplaint = { ...this.complaints[idx] };
    });
  }

  resolveIssue(id: string, status: string) {
    this.dataSvc.updateSegregationIssue(id, { status: status as any }).subscribe(updated => {
      const idx = this.segregationIssues.findIndex(s => s.id === id);
      if (idx !== -1) this.segregationIssues[idx] = updated;
      if (this.viewingIssue?.id === id) this.viewingIssue = { ...this.segregationIssues[idx] };
    });
  }
}
