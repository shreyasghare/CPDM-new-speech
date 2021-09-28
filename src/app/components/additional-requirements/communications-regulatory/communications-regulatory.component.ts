import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { communicationsRegulatorySideBarEvent } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatorySideBarEvent.model';
import { CrcAssessmentQuestionnaire } from '@cpdm-model/additional-requirements/communications-regulatory/crcAssessmentQuestionnaire.model';
import { Role } from '@cpdm-model/role';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { CommunicationsRegulatorySidebarModel } from '@cpdm-shared/constants/communicationsRegulatorySidebarModel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { CustomConfirmationDialogComponent } from '@cpdm-shared/components/custom-confirmation-dialog/custom-confirmation-dialog.component';

@Component({
  selector: 'app-communications-regulatory',
  templateUrl: './communications-regulatory.component.html',
  styleUrls: ['./communications-regulatory.component.scss']
})
export class CommunicationsRegulatoryComponent implements OnInit {
  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;

  role = Role;
  projectName: string = null;
  disableNextBtn = true;
  disablePreviousBtn = false;
  projectId: string = null;
  sidebarData = new CommunicationsRegulatorySidebarModel().CommunicationsRegulatorySidebarData;
  currentTabName: string;
  nextWorkflow: string;
  activeWorkflow: string;
  betaFlag = false;
  crcId: string;
  unsubscribe$ = new Subject();
  crcData: CommunicationsRegulatoryModel;
  enableUpdateBtn: boolean;
  isCrcUpdated = false;
  showSkipText = false;
  confirmationDialogData: { headerText: string, confirmationText: string } = {
    headerText: 'Confirm Action',
    confirmationText: 'Select \'Confirm\' to modify the responses in the Assessment Questionnaire or to renegotiate the recommendations.<br><br> Select \'Cancel\' to close this window.'
  };
  
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private crcService: CommunicationsRegulatoryService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.params.id;
    this.getCrcData();
  }

  /**
   * @description To get Communications Regulatory Compliance data
   */
  private getCrcData(): void {
    this.crcService.getCrcData(this.crcId).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      const { success, data } = res;
      if (success) {
        const { workflow: { active, timestamp }, projectDetails: { name }, projectId, betaFlag, isUpdated, switchToStep } = data;
        this.projectName = name;
        this.projectId = projectId;
        this.betaFlag = betaFlag;
        this.crcService.updateCrcDataWithSubject(data);
        this.crcUpdateSub();
        this.sideBar.enableSideBarItems(active);
        switchToStep && switchToStep.length ? this.sideBar.switchSidebarTab(switchToStep) : this.sideBar.switchSidebarTab(active);
        // this.sideBar.switchSidebarTab(active);
        if (!isUpdated) {
          this.sideBar.enableSideBarItems(active);
          this.sideBar.switchSidebarTab(active);
          this.loadActiveTab(active);
          this.sideBar.updateWorkflowTimestamp(timestamp);
        }
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in fetching Communications Regulatory data', 'danger');
    });
  }

  /**
   * @description To get updated response from behaviourSubject
   */
  private crcUpdateSub (): void {
    this.crcService.getCrcDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res) {
        const { workflow: { active, timestamp }, isUpdated, isTimestampAdded, switchToStep , crcAssessmentQuestionnaire: { poReviewStatus, isApplicable }} = res;
        this.enableUpdateBtn = timestamp ? true : false;
        if (isTimestampAdded || isUpdated) {
          this.sideBar.enableSideBarItems(active);
          this.disableNextBtn = isUpdated ? true :false;
          this.sideBar.updateWorkflowTimestamp(timestamp);
          if (switchToStep && switchToStep.length) {
            this.sideBar.switchSidebarTab(switchToStep);
          } else if (isUpdated) {
            this.sideBar.switchSidebarTab(active);
            this.loadActiveTab(active);
          }
        }
      }
      if (!getNestedKeyValue(res, 'crcAssessmentQuestionnaire', 'isApplicable') 
          && getNestedKeyValue(res, 'crcAssessmentQuestionnaire', 'isQuestionnaireSubmitted')) {
        this.manageskipText(res);
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error in updating Communications Regulatory data', 'danger');
    });
  }

  /**
   * @description to show or hide 'skip to complete' text
   */
  private manageskipText(crcObject): void {
    if (!getNestedKeyValue(crcObject, 'crcAssessmentQuestionnaire', 'isApplicable') 
        || (getNestedKeyValue(crcObject, 'crcAssessmentQuestionnaire', 'isApplicable')
              && getNestedKeyValue(crcObject, 'crcAssessmentQuestionnaire', 'poReviewStatus') === 'rejected')) {
      this.sidebarData[1]['notApplicable'] = true; 
      this.sidebarData[2]['notApplicable'] = true; 
      this.showSkipText = true;

    } else {
      this.showSkipText = false;
    }
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
    const complianceData = { title: 'Communications Regulatory Compliance', name: 'communications-regulatory' };
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
    const commRegInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: size && size === 'large' ? '63vw' : '40vw',
      data: { workflowName: 'communications-regulatory', stepName }
    });
    commRegInfoHelper.afterClosed();
  }

  /**
   * @description Update CRC flow
   */
  onUpdate() {
    const config = {
      data: this.confirmationDialogData,
      width: '50rem'
    };
    const dialogRef = this.dialog.open(CustomConfirmationDialogComponent, config);
    dialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      let reqObj;
      reqObj = {
        workflow : {
          'active' : 'submit'
        },
        'crcAssessmentQuestionnaire.isQuestionnaireSubmitted': false,
        'crcAssessmentQuestionnaire.poReviewStatus': '',
        'identify.recommendationStatus': '',
        'implement.backlogDetails': {},
        'implement.implementStatus': '',
        isUpdated: true,
        emailTemplate: 'UpdateCommunicationRegulatory',
        projectId: this.projectId,
        progressScore: 0,
        stepName: 'Started'
      };
  
      this.crcService.updateCrcDetails(this.crcId, reqObj)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          dialogRef.close(res);
        }
      }, () => {
        this.toastService.show('Error in update', 'Error updating CRC workflow', 'danger');
      });
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.success) {
        this.crcService.updateCrcDataWithSubject(res.data);
        // Mark new recommendation as read-only if available
        this.crcService.getRecommendationDataSub
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(res => {
          if (res && res.isNewRecommendationsAvailable) {
            res.recommendations.forEach(element => {
              delete element.isNewRecommendation;
            });
            res.isNewRecommendationsAvailable = false;
            let reqObj;
            reqObj = {
                recommendations: res.recommendations,
                isNewRecommendationsAvailable: res.isNewRecommendationsAvailable
            };
            this.crcService.saveRecommendations(this.crcId, reqObj)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
              this.crcService.updateRecommendationDataWithSubject(res);
            }, () => {
              this.toastService.show('Error in saving', 'Error in saving CRC recommendations', 'danger');
            });
          }
        });
      }
    });
  }

  /**
   * @description To manage the sidebar on switching the steps
   */
  switchSidebarTab(sidebarObj: communicationsRegulatorySideBarEvent): void {
    this.sidebarData = sidebarObj.sidebarData;
    this.loadActiveTab(sidebarObj.currentTab.name);
    this.disableNextBtn = sidebarObj.disableNextBtn;
    this.disablePreviousBtn = sidebarObj.disablePreviousBtn;
  }
  
  /**
   * @description To get an active step with lazy-loading
   */
  private loadActiveTab(currentTabName: string): void {
    this.currentTabName = currentTabName;
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }

  /**
   * @description To navigate to 'complete' step
   */
   onSkipToComplete(): void {
     this.sideBar.switchSidebarTab('complete');
   }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.sidebarData = null;
  }

}
