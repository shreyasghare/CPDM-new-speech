import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ipv6-complete',
  templateUrl: './ipv6-complete.component.html',
  styleUrls: ['./ipv6-complete.component.scss']
})
export class Ipv6CompleteComponent implements OnInit {
  msg = ' The IPv6 process is complete';
  constructor() { }

  ngOnInit() {
  }

}
