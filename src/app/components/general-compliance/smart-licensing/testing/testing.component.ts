import { Component, OnInit, ViewChild } from '@angular/core';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { Role } from '@cpdm-model/role';
import { NavigationTabsComponent } from '@cpdm-shared/components/navigation-tabs/navigation-tabs.component';
import { MatDialog} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { element } from 'protractor';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {

  @ViewChild( NavigationTabsComponent, {static: false}) tabs: NavigationTabsComponent;

  customTab = [
    { tabNumber : 1, tabName : 'BU Testing', active: true, isDisabled: false },
    { tabNumber : 2, tabName : 'CSSM Production Test', active: false, isDisabled: true },
    { tabNumber : 3, tabName : 'On-Prem Production Test', active: false, isDisabled: true }
  ];
  data: any = null;
  role = Role;
  step: string;
  tabID = 'BUTesting';

  disablePreviousBtn: boolean;
  disableNextBtn: boolean;
  currrentTabNumber: any;

  isCompletedByPm = false;
  confirmationDialogRef: any;
  slId: string = null;
  confirmationObj: {confirmationText: string} = {
    confirmationText: 'Are you sure all the tasks are ready to be marked as completed?'
  };
  onInit = false;
  constructor( private smartLicensingService: SmartLicensingService,
               private spinnerService: SpinnerService,
               private activatedRoute: ActivatedRoute,
               private matdialog: MatDialog) { }

  ngOnInit() {
    this.disableNextBtn = true;
    this.onInit = true;
    this.getTestingTabData(this.tabID);
  }


  onTabChanged(event: any) {
      this.disableNextBtn = event.disableNextBtn;
      this.disablePreviousBtn = event.disablePreviousBtn;
      if (event.currentTab == 'BU Testing') {
        this.tabID = 'BUTesting';
      } else if (event.currentTab == 'CSSM Production Test') {
        this.tabID = 'CSSMProductionTest';
      } else if (event.currentTab == 'On-Prem Production Test') {
        this.tabID = 'OnPremProductionTest';
      }
      this.getTestingTabData(this.tabID);
    }

    getTestingTabData(tabID: string) {
      this.spinnerService.show();
      this.slId = this.activatedRoute.snapshot.params.id;
      this.smartLicensingService.getROTaskData(tabID).subscribe(res => {
        this.spinnerService.hide();
        this.data = res.data.dbRes[0].details;
        this.getSlData();
      });
    }

    getSlData() {
      this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(res => {
        const { success, data }  = res;
        if (success) {
          if (this.tabID === 'BUTesting') { this.isCompletedByPm = res.data && data.testing &&
            data.testing.subStatus.buTesting === 'checked' ?  true : false; }
          if (this.tabID === 'CSSMProductionTest') { this.isCompletedByPm = data && data.testing &&
            data.testing.subStatus.cssmProductionTest === 'checked' ?  true : false; }
          if (this.tabID === 'OnPremProductionTest') {
            this.isCompletedByPm = getNestedKeyValue(data, 'status', 'testing') === 'completed' ?  true : false;

            if (Object.keys(data.testing.subStatus).length === 2) { this.customTab.map((element) => element.isDisabled = false); }
          }

          // To handle tabs and previous/next button
          if (data.testing === undefined) {
            this.manageTab('BUTesting'); // Even when first tab is not completed
          } if (data && data.testing && Object.keys(data.testing.subStatus).length == 1) {
            this.manageTab('BUTesting'); // When first tab is completed
          } else if (data && data.testing && Object.keys(data.testing.subStatus).length == 2) {
            this.manageTab('CSSMProductionTest'); // When second tab is completed
          }
        }

      }, err => {
        console.error(err);
      });
    }

    testingStepOnChecked(event) {
        if (event.target.checked) {
          this.confirmationDialogRef = this.matdialog.open(ConfirmationDialogComponent, {data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });
          this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
          this.updateStatusToNode();
          });

          this.confirmationDialogRef.afterClosed().subscribe(result => {
            const {success} = result;
            if (success) {
              event.target.checked = true;
              this.onInit = false;
              this.getSlData();
            } else {
              event.target.checked = false;
            }
          });
      }
    }

    manageTab(currentTabID: string) {
      if (this.onInit) { this.tabID = currentTabID; }

      if (this.tabID == 'BUTesting' && this.isCompletedByPm) {
        this.disableNextBtn = false;
        this.customTab[1].isDisabled = false;
        if (this.onInit) { this.manageOnInit('CSSMProductionTest', 'CSSM Production Test'); }
      } else if (this.tabID == 'CSSMProductionTest' && this.isCompletedByPm) {
        this.disablePreviousBtn = false;
        this.disableNextBtn = false;
        this.customTab[2].isDisabled = false;
        if (this.onInit) { this.manageOnInit('OnPremProductionTest', 'On-Prem Production Test'); }
      } else { this.disableNextBtn = true; } // So that user should not go further without making this.isCompletedByPm = true.
    }

    manageOnInit(nextTabID: string, nextTabName: string) {
      this.onInit = false;
      this.tabID = nextTabID;
      this.isCompletedByPm = false;
      this.disablePreviousBtn = false;
      this.disableNextBtn = true;
      this.customTab.forEach((elem) => {
        if (elem.tabName == nextTabName ) { elem.active = true; } else { elem.active = false; }
      });
      this.getTestingTabData(nextTabID);
    }

    private updateStatusToNode(): void {
      let statusBody = null;
      if (this.tabID == 'BUTesting') {
        statusBody = {
          stepName: 'Testing',
          data: {buTesting: 'checked'}
        };
      } else if (this.tabID == 'CSSMProductionTest') {
        statusBody = {
          stepName: 'Testing',
          data: {cssmProductionTest: 'checked'}
        };
      } else {
        statusBody = {
          stepName: 'Testing',
          progressScore: 88,
          data: {testing: 'completed'}
        };
      }

      this.smartLicensingService.updateStatus(this.slId, statusBody).subscribe(res => {
        if (this.tabID == 'OnPremProductionTest') {
          if (res.data && res.data.workflowTimestamp && res.data.workflowTimestamp.testing) {
            this.confirmationDialogRef.close(res);
            this.smartLicensingService.enableNextSidebarItem('operationalReadiness');
          }
        } else { this.confirmationDialogRef.close(res); }
      }, err => {
        console.error(err);
      });
    }





  }
