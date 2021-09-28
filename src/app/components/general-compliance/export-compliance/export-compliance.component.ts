import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { CmtToolUrlModel, ExportComplianceModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';
import { ExportComplianceSideBarEventModel } from '@cpdm-model/general-compliances/export-compliance/exportComplianceSideBarEvent.model';
import { Role } from '@cpdm-model/role';
import { ExportComplianceService } from '@cpdm-service/general-compliance/export-compliance/export-compliance.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CustomConfirmationDialogComponent } from '@cpdm-shared/components/custom-confirmation-dialog/custom-confirmation-dialog.component';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { exportComplianceSidebarModel } from '@cpdm-shared/constants/exportComplianceSidebarModel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-export-compliance',
  templateUrl: './export-compliance.component.html',
  styleUrls: ['./export-compliance.component.scss']
})
export class ExportComplianceComponent implements OnInit, OnDestroy {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;

  role = Role;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  eprProjectId: string;
  sidebarData = new exportComplianceSidebarModel().exportComplianceSidebarData;
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  betaFlag = false;
  exportComplianceId: string;
  unsubscribe$ = new Subject();
  exportComplianceData: ExportComplianceModel;
  updateConfirmationData: { headerText: string, confirmationText: string } = {
    headerText: 'Update EPR ID',
    confirmationText: 'Please note, this will allow you to link a different product in CMT to CPDM Central. To manage your CMT product please visit the Classification Management Tool (CMT)'
  };
  isEprIdUpdated: boolean;
  isEPRProjectLinked: boolean;

  
  constructor(private dialog: MatDialog,private router: Router,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private exportComplianceService: ExportComplianceService) { }

  ngOnInit() {
    this.exportComplianceId = this.activatedRoute.snapshot.params.id;
    this.getExportComplianceData();
  }

