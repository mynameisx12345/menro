import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmOptions } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  visible = false;
  options: ConfirmOptions = { message: '' };
  private resolve!: (v: boolean) => void;

  constructor(private svc: ConfirmDialogService) {}

  ngOnInit() {
    this.svc.request$.subscribe(({ options, resolve }) => {
      this.options = { title: 'Confirm', confirmText: 'Confirm', dangerMode: false, ...options };
      this.resolve = resolve;
      this.visible = true;
    });
  }

  answer(value: boolean) {
    this.visible = false;
    this.resolve(value);
  }
}
