import { Component, OnInit, ViewChild } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Components
 */
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

/**
 * Modules
 */
import { MatDialog } from '@angular/material';
import { CustomConfirmationDialogComponent } from '@cpdm-shared/components/custom-confirmation-dialog/custom-confirmation-dialog.component';

/**
 * Services
 */
import { ToastService } from '@cpdm-service/shared/toast.service';
/**
 * Constants
 */
import { csdlSidebarData } from '@cpdm-shared/constants/sidebar-data';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
/**
 * Models
 */
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { CsdlSideBarEventModel } from '@cpdm-model/general-compliances/csdl/csdlSideBarEvent.model';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { CsdlModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

@Component({
  selector: 'app-csdl',
  templateUrl: './csdl.component.html',
  styleUrls: ['./csdl.component.scss']
})
export class CsdlComponent implements OnInit {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;

  role = Role;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  sidebarData: SidebarDataModel[] = csdlSidebarData;
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  betaFlag = false;
  csdlData: CsdlModel;
  csdlID: string = null;
  csdlDataSubscription: Subscription;
  csdlSubDataSubscription: Subscription;
  csdlSubForStepSubscription: Subscription;
  footerTextForNext: string;
  showLoader = false;
  currentRole: string;
  updateConfirmationData: { headerText: string, confirmationText: string } = {
    headerText: 'Confirm Action',
    confirmationText: "Select 'Confirm' to update the CSDL ID linked to the project.<br> Select 'Cancel' to close this window."
  };
  
  constructor(private dialog: MatDialog, private router: Router, 
    private activatedRoute: ActivatedRoute, private csdlService: CsdlService, 
    private toastService: ToastService, private userDetailsService: UserDetailsService) {
       this.csdlDataSubscription = this.csdlService.getSwitchToStepEvent$().subscribe((stepName) => {
         this.sideBar.switchSidebarTab(stepName);
       });
  }

  ngOnInit() {
    this.csdlID = this.activatedRoute.snapshot.params.id;
    this.currentRole = this.userDetailsService.userRole;
    this.csdlService.setCsdlID(this.csdlID);
    this.getCsdlData();
  }
  /**
   * Get ' CSDL ' data
   */
  getCsdlData() {
    this.showLoader = true;
    this.csdlDataSubscription = this.csdlService.getCsdlData(this.csdlID).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.csdlData = data;
        this.betaFlag = data.betaFlag;
        const { workflow: { active }, projectDetails: { name }, projectId, isCSDLIdUpdated } = data;
        this.projectId = projectId;
        this.projectName = name;
        this.csdlService.setCsdlPlanData(null);
        this.csdlService.updateCsdlData(data);
        this.csdlUpdateObjSub();        
        if (!isCSDLIdUpdated)  {
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
        } 

      }
      this.showLoader = false;
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in fetching csdl data', 'danger');
      this.showLoader = false;
    });
  }
  /**
   * Update csdl subscription  
   */
  private csdlUpdateObjSub() {
    this.csdlSubDataSubscription = this.csdlService.getCsdlDataSub.subscribe(res => {
      if (res !== null) {
        const { workflow: { active }, isCSDLIdUpdated} = res;
        res.projectName = this.projectName? this.projectName:'';
        this.csdlData = res;        
        if(isCSDLIdUpdated ) {
         this.sideBar.enableSideBarItems(active);
         this.sideBar.switchSidebarTab(active);
         this.loadActiveTab(active);
         this.sideBar.updateWorkflowTimestamp(res.workflow.timestamp);       
        }
        this.syncBtns(res);  
      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in updating CSDL data', 'danger');
    });
  }

  private syncBtns(data: CsdlModel): void {
    const { workflow: { active, next, timestamp } } = data;
    this.nextWorkflow = next;
    this.activeWorkflow = active;
    this.disableNextButton(timestamp, active, next);
  }
  onPreviousClick(): void {
    this.sideBar.onPreviousClick();
  }
  onNextClick(): void {
    if (this.currentTabName === this.sidebarData[1].alias) { this.disableNextBtn = true; }
    const syncWorkflow = (result) => {
      const { success, data } = result;
      this.csdlService.updateCsdlData(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.csdlData.workflow.timestamp && this.csdlData.workflow.timestamp[this.currentTabName])) {
      let progressScore: number;
      let completedStep: string;
      switch (this.currentTabName) {
        case 'create': {
          completedStep = 'Create';
          progressScore = 10;
          break;
        }
        case 'plan_execute': {
          completedStep = 'Complete';
          progressScore = 100;
          break;
        }
      }
      (async () => {
        const data = await this.updateWorkflow(progressScore, completedStep);
        syncWorkflow(data);
      })();
    } else {
      this.sideBar.onNextClick();
    }
  }
  /**
   * 
   * @param progressScore 
   * @param stepName 
   */
  async updateWorkflow(progressScore: number, stepName: string): Promise<{
    success: boolean,
    data: CsdlModel
  }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName
    };
    return this.csdlService.updateCsdlObject(this.csdlID, updateObj).toPromise();
  }

  /**
   * Open overview modal
   */
  openHelpOverlayModal() {
    const complianceData = { title: 'CSDL', name: 'csdl' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '60vw',
      data: { complianceData, isLargeModal: true }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }
  /**
   * Modal for icons of process side bar
   */
  showModal(obj: any): void {
    const { alias: stepName, size } = obj;
    const csdlInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'csdl', stepName }
    });
    csdlInfoHelper.afterClosed();
  }

  switchSidebarTab(sidebarObj: CsdlSideBarEventModel): void {
    const { sidebarData, currentTab, disablePreviousBtn, disableNextBtn } = sidebarObj;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.csdlData.workflow.timestamp,
      this.csdlData.workflow.active, this.csdlData.workflow.next);
  }

  private loadActiveTab(currentTabName: string): void {
    this.currentTabName = currentTabName;
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }

  private disableNextButton(timestamp: object, active: string, next: string): void {
    if (next !== active && this.currentRole === 'PM') { this.disableNextBtn = false; }
    else if (timestamp && timestamp[this.currentTabName]) {
      this.disableNextBtn = false;
      this.getFooterTextForNext();
    } else { this.disableNextBtn = true; }
    this.disableNextBtn && this.currentTabName === this.sidebarData[1].alias 
                    ? this.getFooterTextForNext() : this.footerTextForNext = '';
  }

  private getFooterTextForNext() {
    if (this.sidebarData && this.activeWorkflow === this.sidebarData[1].alias && this.nextWorkflow === this.sidebarData[1].alias) {
      [this.footerTextForNext] = this.sidebarData.filter(obj => obj.alias === this.activeWorkflow).map(obj => obj.footerTextForNext);
    }
  }

  ngOnDestroy() {
    if (this.csdlDataSubscription) {
      this.csdlDataSubscription.unsubscribe();
    }
    if(this.csdlSubDataSubscription) {
      this.csdlSubDataSubscription.unsubscribe();
    }
    if (this.csdlSubForStepSubscription) { this.csdlSubForStepSubscription.unsubscribe() }
  }

   /**
   * @description To update the CSDL Id 
   */
    onUpdateCSDLId(): void {
      const dialogRef = this.dialog.open(CustomConfirmationDialogComponent, {
        data: this.updateConfirmationData,
        width: '50rem'
      });
       dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
        
        const updateReq = {
          workflow : {
            active : "create",
            next : "create"
          },
          isCSDLIdLinked: false,
          isCSDLIdUpdated: true,
          isNewCsdlProject: false,
          progressScore: 0,
          stepName: 'Started',
          projectId: this.projectId
        }
  
        this.csdlService.updateCSDL(this.csdlID, updateReq).subscribe((res) => {
          if (res.success) {
            dialogRef.close(res);
          }
        }, () => {
          this.toastService.show('Error in update', 'Error in updating CSDL ID', 'danger');
        });
       });
  
      dialogRef.afterClosed().subscribe((result) => {
        const { success, data } = result;
        this.csdlService.updateCsdlData(data);
      });
    }
} 
