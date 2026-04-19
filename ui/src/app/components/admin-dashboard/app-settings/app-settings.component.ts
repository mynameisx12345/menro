import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit {
  noSignalThresholdMinutes = 15;
  nearbyNotifCooldownMinutes = 10;
  saving = false;
  saved = false;

  constructor(private dataSvc: DataService) {}

  ngOnInit() {
    this.dataSvc.getSettings().subscribe(s => {
      if (s['noSignalThresholdMinutes']) this.noSignalThresholdMinutes = +s['noSignalThresholdMinutes'];
      if (s['nearbyNotifCooldownMinutes']) this.nearbyNotifCooldownMinutes = +s['nearbyNotifCooldownMinutes'];
    });
  }

  save() {
    this.saving = true;
    this.dataSvc.updateSettings({ noSignalThresholdMinutes: this.noSignalThresholdMinutes, nearbyNotifCooldownMinutes: this.nearbyNotifCooldownMinutes }).subscribe(() => {
      this.saving = false;
      this.saved = true;
      setTimeout(() => this.saved = false, 2500);
    });
  }
}
