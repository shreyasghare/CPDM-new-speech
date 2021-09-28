import { Component, OnInit } from '@angular/core';
import { Role } from '@cpdm-model/role';
import { ActivatedRoute } from '@angular/router';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-operational-readiness',
  templateUrl: './operational-readiness.component.html',
  styleUrls: ['./operational-readiness.component.scss']
})
export class OperationalReadinessComponent implements OnInit {

  data: any = null;
  role = Role;
  confirmationDialogRef: any;
  isCompletedByPm = false;
  slId: string = null;
  confirmationObj: {confirmationText: string} = {
    confirmationText: 'Are you sure all the tasks are ready to be marked as completed?'
  };

  constructor(private smartLicensingService: SmartLicensingService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private spinnerService: SpinnerService) { }

  ngOnInit() {
    this.spinnerService.show();
    this.slId = this.activatedRoute.snapshot.params.id;
    this.smartLicensingService.getROTaskData('operationalReadiness').subscribe(res => {
      this.data = res.data.dbRes[0].details;
    });
    this.getSlData();
  }

  getSlData() {
    this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(res => {
      const { success, data } = res;
      if(success) {
      this.spinnerService.hide();
      this.isCompletedByPm = getNestedKeyValue(data, 'status', 'operationalReadiness') == 'completed' ?  true : false;
      }
    }, err => {
      this.spinnerService.show();
      console.error(err);
    });
  }

  completeSLWorkflow(event) {
    if (event.target.checked) {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, {data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });

      this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
        this.updateStatusToNode();
      });

      this.confirmationDialogRef.afterClosed().subscribe(result => {
        const {success} = result;
        if (success) {
          event.target.checked = true;
          this.getSlData();
        } else {
          event.target.checked = false;
        }
      });
    }
  }

  private updateStatusToNode(): void {
    const statusBody = {
      stepName: 'Operational Readiness',
      progressScore: 100,
      data: {operationalReadiness: 'completed'}
    };
    this.smartLicensingService.updateStatus(this.slId, statusBody).subscribe(res => {
      if (res.data && res.data.workflowTimestamp && res.data.workflowTimestamp.operationalReadiness) {
        this.confirmationDialogRef.close(res);
        this.smartLicensingService.enableNextSidebarItem('operationalReadiness');
      }
    }, err => {
      console.error(err);
    });
  }
}
