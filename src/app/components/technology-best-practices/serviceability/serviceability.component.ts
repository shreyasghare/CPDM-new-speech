import { ViewChild } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
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

/**
 * Services
 */
import { ServiceabilityService } from '@cpdm-service/technology-best-practices/serviceability/serviceability.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
/**
 * Constants
 */
import { sidebarData } from '@cpdm-shared/constants/sidebar-data';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
/**
 * Models
 */
import { ServiceabilityModel } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { ServiceabilitySideBarEventModel } from '@cpdm-model/technology-best-practices/serviceability/serviceabilitySideBarEvent.model';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
@Component({
  selector: 'app-serviceability',
  templateUrl: './serviceability.component.html',
  styleUrls: ['./serviceability.component.scss']
})
export class ServiceabilityComponent implements OnInit, OnDestroy {
  @ViewChild(ProcessSidebarComponent, { static: true })

  sideBar: ProcessSidebarComponent;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  sidebarData: SidebarDataModel[] = sidebarData;
  serviceabilityDataSubscription: Subscription;
  serviceabilitySubDataSubscription: Subscription;
  serviceabilityId: string = null;
  confirmationObjForReinitiate: { confirmationText: string } = {
    confirmationText: 'Are you sure you want to re-initiate?'
  };
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  serviceabilityData: ServiceabilityModel;
  isReinitiateEnabled: boolean;
  betaFlag = false;
  ReinitiateSubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
    private dialog: MatDialog, private router: Router,
    private serviceabilityService: ServiceabilityService, private toastService: ToastService) { }

  ngOnInit() {
    this.serviceabilityId = this.activatedRoute.snapshot.params.id;
    this.serviceabilityService.setServiceabilityId(this.serviceabilityId);
    this.getServiceabilityData();
  }
  /**
   * Get ' Serviceability ' data
   */
  getServiceabilityData() {
    this.serviceabilityDataSubscription = this.serviceabilityService.getServiceabilityData(this.serviceabilityId).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.serviceabilityData = data;
        this.betaFlag = data.betaFlag;
        const { workflow: { active }, projectDetails: { name }, projectId } = data;
        this.projectId = projectId;
        this.projectName = name;
        this.serviceabilityUpdateObjSub();
        this.serviceabilityService.updateServiceabilityData(data);
        
        this.sideBar.enableSideBarItems(active);

        this.sideBar.switchSidebarTab(active);
        this.loadActiveTab(active);
        this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in fetching serviceability data', 'danger');
    });
  }
  private loadActiveTab(currentTabName: string): void {
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }
  openHelpOverlayModal() {
    const complianceData = { title: 'Serviceability', name: 'serviceability' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '55vw',
      data: { complianceData }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }
  /**
   * Modal for icons of process side bar
   */
  showModal(obj: any): void {
    const {  alias: stepName, size } = obj;
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'serviceability', stepName}
    });
    accInfoHelper.afterClosed();
  }

  switchSidebarTab(sidebarObj: ServiceabilitySideBarEventModel): void {
    const { sidebarData, currentTab, disablePreviousBtn, disableNextBtn } = sidebarObj;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.serviceabilityData.workflow.timestamp,
      this.serviceabilityData.workflow.active, this.serviceabilityData.workflow.next);
  }
  private disableNextButton(timestamp: object, active: string, next: string): void {
    if (next !== active) { this.disableNextBtn = false; }
    else if (timestamp && timestamp[this.currentTabName]) {
      this.disableNextBtn = false;
    } else { this.disableNextBtn = true; }
  }
  /**
   * Update serviceability subscription
   */
  private serviceabilityUpdateObjSub() {
    this.serviceabilitySubDataSubscription = this.serviceabilityService.getServiceabilityDataSub.subscribe(res => {
      if (res !== null) {
        this.serviceabilityData = res;
        this.syncBtns(res);
      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in updating serviceability data', 'danger');
    });
  }
  private syncBtns(data: ServiceabilityModel): void {
    const { workflow: { active, next, timestamp } } = data;
    this.isReinitiateEnabled = getNestedKeyValue(timestamp, 'plan') ? true : false;
    this.nextWorkflow = next;
    this.activeWorkflow = active;
    this.disableNextButton(timestamp, active, next);
  }

  onPreviousClick(): void {
    this.sideBar.onPreviousClick();
  }

  onNextClick(): void {
    const syncWorkflow = (result) => {
      const { success, data } = result;
      this.serviceabilityService.updateServiceabilityData(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.serviceabilityData.workflow.timestamp && this.serviceabilityData.workflow.timestamp[this.currentTabName])) {
      let progressScore: number;
      let completedStep: string;
      switch (this.currentTabName) {
        case 'plan': {
          completedStep = 'Plan';
          progressScore = 10;
          break;
        }
        case 'implement': {
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
    data: ServiceabilityModel
  }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName
    };
    return this.serviceabilityService.updateServiceabilityObject(this.serviceabilityId, updateObj).toPromise();
  }
  ngOnDestroy() {
    if (this.serviceabilityDataSubscription) {
      this.serviceabilityDataSubscription.unsubscribe();
    }
    if(this.serviceabilitySubDataSubscription) {
      this.serviceabilitySubDataSubscription.unsubscribe();
    }
  }


  onReinitiate() {
    const confirmationText = 'Are you sure you want to re-initiate?';
    const options = { data: {confirmationText}, width: '35vw', height: 'auto', disableClose: true };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, options);
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      const updateObject = {
        workflow: {
          active: 'plan',
          next: 'plan'
        }
      };
      const { recommendationStatus } = this.serviceabilityData;
      if (recommendationStatus === 'saved') { updateObject.workflow.next = 'implement'; }

      this.ReinitiateSubscription =
      this.serviceabilityService.reinitiate(this.serviceabilityId, updateObject).subscribe(res => {
        const { data } = res;
        dialogRef.close(data);
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getServiceabilityData();
    });
  }
}
