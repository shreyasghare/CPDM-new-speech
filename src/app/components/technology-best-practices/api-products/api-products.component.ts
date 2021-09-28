import { Component, OnInit, ViewChild } from '@angular/core';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { Subscription } from 'rxjs';
import { ApiProductsModel } from '@cpdm-model/technology-best-practices/api-products/apiProducts.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ApiProductsSideBarEventModel } from './models/apiProductsSidebarEventModel';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { ApiProductsService } from '@cpdm-service/technology-best-practices/api-products/api-products.service';
import { sidebarData } from '@cpdm-shared/constants/sidebar-data';

@Component({
  selector: 'app-api-products',
  templateUrl: './api-products.component.html',
  styleUrls: ['./api-products.component.scss']
})
export class ApiProductsComponent implements OnInit {
  @ViewChild(ProcessSidebarComponent, { static: true })

  sideBar: ProcessSidebarComponent;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  infoHelperData: any;
  sidebarData: SidebarDataModel[] = sidebarData;
  apiProductsId: string;
  apiProductsDataSubscription: Subscription;
  apiProductsSubDataSubscription: Subscription;
  apiProductsReinitiateSubscription: Subscription;
  confirmationObjForReinitiate: { confirmationText: string } = {
    confirmationText: 'Are you sure you want to re-initiate?'
  };
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  apiProductsData: ApiProductsModel;
  isReinitiateEnabled: boolean;
  betaFlag = false;

  constructor(private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private service: ApiProductsService) { }

  ngOnInit() {
    this.apiProductsId = this.route.snapshot.params.id;

    // Setting api-products id to service as it will be unavailable to child components
    this.service.setApiProductsId(this.apiProductsId);
    this.getApiProductsData();
  }

  private getApiProductsData(): void {
    this.apiProductsDataSubscription = this.service.getApiProductsData(this.apiProductsId).subscribe(res => {
      const { success, data } = res;
      if (success) {
        this.apiProductsData = data;
        this.betaFlag = data.betaFlag;
        const { workflow: { active }, projectDetails: { name }, projectId } = data;
        this.projectId = projectId;
        this.projectName = name;
        this.apiProductsUpdateObjSub();
        this.service.updateApiProductsData(data);
        this.sideBar.enableSideBarItems(active);
        this.sideBar.switchSidebarTab(active);
        this.loadActiveTab(active);
        this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      }
    });
  }

  private apiProductsUpdateObjSub() {
    this.apiProductsSubDataSubscription = this.service.getApiProductsDataSub.subscribe(res => {
      if (res != null) {
        this.apiProductsData = res;
        this.syncBtns(res);
      }
    });
  }

  private syncBtns(data: ApiProductsModel): void {
    const { workflow: { active, next, timestamp } } = data;
    this.isReinitiateEnabled = getNestedKeyValue(timestamp, 'plan') ? true : false;
    this.nextWorkflow = next;
    this.activeWorkflow = active;
    this.disableNextButton(timestamp, active, next);
  }

  private disableNextButton(timestamp: Object, active: string, next: string): void {
    if (next != active) { this.disableNextBtn = false; } else if (timestamp && timestamp[this.currentTabName]) { this.disableNextBtn = false; } else { this.disableNextBtn = true; }
  }

  switchSidebarTab(sidebarObj: ApiProductsSideBarEventModel): void {
    const { sidebarData, currentTab, disablePreviousBtn, disableNextBtn } = sidebarObj;
    // this.disablePreviousBtn = disablePreviousBtn;
    this.sidebarData = sidebarData;
    this.currentTabName = currentTab.name;
    this.loadActiveTab(currentTab.name);
    this.disableNextButton(this.apiProductsData.workflow.timestamp, this.apiProductsData.workflow.active, this.apiProductsData.workflow.next);
  }

  private loadActiveTab(currentTabName: string): void {
    this.router.navigate([currentTabName], { relativeTo: this.route });
  }

  openComponentModal(): void {
    const complianceData = { title: 'API Products', name: 'apiProducts' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '75vh',
      width: '50vw',
      data: { complianceData },
      panelClass: 'tbp-container'
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
      this.service.updateApiProductsData(data);
      this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
      this.sideBar.enableSideBarItems(data.workflow.active);
      this.sideBar.onNextClick();
    };

    if (!(this.apiProductsData.workflow.timestamp && this.apiProductsData.workflow.timestamp[this.currentTabName])) {
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

  async updateWorkflow(progressScore: number, stepName: string): Promise<{ success: boolean, data: ApiProductsModel }> {
    const updateObj = {
      'workflow.active': this.nextWorkflow,
      [`workflow.timestamp.${this.currentTabName}`]: new Date,
      progressScore,
      stepName
    };
    return this.service.updateApiProductsObject(this.apiProductsId, updateObj).toPromise();
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
      data: { workflowName: 'apiProducts', stepName }
    });
    accInfoHelper.afterClosed();
  }

  onReinitiate() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data: this.confirmationObjForReinitiate, width: '35vw', height: 'auto', disableClose: true });
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      const updateObject = {
        workflow: {
          active: 'plan',
          next: 'plan'
        }
      };
      const { recommendationStatus } = this.apiProductsData;
      if (recommendationStatus === 'saved') { updateObject.workflow.next = 'implement'; }

      this.apiProductsReinitiateSubscription = this.service.reinitiateApiProducts(this.apiProductsId, updateObject).subscribe(res => {
        const { data } = res;
        dialogRef.close(data);
      });
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getApiProductsData();
    });
  }

  ngOnDestroy(): void {
    if (this.apiProductsDataSubscription) {
      this.apiProductsDataSubscription.unsubscribe();
    }
    if (this.apiProductsSubDataSubscription) {
      this.apiProductsSubDataSubscription.unsubscribe();
    }
    if (this.apiProductsReinitiateSubscription) {
      this.apiProductsReinitiateSubscription.unsubscribe();
    }
  }
}

// -----------------------------------Important do not remove this code --------------------------------------
 // const activeSidebarObj = this.sidebarData.filter(obj => { return  obj.alias == this.currentTabName; });
    // if(this.activeWorkflow === 'plan'){
    //   const dialogRef = this.dialog.open(ConfirmationDialogComponent,
    //     {data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });
    //     dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
    //     const data = await this.updateWorkflow(activeSidebarObj[0]['title']);
    //     dialogRef.close(data)
    //   });

    //   dialogRef.afterClosed().subscribe(result => {
    //     syncWorkflow(result)
    //   });

    // }else if(this.activeWorkflow === 'implement'){
    //   (async () => {
    //     const data = await this.updateWorkflow(activeSidebarObj[0]['title']);
    //     syncWorkflow(data);
    //   })() ;
    // }