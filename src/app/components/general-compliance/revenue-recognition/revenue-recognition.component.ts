import { Component, OnInit, ViewChild } from '@angular/core';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { Subscription } from 'rxjs/Subscription';
import { Role } from '@cpdm-model/role';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { SubmitConfirmationComponent } from './shared/submit-confirmation/submit-confirmation.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { RevenueRecognitionModel } from '@cpdm-model/general-compliances/revenue-recognition/revenueRecognition.model';
import { RevRecSidebarModel } from '@cpdm-shared/constants/revRecSidebar-data';
import { HelpOverlayComponent } from '@cpdm-shared/components/help-overlay/help-overlay.component';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';

@Component({
  selector: 'app-revenue-recognition',
  templateUrl: './revenue-recognition.component.html',
  styleUrls: ['./revenue-recognition.component.scss']
})
export class RevenueRecognitionComponent implements OnInit {

  disableNextBtn: boolean;
  disablePreviousBtn: boolean;
  tempDataForInfoHelper: { name: string };
  projectName = '';
  projectId: string;
  revRecId: string;
  role = Role;
  currentRole;
  betaFlag = false;
  showReinitiateBtn = false;
  reinitiateObj: { isReinitiate: boolean, confirmationText: string } = {
    isReinitiate: true,
    confirmationText: `Select 'Confirm' to update and re-submit the RCL, PID List, or both for approval. A notification is sent to users associated with this project's policy. Select 'Cancel' to close this window`
  };
  revRecUpdateListenerSubscription: Subscription;
  revRecData: RevenueRecognitionModel;
  isFmvAssessmentRequired = true;

  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;
  sidebarData = new RevRecSidebarModel().revRecSideBarData;

  constructor(public dialog: MatDialog,
              private activatedRoute: ActivatedRoute,
              private revRecService: RevenueRecognitionService,
              private userDetailsService: UserDetailsService,
              private projectDataService: ProjectsDataService,
              private projectDetailsService: ProjectsDetailService,
              private loaderService: LoaderService,
              private router: Router) { }

  ngOnInit() {
    this.getRevRecObj();
  }

