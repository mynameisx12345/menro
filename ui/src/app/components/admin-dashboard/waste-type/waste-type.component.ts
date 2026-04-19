import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { WasteType } from '../../../models/models';
import { Observable } from 'rxjs';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { sortData } from '../../../shared/sort.util';

@Component({
  selector: 'app-waste-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './waste-type.component.html',
  styleUrls: ['./waste-type.component.scss']
})
export class WasteTypeComponent {
  wasteTypes$: Observable<WasteType[]>;
  wasteTypesList: WasteType[] = [];
  search = '';
  sortCol = ''; sortDir: 'asc' | 'desc' = 'asc';
  setSort(col: string) { this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc'; this.sortCol = col; }
  get filtered() {
    const q = this.search.toLowerCase();
    const list = this.wasteTypesList.filter(w => w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q));
    return sortData(list, this.sortCol, this.sortDir);
  }
  showForm = false;
  editing: WasteType | null = null;
  loading = true;
  form: FormGroup;

  constructor(private dataSvc: DataService, private fb: FormBuilder, private confirm: ConfirmDialogService) {
    this.wasteTypes$ = this.dataSvc.getWasteTypes();
    this.wasteTypes$.subscribe(w => { this.wasteTypesList = w; this.loading = false; });
    this.form = this.fb.group({
      name:        ['', Validators.required],
      color:       ['#2d6a4f'],
      description: ['']
    });
  }

  openForm() { this.showForm = true; this.editing = null; this.form.reset({ color: '#2d6a4f' }); }

  editItem(w: WasteType) {
    this.showForm = true; this.editing = w;
    this.form.setValue({ name: w.name, color: w.color, description: w.description || '' });
  }

  cancel() { this.showForm = false; this.editing = null; this.form.reset(); }

  save() {
    if (this.form.invalid) return;
    if (this.editing) {
      this.dataSvc.updateWasteType(this.editing.id, this.form.value).subscribe(() => this.cancel());
    } else {
      this.dataSvc.createWasteType(this.form.value).subscribe(() => this.cancel());
    }
  }

  async delete(id: string) {
    const ok = await this.confirm.confirm({ title: 'Delete Waste Type', message: 'Are you sure you want to delete this waste type?', confirmText: 'Delete', dangerMode: true });
    if (!ok) return;
    this.dataSvc.deleteWasteType(id).subscribe();
  }
}
