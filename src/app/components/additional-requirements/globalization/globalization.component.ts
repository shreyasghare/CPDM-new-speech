import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { globalizationSideBarEvent } from '@cpdm-model/additional-requirements/globalization/globalizationSideBarEvent.model';
import { Role } from '@cpdm-model/role';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { GlobalizationService } from '@cpdm-service/additional-requirements/globalization/globalization.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { GlobalizationSidebarModel } from '@cpdm-shared/constants/globalizationSidebarModel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

@Component({
  selector: 'app-globalization',
  templateUrl: './globalization.component.html',
  styleUrls: ['./globalization.component.scss']
})
export class GlobalizationComponent implements OnInit {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;
  
  globalizationId: string;
  role = Role;
  projectName: string = null;
  sidebarData = new GlobalizationSidebarModel().GlobalizationSidebarData;
  projectId: string;
  betaFlag = false;
  currentTabName: string;
  unsubscribe$: Subject<boolean> = new Subject<boolean>();

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private projectDataService: ProjectsDataService,
    private projectDetailsService: ProjectsDetailService,
    private globalizationService: GlobalizationService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.globalizationId = this.activatedRoute.snapshot.params.id;
    this.getGlobaliztionData();
  }

  /**
   * @description To get Globalization data
   */
  private getGlobaliztionData(): void {
    this.globalizationService.getGlobalizationData(this.globalizationId).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      const { success, data } = res;
      if (success) {
        const { workflow: { active, timestamp }, projectName , projectId, betaFlag } = data;
        this.projectName = projectName;
        this.projectId = projectId;
        this.betaFlag = betaFlag;
        this.globalizationService.updateGlobalizationDataWithSubject(data);
        this.sideBar.enableAllSideBarItems();
        this.sideBar.switchSidebarTab(active);
        this.projectDataService.getProjectDetails(this.projectId).subscribe(res => {
          this.projectDetailsService.setProjectDetails(res);
        });
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in fetching Globalization data', 'danger');
    });
  }

  /**
   * @description To manage the sidebar on switching the steps
   */
   switchSidebarTab(sidebarObj: globalizationSideBarEvent): void {
    this.sidebarData = sidebarObj.sidebarData;
    this.loadActiveTab(sidebarObj.currentTab.name);
  }

   /**
   * @description To get an active step with lazy-loading
   */
    private loadActiveTab(currentTabName: string): void {
      this.currentTabName = currentTabName;
      this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
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
    this.sideBar.onNextClick();
  }

  /**
   * @description Help overlay modal
   */
  openHelpOverlayModal() {
    const complianceData = { title: 'Globalization', name: 'globalization' };
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
    const globalizationInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'globalization', stepName }
    });
    globalizationInfoHelper.afterClosed();
  }

  /**
   * @description Update Flow
   */
   onUpdate() {
     
   }

  /**
   * @description Cleaning up resources
   */
     ngOnDestroy() {
      this.unsubscribe$.next(true);
      this.unsubscribe$.unsubscribe();
    }
}
