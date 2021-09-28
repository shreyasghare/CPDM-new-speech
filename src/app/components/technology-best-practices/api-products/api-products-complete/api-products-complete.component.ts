import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-api-products-complete',
  templateUrl: './api-products-complete.component.html',
  styleUrls: ['./api-products-complete.component.scss']
})
export class ApiProductsCompleteComponent implements OnInit {
  msg = ' The API Products process is complete';
  constructor() { }

  ngOnInit() {
  }

}
