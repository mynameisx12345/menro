import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TruckService } from '../../../services/truck.service';
import { DataService } from '../../../services/data.service';
import { Truck, WasteType } from '../../../models/models';
import { Observable } from 'rxjs';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { sortData } from '../../../shared/sort.util';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.scss']
})
export class FleetComponent {
  @Input() trucks: Truck[] = [];
  @Input() loading = false;
  @Output() trucksChange = new EventEmitter<Truck[]>();

  wasteTypes$: Observable<WasteType[]>;
  showForm = false;
  search = '';
  sortCol = ''; sortDir: 'asc' | 'desc' = 'asc';
  setSort(col: string) { this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc'; this.sortCol = col; }
  get filtered() {
    const q = this.search.toLowerCase();
    const list = this.trucks.filter(t =>
      t.plateNumber?.toLowerCase().includes(q) || t.collectorName?.toLowerCase().includes(q) ||
      t.wasteType?.toLowerCase().includes(q) || t.route?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
    return sortData(list, this.sortCol, this.sortDir);
  }
  editingTruck: Truck | null = null;
  form: FormGroup;

  constructor(private truckSvc: TruckService, private dataSvc: DataService, private fb: FormBuilder, private confirm: ConfirmDialogService) {
    this.wasteTypes$ = this.dataSvc.getWasteTypes();
    this.form = this.fb.group({
      plateNumber:   ['', Validators.required],
      collectorName: ['', Validators.required],
      wasteType:     ['', Validators.required],
      route:         ['', Validators.required],
      status:        ['', Validators.required]
    });
  }

  openForm() { this.showForm = true; this.editingTruck = null; this.form.reset({ status: 'idle' }); }

  editTruck(truck: Truck) {
    this.showForm = true; this.editingTruck = truck;
    this.form.setValue({ plateNumber: truck.plateNumber, collectorName: truck.collectorName,
      wasteType: truck.wasteType, route: truck.route, status: truck.status });
  }

  cancelForm() { this.showForm = false; this.editingTruck = null; this.form.reset(); }

  save() {
    if (this.form.invalid) return;
    if (this.editingTruck) {
      this.truckSvc.updateTruck(this.editingTruck.id, this.form.value).subscribe(updated => {
        this.trucksChange.emit(this.trucks.map(t => t.id === updated.id ? updated : t));
        this.cancelForm();
      });
    } else {
      this.truckSvc.createTruck(this.form.value).subscribe(truck => {
        this.trucksChange.emit([...this.trucks, truck]);
        this.cancelForm();
      });
    }
  }

  async delete(id: string) {
    const ok = await this.confirm.confirm({ title: 'Delete Truck', message: 'Are you sure you want to delete this truck?', confirmText: 'Delete', dangerMode: true });
    if (!ok) return;
    this.truckSvc.deleteTruck(id).subscribe(() => { this.trucksChange.emit(this.trucks.filter(t => t.id !== id)); });
  }
}
