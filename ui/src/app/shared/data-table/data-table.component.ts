import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableColumn, TableAction } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  providers: [DatePipe]
})
export class DataTableComponent implements OnChanges {
  @Input() title = '';
  @Input() rows: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() searchFields: string[] = [];   // keys to search across
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() loading = false;

  search = '';
  sortCol = ''; sortDir: 'asc' | 'desc' = 'asc';
  page = 1; pageSize = 10;

  constructor(private datePipe: DatePipe) {}

  ngOnChanges() { this.page = 1; }

  setSort(col: string) {
    this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortCol = col;
    this.page = 1;
  }

  get filtered() {
    const q = this.search.toLowerCase();
    const fields = this.searchFields.length ? this.searchFields : this.columns.map(c => c.key);
    const list = q ? this.rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(q))) : this.rows;
    if (!this.sortCol) return list;
    return [...list].sort((a, b) => {
      const av = String(a[this.sortCol] ?? '').toLowerCase();
      const bv = String(b[this.sortCol] ?? '').toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged() { const s = (this.page - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); }

  getCellValue(row: any, col: TableColumn): string {
    const val = row[col.key];
    if (col.type === 'date') return this.datePipe.transform(val, 'short') ?? '';
    return val ?? '';
  }
}
