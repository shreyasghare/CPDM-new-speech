import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * Components
 */
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { CustomConfirmationDialogComponent } from '@cpdm-shared/components/custom-confirmation-dialog/custom-confirmation-dialog.component';

/**
 * Models
 */
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { Role } from '@cpdm-model/role';
import { TpsdModel, CoronaAndTpsUrlModel } from '@cpdm-model/general-compliances/tpsd/tpsd.model';
import { TpsdSideBarEventModel } from '@cpdm-model/general-compliances/tpsd/tpsdSideBarEvent.model';

/**
 * Constants
 */
import { tpsdSidebarData } from '@cpdm-shared/constants/sidebar-data';

/**
 * Services
 */
import { TpsdService } from '@cpdm-service/general-compliance/tpsd/tpsd.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

@Component({
  selector: 'app-tpsd',
  templateUrl: './tpsd.component.html',
  styleUrls: ['./tpsd.component.scss']
})
export class TpsdComponent implements OnInit, OnDestroy {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;

  role = Role;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  sidebarData: SidebarDataModel[] = tpsdSidebarData;
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  betaFlag = false;
  tpsdId: string;
  unsubscribe$ = new Subject();
  tpsdData: TpsdModel;
  updateBtnInfo = 'Change the linked Product/Release by entering an existing or creating a new one.';
  confirmationDialogData: { headerText: string, confirmationText: string } = {
    headerText: 'Change TPS Product ID',
    confirmationText: 'Existing Product details will be <strong>unlinked</strong>.<br>Click confirm to continue'
  };
  
  constructor(private dialog: MatDialog,
              private router: Router,
              private toastService: ToastService,
              private activatedRoute: ActivatedRoute,
              private tpsdService: TpsdService ) { }

  ngOnInit() {
    this.tpsdId = this.activatedRoute.snapshot.params.id;
    this.getTpsdData();
  }

  /**
   * @description To get TPSD workfloe data
   */
  private getTpsdData(): void {
    this.tpsdService.getTpsdData(this.tpsdId).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      const { success, data } = res;
      if (success) {
        const { projectDetails: { name }, projectId, betaFlag, isReinitiated } = data;
        this.projectName = name;
        this.projectId = projectId;
        this.betaFlag = betaFlag;
        this.tpsdService.updateTpsdDataWithSubject(data);
        this.tpsdlUpdateObjSub();
        if (!isReinitiated)  {
          const { workflow: { active } } = data;
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
        }
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching TPSCRM Data', 'danger');
    });
  }

  /**
   * @description To get updated response from BehaviourSubject
   */
  private tpsdlUpdateObjSub() {
    this.tpsdService.getTpsdDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      if (res) {
        this.tpsdData = res;
        const { workflow: { active }, isReinitiated } = res;
        this.getCoronaAndTpsUrl();
        if (isReinitiated) {
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(res.workflow.timestamp);
        }
        this.syncBtns(res);
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in updating CSDL data', 'danger');
    });
  }

   /**
   * @description Get URLs for Corona link
   */
    private getCoronaAndTpsUrl() {
      this.tpsdService.getCoronaAndTpsURL().pipe(takeUntil(this.unsubscribe$)).subscribe((res: { success: boolean, data: CoronaAndTpsUrlModel }) => {
        if (res.success && res.data) {
          const { coronaUrl, tpsUrl } = res.data;
          this.tpsdService.updateCoronaTpsUrlDataSource({ coronaUrl, tpsUrl });
        }
      }, () => {
        this.toastService.show('Error', 'Unable to navigate to Corona', 'danger');
      });
    }

  /**
   * @description To manage footer buttons
   */
  private syncBtns(data: TpsdModel): void {
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
    const syncWorkflow = (result) => {
      const { success, data } = result;
      this.tpsdService.updateTpsdDataWithSubject(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.tpsdData.workflow.timestamp && this.tpsdData.workflow.timestamp[this.currentTabName])) {
      let progressScore: number;
      let completedStep: string;
      switch (this.currentTabName) {
        case 'create_link': {
          completedStep = 'Create/Link';
          progressScore = 10;
        break;
        }
        case 'discover_register_execute': {
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
   async updateWorkflow(progressScore: number, stepName: string): Promise<{ success: boolean, data: TpsdModel }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName,      
      "sendEmail": stepName == "Create/Link" ? true : false,
      projectId: this.projectId
    };
    return this.tpsdService.updateTpsdObject(this.tpsdId, updateObj).toPromise();
  }

  /**
   * @description Help overlay modal
   */
  openHelpOverlayModal() {
    const complianceData = { title: 'Third Party Software Compliance & Risk Management (TPSCRM)', name: 'tpsd' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '58vh',
      width: '60vw',
      data: { complianceData, isLargeModal: true }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }

  /**
   * @description Info Helper modal
   */
  showInfoHelperModal(obj: any) {
    let { alias: stepName, size } = obj;
    const tpsdInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'tpsd', stepName }
    });
    tpsdInfoHelper.afterClosed();
  }

  /**
   * @description To manage the sidebar on switching the steps
   */
  switchSidebarTab(sidebarObj: TpsdSideBarEventModel): void {
    const { sidebarData, currentTab } = sidebarObj;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.tpsdData.workflow.timestamp, this.tpsdData.workflow.active, this.tpsdData.workflow.next);
  }

  /**
   * @description To get an active step with lazy-loading
   */
  private loadActiveTab(currentTabName: string): void {
    this.currentTabName = currentTabName;
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }

  /**
   * @description Allows to change Product ID by unlinking existing ID
   */
  changeProduct() {
    const config = {
      data: this.confirmationDialogData,
      width: '50rem'
    };
    const dialogRef = this.dialog.open(CustomConfirmationDialogComponent, config);
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      const requestObject = {
        workflow : {
          active : "create_link",
          next : "create_link"
        },
        approvedDetails : {
          state : false,
          comments : null,
          userId : null
        },
        productState: 'RED',
        isProjectLinked: false,
        isReinitiated: true,
        progressScore: 0,
        stepName: 'Started'
      };

      this.tpsdService.updateTpsdObject(this.tpsdId, requestObject).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        if (res.success) {
          dialogRef.close(res);
        }
      }, () => {
        this.toastService.show('Error in product change', 'Error in changing TPSCRM product', 'danger');
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.tpsdService.updateTpsdDataWithSubject(result.data);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