  getRevRecObj(): void {
    // this.loaderService.show(); //commented to avoid overlapping of loaders
    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.revRecService.setComplianceRefID(this.revRecId);
    this.currentRole = this.userDetailsService.userRole;
    this.revRecService.getProjectIdFromRevRec(this.revRecId).subscribe(revRecRes => {
      this.revRecData = revRecRes;
      this.projectId = revRecRes.projectId;
      this.betaFlag = revRecRes.betaFlag; // Changes for beta flag inclusion
      if(this.revRecData && this.revRecData.workflowTimestamp && this.revRecData.workflowTimestamp.rclPidSubmit!=null)  this.showReinitiateBtn=true;
      else this.showReinitiateBtn=false;
      this.isFmvAssessmentRequired = (getNestedKeyValue(this.revRecData, 'rclAssessmentQuestionnaire', 'answeredQuestionsCount') == 17
                                     && getNestedKeyValue(this.revRecData, 'rclAssessmentQuestionnaire', 'status') == 'submitted')
                                     || getNestedKeyValue(this.revRecData, 'fmvNotApplicable')
                                     ? false : true;
      this.projectDataService.getProjectDetails(this.projectId).subscribe(res => {
        this.projectDetailsService.setProjectDetails(res);

        this.projectName = res.name;
        if (!this.isFmvAssessmentRequired && revRecRes.rclPidSubmit && revRecRes.rclPidSubmit.status !== 'reinitiated'
          && getNestedKeyValue(revRecRes, 'workflowTimestamp', 'rclPidApprove') != undefined) {
          this.sidebarData[2]['notApplicable'] = true;
          this.sideBar.enableSideBarItems('complete');
          this.sideBar.switchSidebarTab('complete');
        }
        else if (revRecRes.rclPidSubmit && revRecRes.rclPidSubmit.status && revRecRes.rclPidSubmit.status !== 'reinitiated') {
          if (revRecRes.fmvAssessment && revRecRes.fmvAssessment.status && revRecRes.fmvAssessment.status == 'assessed') {
            this.sideBar.enableSideBarItems('complete');
            this.sideBar.switchSidebarTab('complete');
          }
          else if (revRecRes.rclPidSubmit && revRecRes.rclPidSubmit.status && revRecRes.rclPidSubmit.status == 'approved' ||
            revRecRes.rclPidSubmit && revRecRes.rclPidSubmit.status && revRecRes.rclPidSubmit.status == 'reviewed') {
            this.sideBar.enableSideBarItems('fmvAssessment');
            this.sideBar.switchSidebarTab('fmvAssessment');
          } else if (revRecRes.rclPidSubmit && revRecRes.rclPidSubmit.status && revRecRes.rclPidSubmit.status == 'rejected') {
            this.sideBar.enableSideBarItems('rclPidApprove');
            this.sideBar.switchSidebarTab('rclPidApprove');
          } else {
            if (this.sideBar && this.sideBar.sidebarData 
                && getNestedKeyValue(revRecRes, 'rclPidSubmit', 'status') === 'revised') {
                  this.sideBar.resetTimestamp();
            }
            this.sideBar.enableSideBarItems('rclPidApprove');
            this.sideBar.switchSidebarTab('rclPidApprove');
          }
          // if (this.currentRole == this.role.pm){
          //   this.sideBar.switchSidebarTab('review');
          // }
          // else{
          //   this.sideBar.switchSidebarTab('submit');
          // }
        } else {
          this.sideBar.enableSideBarItems('rclPidSubmit');
          this.sideBar.switchSidebarTab('rclPidSubmit');
        }
        this.updatedWorkflowTimestampDiv(revRecRes);
        // this.loaderService.hide(); //commented to avoid overlapping of loaders
      });
    }, err => {
      // this.loaderService.hide(); //commented to avoid overlapping of loaders
    });

    this.revRecUpdateListenerSubscription = this.revRecService.getRevRecUpdateListener().subscribe(sideBarItemName => {
      this.sideBar.enableSideBarItems(sideBarItemName);
      this.disableNextBtn = false;
      if (sideBarItemName === 'rclPidSubmit') {
        this.sideBar.switchSidebarTab(sideBarItemName);
        this.disableNextBtn = true;
      }
      this.revRecService.getRevRecObj(this.revRecId).subscribe(revRecObj => {
        if ((getNestedKeyValue(revRecObj, 'rclAssessmentQuestionnaire', 'answeredQuestionsCount') == 17
            && getNestedKeyValue(revRecObj, 'rclAssessmentQuestionnaire', 'status') == 'submitted') 
            || getNestedKeyValue(revRecObj, 'fmvNotApplicable')) {
                this.sidebarData[2]['notApplicable'] = true;
        } else {
          delete this.sidebarData[2]['notApplicable'];
        }
        if(revRecObj && revRecObj.workflowTimestamp && revRecObj.workflowTimestamp.rclPidSubmit!=null)  this.showReinitiateBtn=true;
        else this.showReinitiateBtn=false;
       
        this.updatedWorkflowTimestampDiv(revRecObj);
      });
    });
  }

  showModal(obj: any): void {
    let { alias: stepName } = obj;
    const revRecInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: '40vw',
      data: { workflowName: 'revenueRecognition', stepName }
    });
    revRecInfoHelper.afterClosed();
  }

  openComponentModal(): void {
    const complianceData = { title: 'Revenue Recognition', name: 'revenueRecognition' };
    const helpOverlayModal = this.dialog.open(HelpOverlayComponent, {
      autoFocus: false,
      height: '70vh',
      width: '60vw',
      data: { complianceData, isLargeModal: true }
    });
    helpOverlayModal.afterClosed().subscribe(result => {
    });
  }

  switchSidebarTab(sidebarObj: any): void {
    const { currentTab: { name } } = sidebarObj;
    const { currentTab: { number } } = sidebarObj;
   // this.showReinitiateBtn = number != 0 && number != 1 ? true : false;
    this.sidebarData = sidebarObj.sidebarData;
    this.loadActiveTab(name);
    this.disableNextBtn = sidebarObj.disableNextBtn;
    this.disablePreviousBtn = sidebarObj.disablePreviousBtn;
  }

  private loadActiveTab(currentTabName: string): void {
    this.router.navigate([currentTabName], { relativeTo: this.activatedRoute });
  }

  onReinitiate(): void {
    const dialogRef = this.dialog.open(SubmitConfirmationComponent, {
      data: { reinitiateObj: this.reinitiateObj, revRecObj: this.revRecData }, width: '35vw', height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'reinitiated') {
        this.getRevRecObj();
      }
    });
  }

  ngOnDestroy() {
    if (this.revRecUpdateListenerSubscription) {
      this.revRecUpdateListenerSubscription.unsubscribe();
    }
    this.sidebarData = null;
  }

  onPreviousClick() {
    this.sideBar.onPreviousClick();
  }

  onNextClick() {
    this.sideBar.onNextClick();
  }

  updatedWorkflowTimestampDiv(accessObj) {
    this.sideBar.updateWorkflowTimestamp(accessObj.workflowTimestamp);
  }
}