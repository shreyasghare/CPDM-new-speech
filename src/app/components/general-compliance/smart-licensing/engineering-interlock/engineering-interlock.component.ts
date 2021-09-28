import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { Role } from '@cpdm-model/role';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-engineering-interlock',
  templateUrl: './engineering-interlock.component.html',
  styleUrls: ['./engineering-interlock.component.scss']
})
export class EngineeringInterlockComponent implements OnInit {
  data: any = null;
  role = Role;
  slId: string = null;
  isCompletedByPM = false;
  confirmationDialogRef: any;
  engineeringInterlockStatus: string;
  
  engineeringInterlock_status: { icon: string; status: string } = {
    icon: 'chevron',
    status: 'Engineering Interlock is not applicable'

  };

  confirmationObj: { confirmationText: string } = {
    confirmationText: 'Are you sure all the tasks are ready to be marked as completed?'
  };

  constructor(private activatedRoute: ActivatedRoute,
    private smartLicensingService: SmartLicensingService,
    public dialog: MatDialog,
    private spinnerService: SpinnerService,
  ) { }

  ngOnInit() {
    this.spinnerService.show();
    this.slId = this.activatedRoute.snapshot.params.id;
    this.smartLicensingService.getROTaskData('engineeringInterlock').subscribe(res => {
      // this.spinnerService.hide();
      this.data = res.data.dbRes[0].details;
    });
    this.getSlStatus();
  }

  getSlStatus(): void {
    this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(res => {
      const { success, data } = res;
      
      if (success) {
        this.spinnerService.hide();
        this.engineeringInterlockStatus = getNestedKeyValue(data, 'status', 'engineeringInterlock') 
                                          ? getNestedKeyValue(data, 'status', 'engineeringInterlock') : '' ;
        this.isCompletedByPM = getNestedKeyValue(data, 'status', 'engineeringInterlock') ? true : false;
      }
    });
  }

  onChecked(event): void {
    if (event.target.checked) {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, { data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });

      this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
        this.updateStatusToNode();
      });

      this.confirmationDialogRef.afterClosed().subscribe(result => {
        const { success } = result;
        if (success) {
          event.target.checked = true;
          this.getSlStatus();
        } else {
          event.target.checked = false;
        }
      });
    }
  }

  private updateStatusToNode(): void {
    const statusBody = {
      stepName: 'Engineering Interlock',
      progressScore: 22,
      data: { engineeringInterlock: 'completed' }
    };
    this.smartLicensingService.updateStatus(this.slId, statusBody).subscribe(res => {
      const { data } = res;
      if (getNestedKeyValue(data, 'workflowTimestamp', 'engineeringInterlock')) {
        this.confirmationDialogRef.close(res);
      }
      this.smartLicensingService.enableNextSidebarItem('engineeringResponse');
    }, err => {
      console.error(err);
    });
  }

}
