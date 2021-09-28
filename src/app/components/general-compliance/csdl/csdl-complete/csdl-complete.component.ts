import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';

@Component({
  selector: 'app-csdl-complete',
  templateUrl: './csdl-complete.component.html',
  styleUrls: ['./csdl-complete.component.scss']
})
export class CsdlCompleteComponent implements OnInit {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;
  csdlId: string;

  constructor(private activatedRoute: ActivatedRoute,
              private csdlService: CsdlService) { }

  ngOnInit() {
    this.csdlId = this.activatedRoute.snapshot.parent.params.id;
  }

  switchToSideBarStep(stepName: string) {
    this.csdlService.switchToStepEvent(stepName);
  }
}
