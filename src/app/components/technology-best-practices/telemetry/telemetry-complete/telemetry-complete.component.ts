import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-telemetry-complete',
  templateUrl: './telemetry-complete.component.html',
  styleUrls: ['./telemetry-complete.component.scss']
})
export class TelemetryCompleteComponent implements OnInit {

  msg = ' The Telemetry process is complete';
  constructor() { }

  ngOnInit() {
  }

}