  /**
   * @description To get Export Compliance Data
   */
  private getExportComplianceData(): void {
    this.exportComplianceService.getExportComplianceData(this.exportComplianceId).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      const { success, data } = res;
      if (success) {
        const { workflow: { active }, projectDetails: { name }, projectId, betaFlag, isEprIdUpdated } = data;
        this.projectName = name;
        this.projectId = projectId;
        this.betaFlag = betaFlag;
        this.exportComplianceService.updateEcDataWithSubject(data);
        this.exportComplianceUpdateSub();
        if (!isEprIdUpdated) {
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
        }
      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in fetching Export Compliance data', 'danger');
    });
  }

  /**
   * @description To get updated response from behaviourSubject
   */
  private exportComplianceUpdateSub (): void {
    this.exportComplianceService.getExportComplianceDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res) {
        this.exportComplianceData = res;
        const { workflow: { active }, eprProjectId, isEPRProjectLinked, isEprIdUpdated, isWorkflowInProgress = null } = res;
        this.eprProjectId = eprProjectId;
        this.isEPRProjectLinked = isEPRProjectLinked;
        this.generateCMTToolURL();
        if (isEprIdUpdated || isWorkflowInProgress) {
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(res.workflow.timestamp);
          if (isWorkflowInProgress) {
            this.exportComplianceService.updateExportComplianceObject(this.exportComplianceId, { isWorkflowInProgress: false, projectId: this.projectId, sendMail: false }).toPromise();
          }
        }
        this.syncBtns(res);
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in updating CSDL data', 'danger');
    });
  }

  /**
   * @description Get URLs for CMT Tool
   */
  private generateCMTToolURL() {
    this.exportComplianceService.getCMTToolURL().pipe(takeUntil(this.unsubscribe$)).subscribe((res: { success: boolean, data: CmtToolUrlModel }) => {
      if (res.success && res.data) {
        const { createProjectUrl, openProjectUrl } = res.data;
        this.exportComplianceService.updateCMTToolUrlDataSource({ createProjectUrl, openProjectUrl, eprProjectId: this.eprProjectId });
      }
    }, () => {
      this.toastService.show('Error', 'Unable to navigate to CMT Tool', 'danger');
    });
  }

  /**
   * @description To manage footer buttons
   */
  private syncBtns(data: ExportComplianceModel): void {
    const { workflow: { active, next, timestamp } } = data;
    this.nextWorkflow = next;
    this.activeWorkflow = active;
    this.disableNextButton(timestamp, active, next);
  }

  /**
   * @description To disable NEXT footer button
   */
  private disableNextButton(timestamp: object, active: string, next: string): void {
    if (next !== active) { this.disableNextBtn = false; }
    else if (timestamp && timestamp[this.currentTabName]) {
      this.disableNextBtn = false;
    } else { this.disableNextBtn = true; }
  }

  /**
   * @description To get an event on PREVIOUS footer button click from sidebar component
   */
  onPreviousClick(): void {
    this.sideBar.onPreviousClick();
  }

    /**
   * @description To manage an event on click of NEXT footer button
   */
  onNextClick(): void {
    if (this.currentTabName === this.sidebarData[1].alias) { this.disableNextBtn = true; }
    const syncWorkflow = (result) => {
      const { data } = result;
      this.exportComplianceService.updateEcDataWithSubject(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.exportComplianceData.workflow.timestamp && this.exportComplianceData.workflow.timestamp[this.currentTabName])) {
      let progressScore: number;
      let completedStep: string;
      switch (this.currentTabName) {
        case 'link_generate': {
          completedStep = 'Link/Generate';
          progressScore = 10;
          break;
        }
        case 'submit_assign_classify': {
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
   * @param progressScore 
   * @param stepName 
   */
    async updateWorkflow(progressScore: number, stepName: string): Promise<{ success: boolean, data: ExportComplianceModel }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName,      
      projectId: this.projectId,
      sendMail:true
    };
    return this.exportComplianceService.updateExportComplianceObject(this.exportComplianceId, updateObj).toPromise();
  }

  /**
   * @description Help overlay modal
   */
  openHelpOverlayModal() {
    const complianceData = { title: 'Export Compliance', name: 'export-compliance' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '60vw',
      data: { complianceData, isLargeModal: true }
    });
    helpOverlayModal.afterClosed();
  }
  
  /**
   * @description Info Helper modal
   */
  showInfoHelperModal(obj: any) {
    let { alias: stepName, size} = obj;
    const exportComplianceInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'export-compliance', stepName }
    });
    exportComplianceInfoHelper.afterClosed();
  }

  /**
   * @description To manage the sidebar on switching the steps
   */
  switchSidebarTab(sidebarObj: ExportComplianceSideBarEventModel): void {
    const { sidebarData, currentTab } = sidebarObj;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.exportComplianceData.workflow.timestamp,
                           this.exportComplianceData.workflow.active,
                           this.exportComplianceData.workflow.next);
  }
  
  /**
   * @description To get an active step with lazy-loading
   */
  private loadActiveTab(currentTabName: string): void {
    this.currentTabName = currentTabName;
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }

  /**
   * @description To update the EPR Id 
   */
  onUpdateEprId(): void {
    const dialogRef = this.dialog.open(CustomConfirmationDialogComponent, {
      data: this.updateConfirmationData,
      width: '50rem'
    });
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      const updateReq = {
        workflow : {
          active : "link_generate",
          next : "link_generate"
        },
        isEPRProjectLinked: false,
        isEprIdUpdated: true,
        progressScore: 0,
        stepName: 'Started',
        projectId: this.projectId
      }

      this.exportComplianceService.updateEprId(this.exportComplianceId, updateReq).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
        if (res.success) {
          dialogRef.close(res);
        }
      }, () => {
        this.toastService.show('Error in update', 'Error in updating EPR ID', 'danger');
      });
    });

    dialogRef.afterClosed().subscribe((result) => {
      const { success, data } = result;
      this.exportComplianceService.updateEcDataWithSubject(data);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.sidebarData = null;
  }
}
