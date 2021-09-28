import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TelemetryService } from '@cpdm-service/technology-best-practices/telemetry/telemetry.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';

/**
 * Component
 */
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';

/**
 * Model
 */
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { TelemetryModel } from '@cpdm-model/technology-best-practices/telemetry/telemetry.model';
import { TelemetrySideBarEventModel } from '@cpdm-model/technology-best-practices/telemetry/telemetrySideBarEvent.model';

//constants
import { sidebarData } from '@cpdm-shared/constants/sidebar-data';

@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.scss']
})
export class TelemetryComponent implements OnInit, OnDestroy {
  @ViewChild(ProcessSidebarComponent, { static: true })

  sideBar: ProcessSidebarComponent;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  sidebarData: SidebarDataModel[] = sidebarData;
  telemetryDataSubscription: Subscription;
  telemetrySubDataSubscription: Subscription;
  telemetryReinitiateSubscription: Subscription;
  telemetryId: string = null;
  confirmationObjForReinitiate: { confirmationText: string } = {
    confirmationText: 'Are you sure you want to re-initiate?'
  };
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  telemetryData: TelemetryModel;
  isReinitiateEnabled: boolean;
  infoHelperData: any;
  betaFlag:boolean = false;
  constructor(private activatedRoute: ActivatedRoute, public dialog: MatDialog,
    private router: Router, private telemetryService: TelemetryService) { }

  /**
   * on init
   */
  ngOnInit() {
    this.telemetryId = this.activatedRoute.snapshot.params.id;
    // Setting telemetry id to service as it will not be available to child components
    this.telemetryService.setTelemetryId(this.telemetryId);
    this.getTelemetryData();
  }
  /**
   * on destroy
   */
  ngOnDestroy(): void {
    if (this.telemetryDataSubscription) {
      this.telemetryDataSubscription.unsubscribe();
    }
    if (this.telemetrySubDataSubscription) {
      this.telemetrySubDataSubscription.unsubscribe();
    }
    if (this.telemetryReinitiateSubscription) {
      this.telemetryReinitiateSubscription.unsubscribe();
    }
  }
  /**
   * 
   * @param sidebarObj 
   */
  switchSidebarTab(sidebarObj: TelemetrySideBarEventModel): void {
    const { sidebarData, currentTab, disablePreviousBtn, disableNextBtn } = sidebarObj;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.telemetryData.workflow.timestamp, this.telemetryData.workflow.active, this.telemetryData.workflow.next);
  }
  /**
   * 
   * @param currentTabName 
   */
  private loadActiveTab(currentTabName: string): void {
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }
  /**
   * 
   * @param timestamp 
   * @param active 
   * @param next 
   */
  private disableNextButton(timestamp: object, active: string, next: string): void {
    if (next !== active) { this.disableNextBtn = false; }
    else if (timestamp && timestamp[this.currentTabName]) {
      this.disableNextBtn = false;
    } else { this.disableNextBtn = true; }
  }
  /**
   * Modal for icons of process side bar
   */
  showModal(obj: any): void {
    const { alias: stepName, size } = obj;
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'telemetry', stepName }
    });
    accInfoHelper.afterClosed();
  }
  /**
   * Shared component for Help Overlay.
   */
  openHelpOverlayModal(): void {
    const complianceData = { title: 'Telemetry', name: 'telemetry' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '50vw',
      data: { complianceData }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }
  onPreviousClick(): void {
    this.sideBar.onPreviousClick();
  }

  onNextClick(): void {
    const syncWorkflow = (result) => {
      const { success, data } = result;
      this.telemetryService.updateTelemetryData(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.telemetryData.workflow.timestamp && this.telemetryData.workflow.timestamp[this.currentTabName])) {
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
    data: TelemetryModel
  }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName
    };
    return this.telemetryService.updateTelemetryObject(this.telemetryId, updateObj).toPromise();
  }
  /**
   * Get telemetry data
   */
  private getTelemetryData(): void {
    this.telemetryDataSubscription = this.telemetryService.getTelemetryData(this.telemetryId).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.telemetryData = data;
        this.betaFlag = data.betaFlag;
        const { workflow: { active }, projectDetails: { name }, projectId } = data;
        this.projectId = projectId;
        this.projectName = name;
        this.telemetryUpdateObjSub();
        this.telemetryService.updateTelemetryData(data);
        this.sideBar.enableSideBarItems(active);
        this.sideBar.switchSidebarTab(active);
        this.loadActiveTab(active);
        this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      }
    }, (error) => {
      this.router.navigate([`/**`]);
    });
  }
  /**
   * Update telemetry subscription
   */
  private telemetryUpdateObjSub() {
    this.telemetrySubDataSubscription = this.telemetryService.getTelemetryDataSub.subscribe(res => {
      if (res !== null) {
        this.telemetryData = res;
        this.syncBtns(res);
      }
    }, (error) => {
      this.router.navigate([`/**`]);
    });
  }
  private syncBtns(data: TelemetryModel): void {
    const { workflow: { active, next, timestamp } } = data;
    this.isReinitiateEnabled = getNestedKeyValue(timestamp, 'plan') ? true : false;
    this.nextWorkflow = next;
    this.activeWorkflow = active;
    this.disableNextButton(timestamp, active, next);
  }
  
  onReinitiate() {
    const options = { data: this.confirmationObjForReinitiate, width: '35vw', height: 'auto', disableClose: true };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, options);
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      const updateObject = {
        workflow: {
          active: 'plan',
          next: 'plan'
        }
      };
      const { recommendationStatus } = this.telemetryData;
      if (recommendationStatus === 'saved') { updateObject.workflow.next = 'implement'; }

      this.telemetryReinitiateSubscription = this.telemetryService.reinitiateTelemetry(this.telemetryId, updateObject).subscribe(res => {
        const { data } = res;
        dialogRef.close(data);
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getTelemetryData();
    });
  }
  toggleFilter() {

  }
}
