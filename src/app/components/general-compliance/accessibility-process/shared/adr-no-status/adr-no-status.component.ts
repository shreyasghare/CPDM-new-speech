import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-adr-no-status',
  templateUrl: './adr-no-status.component.html',
  styleUrls: ['./adr-no-status.component.scss']
})
export class AdrNoStatusComponent implements OnInit {
  objectDetails: any;
  onClose: any;
  noStatusAdrs: any = [];
  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
    const adrItemLengths = [this.objectDetails.web.length, this.objectDetails.software.length,
    this.objectDetails.documentation.length, this.objectDetails.hardware.length];

    for (let i = 0; i < Math.max.apply(null, adrItemLengths); i++) {
      const singleObj = {
        web: this.objectDetails.web[i] ? this.objectDetails.web[i].name : ' ',
        software: this.objectDetails.software[i] ? this.objectDetails.software[i].name : ' ',
        documentation: this.objectDetails.documentation[i] ? this.objectDetails.documentation[i].name : ' ',
        hardware: this.objectDetails.hardware[i] ? this.objectDetails.hardware[i].name : ' ',
      };
      this.noStatusAdrs.push(singleObj);
    }
  }

  modalPopupClose() {
    this.bsModalRef.hide();
  }

}
