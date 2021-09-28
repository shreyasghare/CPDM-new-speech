import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
// Constants
import { sidebarData } from '@cpdm-shared/constants/sidebar-data';
// Services
import { ToastService } from '@cpdm-service/shared/toast.service';
import { IPv6Service } from '@cpdm-service/technology-best-practices/ipv6/ipv6.service';
// Components
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
// Models
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';
import { IPv6Model } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { IPv6SidebarEventModel } from '@cpdm-model/technology-best-practices/ipv6/ipv6SidebarEvent.model';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-ipv6',
    templateUrl: './ipv6.component.html',
    styleUrls: ['./ipv6.component.scss']
})
export class IPv6Component implements OnInit, OnDestroy {
    @ViewChild(ProcessSidebarComponent, { static: true })
    sideBar: ProcessSidebarComponent;
    sidebarData: SidebarDataModel[] = sidebarData;
    IPv6Details: IPv6Model;
    IPv6DetailsSubscription: Subscription;
    IPv6Id: string;
    currentTabName: string;
    disableNextBtn = true;
    isReinitiateEnabled = false;
    betaFlag = false;
    infoHelperData: any;
    ReinitiateSubscription: Subscription;
    nextWorkflow: any;
    activeWorkflow: string;
    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private ipv6Service: IPv6Service,
                private toastService: ToastService,
                private dialog: MatDialog) { }

    ngOnInit() {
        this.IPv6Id = this.activatedRoute.snapshot.params.id;
        this.getIPv6Details();
    }

    /**
    * Get IPv6 Details
    */
    private getIPv6Details() {
        this.IPv6DetailsSubscription = this.ipv6Service.getIPv6Details(this.IPv6Id).subscribe(res => {
            const { success, data } = res;
            if (success) {
                this.IPv6Details = data;
                this.betaFlag = data.betaFlag;
                const { workflow: { active, timestamp } } = data;
                this.IPv6DataSubscription();
                this.ipv6Service.updateIPv6DetailsSubject(data);
                this.sideBar.enableSideBarItems(active);
                this.sideBar.switchSidebarTab(active);
                this.loadActiveTab(active);
                this.sideBar.updateWorkflowTimestamp(timestamp);
            }
        }, () => {
            this.toastService.show('Error in data fetching', 'Error fetching the IPv6 details', 'danger');
        });
    }

    /**
     * Switches to requested sidebar tab
     * @param sidebarObj is to populate data for siderbar
     */
    switchSidebarTab(sidebarObj: IPv6SidebarEventModel): void {
        this.sidebarData = sidebarObj.sidebarData;
        this.currentTabName = sidebarObj.currentTab.name;
        this.loadActiveTab(this.currentTabName);
        const { timestamp, active, next } = this.IPv6Details.workflow;
        this.disableNextButton(timestamp, active, next);
    }

    /**
     * Navigates to active tab
     * @param currentTabName is the name for current tab
     */
    private loadActiveTab(currentTabName: string): void {
        this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
    }

    /**
     * Disables next button if step is not submitted
     * @param timestamp holds details for step completion
     * @param active contains value for active step
     * @param next contains value for next step
     */
    private disableNextButton(timestamp: object, active: string, next: string): void {
        if (next !== active) { this.disableNextBtn = false; }
        else if (timestamp && timestamp[this.currentTabName]) {
            this.disableNextBtn = false;
        } else {
            this.disableNextBtn = true;
        }
    }

    /**
     * Releases resources
     */
    ngOnDestroy() {
        if (this.IPv6DetailsSubscription) {
            this.IPv6DetailsSubscription.unsubscribe();
        }
    }

    openHelpOverlayModal(): void {
        const complianceData = { title: 'IPv6', name: 'ipV6' };
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

    /**
   * Modal for icons of process side bar
   */
  showModal(obj: any): void {
    const {  alias: stepName, size } = obj;
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'ipV6', stepName}
    });
    accInfoHelper.afterClosed();
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
          const { recommendationStatus } = this.IPv6Details;
          if (recommendationStatus === 'saved') { updateObject.workflow.next = 'implement'; }

          this.ReinitiateSubscription =
          this.ipv6Service.reinitiate(this.IPv6Id, updateObject).subscribe(res => {
            const { data } = res;
            dialogRef.close(data);
          });
        });

        dialogRef.afterClosed().subscribe(result => {
          this.getIPv6Details();
        });
      }

      async updateWorkflow(progressScore: number, stepName: string): Promise<{
        success: boolean,
        data: IPv6Model
      }> {
        const updateObj = {
          'workflow.active': this.nextWorkflow,
          [`workflow.timestamp.${this.currentTabName}`]: new Date(),
          progressScore,
          stepName
        };
        return this.ipv6Service.update(this.IPv6Id, updateObj).toPromise();
      }

      onPreviousClick(): void {
        this.sideBar.onPreviousClick();
      }

      onNextClick(): void {
        const syncWorkflow = (result) => {
          const { success, data } = result;
          this.ipv6Service.updateIPv6DetailsSubject(data);
          this.sideBar.updateWorkflowTimestamp(data.workflow.timestamp);
          this.sideBar.enableSideBarItems(data.workflow.active);
          this.sideBar.onNextClick();
        };
        const cond = !(this.IPv6Details.workflow.timestamp
            && this.IPv6Details.workflow.timestamp[this.currentTabName]);

        if (cond) {
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

      private syncBtns(data: IPv6Model): void {
        const { workflow: { active, next, timestamp } } = data;
        this.isReinitiateEnabled = getNestedKeyValue(timestamp, 'plan');
        this.nextWorkflow = next;
        this.activeWorkflow = active;
        this.disableNextButton(timestamp, active, next);
      }

      private IPv6DataSubscription() {
        this.IPv6DetailsSubscription = this.ipv6Service.getIPv6DetailsSubject.subscribe(res => {
          if (res !== null) {
            this.IPv6Details = res;
            this.syncBtns(res);
          }
        }, (error) => {
          this.router.navigate([`/**`]);
        });
      }
}
