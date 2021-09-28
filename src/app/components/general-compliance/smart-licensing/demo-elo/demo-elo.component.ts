import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { Role } from '@cpdm-model/role';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { getNestedKeyValue, isBlankString } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-demo-elo',
  templateUrl: './demo-elo.component.html',
  styleUrls: ['./demo-elo.component.scss']
})
export class DemoEloComponent implements OnInit {
  data: any;
  role = Role;
  slId: any;
  isConfirmed = false;
  slData: any;
  poComment = '';
  comments: any = [{ cecId: '', status: 'none', comment: '', timestamp: '' }];
  demoReviewStatus: string;
  isRejectedByPO = false;
  isApprovedByPO = true;
  showLoader = false;
  confirmationDialogRef: any;
  confirmationObj: { confirmationText: string } = {
    confirmationText: 'Are you sure all the tasks are ready for the Policy Owner to review?'
  };
  demoToElo_status: { icon: string; status: string } = {
    icon: 'chevron',
    status: 'Demo to ELO is not applicable'
  };
  demoToEloStatus: string;

  constructor(public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private smartLicensingService: SmartLicensingService,
    private userDetailsService: UserDetailsService,
    private spinnerService: SpinnerService,
    private loaderService: LoaderService) { }

  slPO = {
    review: {
      icon: 'like',
      status: 'Review',
      message: 'After completion of the Smart Licensing implementation demo, please provide your review.'
    },
    reject: {
      icon: 'reject',
      status: 'Rejected',
      message: 'Project Manager will implement the changes and resubmit.'
    },
    approve: {
      icon: 'complete',
      status: 'Approved',
      message: 'Smart Licensing implementation with demo is complete.'
    }
  };

  ngOnInit() {
    this.spinnerService.show();
    this.slId = this.activatedRoute.snapshot.params.id;
    // this.spinnerService.show();
    this.smartLicensingService.getROTaskData('DemoToELO').subscribe(res => {
      // this.spinnerService.hide();
      this.data = res.data.dbRes[0].details;
    });
    this.getSlData();
  }

  getSlData() {
    this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.spinnerService.hide();
        if (data && data.status && data.status.hasOwnProperty('demoToElo')) {
          this.demoToEloStatus = getNestedKeyValue(data, 'status', 'demoToElo');
        }
        else {
          this.demoToEloStatus = '';
        }
        this.comments = data.demoToElo && data.demoToElo.length > 0 ? data.demoToElo : this.comments;
        this.isConfirmed = getNestedKeyValue(data, 'status', 'demoToElo') == 'initiated' ||
          getNestedKeyValue(data, 'status', 'demoToElo') == 'resubmitted' ? true : false;
        this.isRejectedByPO = getNestedKeyValue(data, 'status', 'demoToElo') == 'rejected' ? true : false;
        this.isApprovedByPO = getNestedKeyValue(data, 'status', 'demoToElo') == 'approved' ? true : false;
      }
    }, err => {
      this.spinnerService.show();
      console.error(err);
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
          this.getSlData();
        } else {
          event.target.checked = false;
        }
      });
    }
  }

  private updateStatusToNode(): void {
    const statusBody = {
      data: { demoToElo: 'initiated' }
    };
    this.smartLicensingService.updateStatus(this.slId, statusBody).subscribe(res => {
      this.confirmationDialogRef.close(res);
    }, err => {
      console.error(err);
    });
  }

  onSendReview(): void {
    this.showLoader = true;
    if (this.demoReviewStatus != undefined) {
      const obj = {
        stepName: 'Demo To ELO',
        progressScore: 55,
        data: {
          status: this.demoReviewStatus,
          comment: this.poComment === '' ? '' : this.poComment,
          timestamp: new Date(),
          cecId: this.userDetailsService.getLoggedInCecId()
        }
      };
      this.smartLicensingService.updateReviewObject(this.slId, 'demoToElo', obj).subscribe(res => {
        this.showLoader = false;
        const { success, data } = res;
        if (success) {
          this.comments = data.demoToElo ? data.demoToElo : [{ cecId: '', status: 'none', comment: '', timestamp: '' }];
          const [demoToElo] = getNestedKeyValue(data, 'demoToElo');
          this.isRejectedByPO = getNestedKeyValue(demoToElo, 'status') == 'rejected' ? true : false;
          this.isApprovedByPO = getNestedKeyValue(demoToElo, 'status') == 'approved' ? true : false;

          if (getNestedKeyValue(data, 'workflowTimestamp', 'demoToElo')) {
            this.smartLicensingService.enableNextSidebarItem('testing');
          }
        }
      }, err => {
        this.showLoader = true;
      });
    }
  }

  checkEmptyString(str: string): void {
    if(isBlankString(str)){
      this.poComment = '';
    }
  }

}
