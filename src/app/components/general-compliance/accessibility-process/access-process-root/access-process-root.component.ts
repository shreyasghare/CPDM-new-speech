import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { PrepareVpatComponent } from '../prepare-vpat/prepare-vpat.component';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

@Component({
  selector: 'app-access-process-root',
  templateUrl: './access-process-root.component.html',
  styleUrls: ['./access-process-root.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccessProcessRootComponent implements OnInit, AfterViewInit {
  projectName: string;
  projectId: string;
  pMimplFlag = false;
  pOimplFlag = false;
  accessibilityProcessHeader = true;
  accessibilityProcessViewBtn = false;
  customTabView = false;
  disableNextBtn = false;
  disablePreviousBtn = false;
  @ViewChild('prepareVpatComponent', null) prepareVpatComponent: PrepareVpatComponent;
  @ViewChild(ProcessSidebarComponent, {static: true}) sideBar: ProcessSidebarComponent;
  sidebarData = [{
    alias: 'identifyAdrs',
    title: 'Identify ADRs',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'adrListApproval',
    title: 'ADR List Approval',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'implementation',
    title: 'Implement',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: false,
    showTimestampStatus: true
  }, {
    alias: 'policyTesting',
    title: 'Policy Testing',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'prepareVpat',
    title: 'Prepare VPAT',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'releaseVpat',
    title: 'Release VPAT',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: false,
    showTimestampStatus: true
  }];

  @ViewChild('content', {static: false}) modalContent: TemplateRef<any>;
  @ViewChild('helperContent', {static: false}) tooltipContent: TemplateRef<any>;

  isUserPm = true;
  projectAdrData: any;

  infoHelperData: any;
  helperObj: any = {};
  accessibilityObj: any = null;
  workflowTimestampObj: any;
  betaFlag: boolean;

  nextBtnName: string = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    public cuiModalService: CuiModalService,
    private service: AccessibilityProcessService,
    private userService: UserDetailsService,
    private projectDataService: ProjectsDataService,
    private projectDetailsService: ProjectsDetailService,
    private loaderService: LoaderService,
    public dialog: MatDialog
    ) { }

  openComponentModal() {
    const complianceData = { title: 'Accessibility', name: 'accessibility' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '65vw',
      data: { complianceData, isLargeModal: true }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }

  showModal(obj: any): void {
    const { name: title, alias: stepName, size } = obj;
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'accessibility', stepName, title }
    });
    accInfoHelper.afterClosed().subscribe(result => {
    });
  }

  ngOnInit() {
    // this.loaderService.show(); //commented to avoid overlapping of loaders
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.projectDataService.getProjectDetails(this.projectId).subscribe(res => {
    //
      this.projectDetailsService.setProjectDetails(res);
      this.projectName = res.name;
      this.workflowTimestampObj = res.workflowTimestamp;
    });

    this.isUserPm = this.userService.userRole === 'PM';
    this.service.getAccessibilityForProject(this.projectId);
    this.service.getAccessibilityUpdateListner().subscribe((res) => {
        this.accessibilityObj = res;
        this.betaFlag = res.betaFlag;
        if (res !== undefined) {
          if (res.workflowTimestamp) {
            if (res.workflowTimestamp.releaseVpat) {
              this.sideBar.enableSideBarItems('releaseVpat');
              this.sideBar.switchSidebarTab('releaseVpat');
          } else if (res.workflowTimestamp.prepareVpat || (res.docCentralLinks && res.docCentralLinks.prepareVpat)) {
            this.sideBar.enableSideBarItems('prepareVpat');
            this.sideBar.switchSidebarTab('prepareVpat');
          } else if (res.workflowTimestamp) {
            if (res.workflowTimestamp.policyTesting) {
              if (this.isUserPm) {
                this.sideBar.enableSideBarItems('policyTesting');
                this.sideBar.enableSideBarItems('prepareVpat');
                this.sideBar.switchSidebarTab('policyTesting');
              } else {
                this.sideBar.enableSideBarItems('prepareVpat');
                this.sideBar.switchSidebarTab('prepareVpat');
              }
          } else if (res.workflowTimestamp.implementation && res.implementation) {
                if (res.implementation.sendDetails) {
                  this.sideBar.enableSideBarItems('policyTesting');
                  if (this.isUserPm || res.workflowTimestamp.policyTesting) {
                this.sideBar.switchSidebarTab('policyTesting');
                  } else {
                this.sideBar.switchSidebarTab('implementation');
                  }
           }
        } else if (res.workflowTimestamp.approveAdr) {
          this.sideBar.enableSideBarItems('adrListApproval');
          this.sideBar.switchSidebarTab('adrListApproval');

          if (res.lastUser === 'po' && res.adrStatus === 'approved') {
              this.sideBar.enableSideBarItems('implementation');
              this.sideBar.switchSidebarTab('implementation');
            }

        } else if (res.workflowTimestamp.identifiAdr) {
            this.sideBar.enableSideBarItems('adrListApproval');
            this.sideBar.switchSidebarTab('adrListApproval');
        }
        }

        // to status completion timestamp
            this.updateWorkflowTimestampDiv(res);


      } else {
        this.sideBar.enableSideBarItems('identifyAdrs');
        this.sideBar.switchSidebarTab('identifyAdrs');
      }

      // if (this.isUserPm && !res.skipOverviewPM) {
      //   this.openComponentModal();
      // }
      // if (!this.isUserPm && !res.skipOverviewPO) {
      //   this.openComponentModal();
      // }

    }

        // this.loaderService.hide(); //commented to avoid overlapping of loaders
      }, err => {
        // this.loaderService.hide(); //commented to avoid overlapping of loaders
      });


    this.service.sidebarTabsSubscription().subscribe(itemName => {
        this.sideBar.enableSideBarItems(itemName);
        this.disableNextBtn = false;
        this.service.getUpdatedAccessibilityObj(this.projectId).subscribe(res => {
          this.accessibilityObj = res[0];
          this.updateWorkflowTimestampDiv(this.accessibilityObj);
        });

      });

  }

  ngAfterViewInit() {
    // this.openComponentModal();
  }


  switchSidebarTab(sidebarObj: any): void {
    if (sidebarObj.currentTab.name === 'prepareVpat' && !this.isUserPm && getNestedKeyValue(this.accessibilityObj, 'workflowTimestamp', 'releaseVpat') === undefined) {
      this.nextBtnName = 'Finish';
    } else {
      this.nextBtnName = null;
    }
    this.sidebarData = sidebarObj.sidebarData;
    this.disableNextBtn = sidebarObj.disableNextBtn;
    this.disablePreviousBtn = sidebarObj.disablePreviousBtn;
  }

  onPreviousClick() {
    this.sideBar.onPreviousClick();
  }

  async onNextClick() {
    if (this.sideBar.currentTab === 'prepareVpat' && !this.isUserPm && getNestedKeyValue(this.accessibilityObj, 'workflowTimestamp', 'releaseVpat') === undefined) {
      this.loaderService.show();
      const progressScoreRes = await this.service.updateProgressScore(this.projectId, {progressScore: 100}, 'releaseVpat').toPromise();
      const workflowRes = await this.service.updateWorkflowTimestamp(this.projectId, {step: 'releaseVpat'}).toPromise();
      this.service.enableNextSidebarItem('releaseVpat');
      this.loaderService.hide();
    }
    this.sideBar.onNextClick();
    }

  // handleSendIsPDFFileUploaded(event: boolean) {
  //   if(!this.prepareVpatComponent.pdfComponentState.isFileUploded || !this.prepareVpatComponent.componentState.isFileUploded){
  //     this.disableNextBtn = true;
  //   }
  //   else {
  //     this.disableNextBtn = false;
  //   }
  // }

  // handleSendIsWordFileUploaded(event: boolean) {
  //   if(!this.prepareVpatComponent.pdfComponentState.isFileUploded || !this.prepareVpatComponent.componentState.isFileUploded){
  //           this.disableNextBtn = true;
  //         }
  //     else {
  //       this.disableNextBtn = false;
  //         }
  // }

  updateWorkflowTimestampDiv(accessObj) {
    if (accessObj !== undefined && accessObj.workflowTimestamp) {
      if (accessObj.workflowTimestamp.identifiAdr) {
        this.sidebarData[0].isCompleted = true;
        this.sidebarData[0].completedOn = accessObj.workflowTimestamp.identifiAdr;
      }
      if (accessObj.workflowTimestamp.approveAdr) {
          this.sidebarData[1].isCompleted = accessObj.lastUser === 'po' && accessObj.adrStatus === 'approved';
          this.sidebarData[1].completedOn = accessObj.workflowTimestamp.approveAdr;
      }
      if (accessObj.workflowTimestamp.implementation) {
        this.sidebarData[2].isCompleted = true;
        this.sidebarData[2].completedOn = accessObj.workflowTimestamp.implementation;
      }
      if (accessObj.workflowTimestamp.policyTesting) {
        this.sidebarData[3].isCompleted = true;
        this.sidebarData[3].completedOn = accessObj.workflowTimestamp.policyTesting;
      }
      if (accessObj.workflowTimestamp.prepareVpat) {
        this.sidebarData[4].isCompleted = true;
        this.sidebarData[4].completedOn = accessObj.workflowTimestamp.prepareVpat;
      }
      if (accessObj.workflowTimestamp.releaseVpat) {
        this.sidebarData[5].isCompleted = true;
        this.sidebarData[5].completedOn = accessObj.workflowTimestamp.releaseVpat;
      }
    }
  }

}
