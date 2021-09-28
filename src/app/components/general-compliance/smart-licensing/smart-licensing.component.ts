import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { Role } from '@cpdm-model/role';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

@Component({
  selector: 'app-smart-licensing',
  templateUrl: './smart-licensing.component.html',
  styleUrls: ['./smart-licensing.component.scss']
})
export class SmartLicensingComponent implements OnInit {

  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;
  role = Role;
  slId: string;
  projectId: string;
  projectName: any;
  tempDataForInfoHelper: any;
  latestStep: string;
  workflowTimestampObjLength: number;
  disableNextBtn: boolean;
  disablePreviousBtn: boolean;
  betaFlag: boolean = false;
  sLUpdateListenerSubscription: Subscription;
  slResponse: any;


  constructor(private activatedRoute: ActivatedRoute,
    private projectDetailsService: ProjectsDetailService,
    private smartLicensingService: SmartLicensingService,
    public dialog: MatDialog,
    private spinnerService: SpinnerService) { }


  sidebarData = [{
    alias: 'initiate',
    title: 'Initiate',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'engineeringInterlock',
    title: 'Engineering Interlock',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'engineeringResponse',
    title: 'Engineering Response',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  },
  {
    alias: 'implementation',
    title: 'Implement',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'demoToElo',
    title: 'Demo to ELO',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  },
  {
    alias: 'testing',
    title: 'Testing',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  },
  {
    alias: 'operationalReadiness',
    title: 'Operational Readiness',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }];

  ngOnInit() {
    this.spinnerService.show();
    this.slId = this.activatedRoute.snapshot.params.id;
    this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(slRes => {
      this.slResponse = slRes;
      const { data, success } = slRes;
      const { status, skipTo } = data;
      if (success) {
        const { _id: projectId, name: projectName } = data.projectId;
        this.projectId = projectId;
        this.projectName = projectName;
        this.betaFlag = data.betaFlag;
        this.setNotApplicableKey(status);

        this.projectDetailsService.setProjectDetails(data.projectId);

        const workflowTimestampArray = [];
        if(getNestedKeyValue(data, 'workflowTimestamp')) {
          const { workflowTimestamp } = data;
          if(skipTo && Object.keys(workflowTimestamp).length == 1) {
            this.sideBar.enableSideBarItems(skipTo);
            this.sideBar.switchSidebarTab(skipTo);
          }
          else {
            for(const [key, value] of Object.entries(workflowTimestamp)) {
              const obj = {};
              obj['step'] = key;
              obj['date'] = value;
              workflowTimestampArray.push(obj);
            }
            const sortedTimestamp = workflowTimestampArray.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()); 
            this.latestStep = sortedTimestamp[0].step;
            const currentIndex = this.sidebarData.findIndex(sidebarObj => sidebarObj.alias === this.latestStep);
            const sidebarIndex = currentIndex === this.sidebarData.length - 1 ? currentIndex : currentIndex + 1;

            this.sideBar.enableSideBarItems(this.sidebarData[sidebarIndex].alias);
            this.sideBar.switchSidebarTab(this.sidebarData[sidebarIndex].alias);
          }
        } else {
          this.sideBar.enableSideBarItems(this.sidebarData[0].alias);
          this.sideBar.switchSidebarTab(this.sidebarData[0].alias);
        }

        this.updatedWorkflowTimestampDiv(data);
        this.spinnerService.hide();
      }
      // old method to get project
      // this.projectDataService.getProjectDetails(this.projectId).subscribe(res=>{
      //   this.projectDetailsService.setProjectDetails(res);
      //   this.projectName = res.name;
      // });
    }, err => {
      this.spinnerService.hide();
    });

    this.sLUpdateListenerSubscription = this.smartLicensingService.getSLUpdateListener().subscribe(sideBarItemObj => {
      this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(res => {
        const { success, data } = res; 
        const { status } = data;
        if(success) {
          this.setNotApplicableKey(status);
          const { itemName: sideBarItemName, skipFlag } = sideBarItemObj;
          this.sideBar.enableSideBarItems(sideBarItemName);
          if (skipFlag) {
            this.sideBar.switchSidebarTab(sideBarItemName);
          } else {
            this.disableNextBtn = false;
          }
          this.updatedWorkflowTimestampDiv(data);
        }
      });
    });
  }

  private setNotApplicableKey(slStatusObj): void {
    if(slStatusObj) {
      Object.keys(slStatusObj).forEach(key => {
        if(slStatusObj[key] === 'notApplicable') {
          const index = this.sidebarData.findIndex(sidebarObj => sidebarObj.alias === key);
          this.sidebarData[index]['notApplicable'] = true;
        }
      });
    }
  }

  showModal(obj: any): void {
    let { alias: stepName } = obj; 
    if (stepName === 'implementation') { stepName = 'implement'; }
    const slInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: '40vw',
      data: { workflowName: 'smartLicensing', stepName }
    });
    slInfoHelper.afterClosed();
  }

  switchSidebarTab(sidebarObj: any): void {
    this.sidebarData = sidebarObj.sidebarData;
    this.disableNextBtn = sidebarObj.disableNextBtn;
    this.disablePreviousBtn = sidebarObj.disablePreviousBtn;
  }

  openComponentModal() {
    const complianceData = { title: 'Smart Licensing', name: 'smartLicensing' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '65vw',
      data: { complianceData, isLargeModal: true },
      panelClass: 'ar-container'
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }

  onPreviousClick() {
    this.sideBar.onPreviousClick();
  }

  onNextClick() {
    this.sideBar.onNextClick();
  }

  updatedWorkflowTimestampDiv(accessObj) {
    this.sideBar.updateWorkflowTimestamp(accessObj.workflowTimestamp);
  }

  // setNotApplicableFlag() {
  //   const { data, success } = this.slResponse;
  //   if (data.status && Object.keys(data.status).length > 0) {
  //     for (var key in data.status) {
  //       if (data.status[key] === 'notApplicable' && this.sidebarData.some(x => x.alias === key)) {
  //         this.sidebarData.filter(x => x.alias === key)[0].isEnabled = true;
  //         this.sidebarData.filter(x => x.alias === key)[0]['notApplicable'] = true;
  //         this.slResponse.data.workflowTimestamp[key] = new Date();
  //       }
  //     }
  //   }
  // }

  ngOnDestroy() {
    if (this.sLUpdateListenerSubscription) {
      this.sLUpdateListenerSubscription.unsubscribe();
    }
  }
}
