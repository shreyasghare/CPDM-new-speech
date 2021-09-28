import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-serviceability-complete',
  templateUrl: './serviceability-complete.component.html',
  styleUrls: ['./serviceability-complete.component.scss']
})
export class ServiceabilityCompleteComponent implements OnInit {
  msg = ' The Serviceability process is complete';
  constructor() { }

  ngOnInit() {
  }

}
