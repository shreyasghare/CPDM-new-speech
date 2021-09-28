import { Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { Role } from '@cpdm-model/role';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
@Component({
  selector: 'app-crc-implement',
  templateUrl: './crc-implement.component.html',
  styleUrls: ['./crc-implement.component.scss']
})
export class CrcImplementComponent implements OnInit {
  role = Role;
  constructor(private crcService: CommunicationsRegulatoryService) { }

  ngOnInit() {

  }

  updateApproval(updatedCrcData) {
    this.crcService.updateCrcDataWithSubject(updatedCrcData);
  }
}