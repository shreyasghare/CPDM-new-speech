import { LoaderService } from '@cpdm-service/shared/loader.service';
import { FormControl } from '@angular/forms';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Role } from '@cpdm-model/role';
import { ProcessSidebarComponent } from '@cpdm-shared/components/process-sidebar/process-sidebar.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { AssessmentQuestionnairePopupComponent } from '../rcl-pid-submit/assessment-questionnaire-popup/assessment-questionnaire-popup.component';
import { SubmitConfirmationComponent } from '../shared/submit-confirmation/submit-confirmation.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { DocCentral } from '@cpdm-model/DocCentral'

@Component({
  selector: 'rcl-pid-approve',
  templateUrl: './rcl-pid-approve.component.html',
  styleUrls: ['./rcl-pid-approve.component.scss']
})
export class RclPidApproveComponent implements OnInit {
  role = Role;
  currentRole: string;
  isRevRecPOReviewSent: boolean;
  isBUReviewed: boolean;
  revRecId: string;
  revRecData: any;
  revRecPOData: any = [];
  BUControllerData: any = [];
  rrComment = '';
  buComment = '';
  projectNameForFile: string;
  hasPmSubmitted: boolean;
  RCLAssessmentStatus: string;
  scopingChecklistStatus: string;
  showLoader = false;
  assessmentChecklistObj: DocCentral;
  holdingScreenBUMessageOnAPproval: string;

  resForInfoIcon: any;
  toolTipSubscription: Subscription;

  errorOccurred: boolean;
  getErrorMessage: string;
  inputValue: string;
  searchMember: FormControl = new FormControl();
  users = [];
  members = [] as any;

  @ViewChild('content', { static: false }) confirmModal: TemplateRef<any>;
  @ViewChild('revRecComment', { static: false }) revRecCommentModal: TemplateRef<any>;
  @ViewChild('viewCommentsForSkipPidListModel', { static: false }) viewCommentsForSkipPidListModel: TemplateRef<any>;
  

  reinitiateObj: { isReinitiate: boolean, confirmationText: string } = {
    isReinitiate: true,
    confirmationText: 'Are you sure you want to edit the worksheet and re-initiate process? This will trigger a notification to everyone associated to this project\'s policy.'
  };

  reviewStatus = {
    pmWaiting: { icon: '', status: '', message: '' },
    reviewed: {
      icon: 'complete',
      status: 'Review Sent',
      message: 'Please wait for the BU controller to provide approval.'
    },
    rejected: {
      icon: 'reject',
      status: 'Rejected by BU Controller',
      message: 'Project manager will revise the RCL assessment and will resubmit.'
    },
    revised: {
      icon: 'submit',
      status: 'RCL Assessment revised',
      message: 'Project manager has revised the RCL assessment. Click on review'
    },
    approved: {
      icon: 'complete',
      status: 'Approved',
      message: 'RCL and New PID List are approved.'
    }
  };

  currentReviewStatus;
  isApprovedByBU: boolean;
  isRejectedByBU: boolean;
  businessUnitList: any[] = [];
  selectedBuController: string;
  selectedBU: string;
  oldBusinessUnit: string;

  buControllerID: string;
  buControllerCecID: string;
  buControllerBusinessEntity: string;

  confirmationDialogRef: MatDialogRef<SubmitConfirmationComponent, any>;

  @ViewChild(ProcessSidebarComponent, { static: true }) sideBar: ProcessSidebarComponent;

  constructor(private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    public cuiModalService: CuiModalService,
    private revRecService: RevenueRecognitionService,
    private projectDetailsService: ProjectsDetailService,
    private userDetailsService: UserDetailsService,
    private docCentralService: DocCentralService,
    private dataService: ProjectsDataService,
    private userService: UserDetailsService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.projectNameForFile = this.projectDetailsService.getProjectDetails.name.replace(/[\s+,\/]/g, '-');
    this.currentRole = this.userDetailsService.userRole;
    this.getRclData();

    this.toolTipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });
    this.searchMember.valueChanges.subscribe(
      async term => {
        this.users = [];
        this.errorOccurred = false;
        if ( term && (typeof term === 'string') && (term.trim()).length >= 3) {
          (await this.userService.searchUser(term)).subscribe(
          data => {
            this.users = (data && data.length > 0) ? data : [{name: 'No Record(s) Found', cecId: null, email: null}];
          },
          err => {
            this.users = [{
              name: this.searchMember.value,
              cecId: null,
              email: null,
              errorStatus: err
            }] ;
          });
        }
    });
  }

    /**
   *
   * On change of alternate approver
   */
  matOptionSelected(selectedValue){
    if (selectedValue.cecId || 'errorStatus' in  selectedValue) {
      this.inputValue = selectedValue;
    } else {
      this.inputValue = null;
    }
  }
  getSelectedUserName(selectedUser) {
    if (selectedUser) { return selectedUser.name; }
  }
  async onMemberAddition() {
    this.showLoader = true;
    await this.addSelectedUserToMemberArray(this.inputValue);
    this.showLoader = false;
  }
  async addSelectedUserToMemberArray(selectedUser) {
    if ('errorStatus' in  selectedUser) {
      try {
        selectedUser = await this.userService.getUserDetailsFromDirectory(selectedUser.name).toPromise();
      } catch (err) {
        console.error(err);
        return this.setErrorMessage('Invalid CEC Id');
      }
    }
    const userExist = this.members.filter(member => {
      return member.cecId === selectedUser.cecId;
    });

    if (userExist.length === 0 ) {
      this.members = [];
      const memberObj = {name: selectedUser.name, cecId: selectedUser.cecId, fullName: selectedUser.name};
      this.members.push( memberObj );
      this.inputValue = null;
      this.searchMember.reset();
      this.members.forEach((obj, index) => {
        if (obj.name.split(' ')[1]) {
          this.members[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
        } else {
          this.members[index].name = `${obj.name.split(' ')[0]}`;
        }
      });
      // Call to api to save alternate proxy.
      this.loaderService.show();
      const alternateProxy = { cecId: selectedUser.cecId, name: selectedUser.name };
      this.revRecService.setUpdateAlternateProxy(this.revRecId, 'add', alternateProxy).subscribe(res => {
        this.loaderService.hide();
      });
    } else {
      this.searchMember.reset();
      this.inputValue = null;
      this.setErrorMessage('User Already Exist');
    }
  }
  setErrorMessage(err: string): void {
    this.errorOccurred = true;
    this.getErrorMessage = err;
    setTimeout(() => {
      this.errorOccurred = false;
      this.getErrorMessage = '';
    }, 4000);
  }

  onRemove(index) {
    this.members.splice(index, 1);
    // call to remove alternate proxy from mongo database revrec.buController
    this.loaderService.show();
    this.revRecService.setUpdateAlternateProxy(this.revRecId, 'remove').subscribe(res => {
      this.loaderService.hide();
    });
  }
  /**
   * Get revenue recognition data
   */
  getRclData() {
    this.revRecService.getRevRecObj(this.revRecId).subscribe(async revRecObj => {
      this.revRecData = revRecObj;
      // this.revRecData.submit = {status: 'revised'};

      this.revRecData.skipPidListUpload.flag=revRecObj.skipPidListUpload? revRecObj.skipPidListUpload.flag : false;
      this.revRecData.skipPidListUpload.comments=revRecObj.skipPidListUpload? revRecObj.skipPidListUpload.comments : null;

      if (getNestedKeyValue(this.revRecData, 'buController', 'cecId')) {
        await this.setBusinessUnitDropDownItems(this.revRecData.buController.cecId,
          this.revRecData.buController.bussinessEntity);
        this.buControllerID = this.revRecData.buController._id;
        this.buControllerCecID = this.revRecData.buController.cecId;
        this.buControllerBusinessEntity = this.revRecData.buController.bussinessEntity;

        this.selectedBuController = this.revRecData.buController.name;
        this.oldBusinessUnit = this.revRecData.buController.businessUnit;
        this.selectedBU = this.revRecData.buController.businessUnit;        
      }
     
      if(this.currentRole == this.role.BUController && this.revRecData && this.revRecData.alternateProxy 
      && Object.keys(this.revRecData.alternateProxy).length) {
        this.matOptionSelected(this.revRecData.alternateProxy);
        this.onMemberAddition();
      }

      if (getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status')) {
        if (getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'submitted'
            || getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'revised') {
          this.hasPmSubmitted = true;
          this.isApprovedByBU = false;
          this.isRejectedByBU = false;
          this.reviewStatus.pmWaiting.icon = 'review';
          this.reviewStatus.pmWaiting.status = 'Waiting BU Controller\'s approval';
          this.reviewStatus.pmWaiting.message = 'RCL Assessment and New PID List are pending for approval by BU Controller.';
        } else if (getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'approved'
                    || getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'reviewed') {
          this.hasPmSubmitted = false;
          this.isApprovedByBU = true;
          this.isRejectedByBU = false;
          this.reviewStatus.pmWaiting.icon = 'complete';
          this.reviewStatus.pmWaiting.status = 'Approved';
          // [US30242]: [SUS P5] Rev Rec: When to Commit messaging:TA14680: text to the messaging box fore PM & BU role         
          if(getNestedKeyValue(this.revRecData,"rclAssessmentQuestionnaire" ,"answeredQuestionsCount") > 17 && getNestedKeyValue(this.revRecData, "workflowTimestamp", "rclPidApprove") && 
          !getNestedKeyValue(this.revRecData, "workflowTimestamp", "fmvAssessment") && !getNestedKeyValue(this.revRecData,"fmvNotApplicable")){
            this.reviewStatus.pmWaiting.message = 'RCL Assessment and New PID List are approved. This project may be committed prior to the completion of the FMV Assessment.';
            this.holdingScreenBUMessageOnAPproval = 'RCL assessment and New PID List are approved. This project may be committed prior to the completion of the FMV Assessment.';
          }else{
            this.reviewStatus.pmWaiting.message = 'RCL Assessment and New PID List are approved.';  
            this.holdingScreenBUMessageOnAPproval = 'RCL assessment and New PID List are approved.';
          }          
          //[US30242]:TA14680:PM view
        } else if (getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'rejected') {
          this.hasPmSubmitted = false;
          this.isApprovedByBU = false;
          this.isRejectedByBU = true;
          this.reviewStatus.pmWaiting.icon = 'reject';
          this.reviewStatus.pmWaiting.status = 'Rejected by BU Controller';
          this.reviewStatus.pmWaiting.message = 'RCL Assessment sheet has been rejected. Click on \'Update\' button below to make changes and resubmit';
        }
      }
      // checking revRecPO & BUController length
      // const isRevRecPOReviewsAvailable = revRecObj.review && revRecObj.review.revRecPO && revRecObj.review.revRecPO.length;
      const isRevRecPOReviewsAvailable = getNestedKeyValue(revRecObj, 'rclPidApprove', 'revRecPO');
      // const isBUControllerReviewed = revRecObj.review && revRecObj.review.BUController && revRecObj.review.BUController.length;
      const isBUControllerReviewed = getNestedKeyValue(revRecObj, 'rclPidApprove', 'BUController');

      // Bind revRecPO specific data
      if (isRevRecPOReviewsAvailable) {
        this.revRecPOData = getNestedKeyValue(revRecObj, 'rclPidApprove', 'revRecPO');
        this.isRevRecPOReviewSent = true;
        this.rrComment = this.revRecPOData[0].comment;
      } else {
        this.isRevRecPOReviewSent = false;
      }

      if (this.currentRole == this.role.engSox) {
        this.isRevRecPOReviewSent = false;
        if(getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status') == 'revised') {
          this.reviewStatus.revised.message = 'Project manager has revised the RCL assessment.'
        }
      }

      // Bind BUController specific data
      if (isBUControllerReviewed) {
        this.BUControllerData = getNestedKeyValue(revRecObj, 'rclPidApprove', 'BUController');
        this.buComment = this.BUControllerData[0].comment;
        if (this.role.BUController == this.currentRole) {
          this.RCLAssessmentStatus = this.BUControllerData[0].RCLAssessmentStatus;
          this.scopingChecklistStatus = this.BUControllerData[0].scopingChecklistStatus;
        }
        this.isBUReviewed = true;
      } else {
        this.isBUReviewed = false;
      }

      if (getNestedKeyValue(this.revRecData, 'docCentralLinks', 'rclPidSubmit', 'assessmentChecklist')){
        this.assessmentChecklistObj = getNestedKeyValue(this.revRecData, 'docCentralLinks', 'rclPidSubmit', 'assessmentChecklist');
      }

      this.getCurrentReviewStatus();
    });
  }

  /**
   * Display holding status based on rclPidSubmit status
   */
  getCurrentReviewStatus() {
    switch (getNestedKeyValue(this.revRecData, 'rclPidSubmit', 'status')) {
      case 'revised': this.currentReviewStatus = this.reviewStatus.revised; break;
      case 'rejected': this.currentReviewStatus = this.reviewStatus.rejected; break;
      case 'approved': this.currentReviewStatus = this.reviewStatus.approved; break;
      case 'reviewed': this.currentReviewStatus = this.reviewStatus.approved; break;
      default: this.currentReviewStatus = this.reviewStatus.reviewed;
    }
  }

  /**
   * Opens readonly questionnaires in modal
   */
  viewSubmission() {
    this.dialog.open(AssessmentQuestionnairePopupComponent, { data: { revRecData: this.revRecData, isReadonly: true }, panelClass: 'full-width-dialog' });
  }

  /**
   * Downloads scoping checklist/the New PID List
   */
  async downloadScopingChecklist() {
    try {
      const nodeRef = getNestedKeyValue(this.revRecData, 'docCentralLinks', 'rclPidSubmit', 'scopingChecklist', 'nodeRef');
      const fileName = getNestedKeyValue(this.revRecData, 'docCentralLinks', 'rclPidSubmit', 'scopingChecklist', 'fileName');
      this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Confirmation modal to send review
   * @param action
   */
  confirmAction(action: string) {
    if (action == 'rrComments') {
      this.cuiModalService.show(this.revRecCommentModal);
    } else {    // this.cuiModalService.show(this.confirmModal);
      this.confirmationDialogRef = this.dialog.open(SubmitConfirmationComponent, {
        data: { isReviewConfirmation: true }, width: '35vw', height: 'auto'
      });
      this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
        this.sendReview();
        
     });
      this.confirmationDialogRef.afterClosed().subscribe();
    }
  }
  /**
   * Update DB when business unit changes
   */
  onSelectionBusinessUnit() {
    this.showLoader = true;
    // Updating business unit in DB
    if (this.oldBusinessUnit !== this.selectedBU) {
      this.revRecService.setBuController(this.revRecId, 'addBusinessUnitNotify', this.buControllerID, this.selectedBuController,
        this.buControllerCecID, this.buControllerBusinessEntity, this.selectedBU).subscribe(res => {
          this.showLoader = false;
        });
    }
  }
  /**
   * Sends review from revRecPO and BUController user
   */
  sendReview() {
    let obj;
    this.showLoader = true;
    if (this.role.revRecPO == this.currentRole) {
      obj = {
        comment: this.rrComment,
        timestamp: new Date(),
        cecId: this.userDetailsService.getLoggedInCecId()
      };
      this.revRecService.updateRevRecPOComments(this.revRecId, obj).subscribe(res => {
        this.revRecData = res;
        this.revRecPOData = getNestedKeyValue(res, 'rclPidApprove', 'revRecPO');
        this.isRevRecPOReviewSent = true;
        this.rrComment = this.revRecPOData[0].comment;
        this.getCurrentReviewStatus();
        this.showLoader = false;
        // this.cuiModalService.hide();
        this.confirmationDialogRef.close();
      });
    }

    if (this.role.BUController == this.currentRole) {
      obj = {
        RCLAssessmentStatus: this.RCLAssessmentStatus,
        scopingChecklistStatus: this.scopingChecklistStatus,
        comment: this.buComment,
        timestamp: new Date(),
        cecId: this.userDetailsService.getLoggedInCecId()
      };
      this.revRecService.reviewApproval(this.revRecId, obj).subscribe(res => {
        const statusBody = { status: null };
        if (getNestedKeyValue(res, 'rclPidApprove', 'BUController').length) {
          if (this.RCLAssessmentStatus == 'approved' && this.scopingChecklistStatus == 'approved') {
            statusBody.status = 'approved';
            this.currentReviewStatus = this.reviewStatus.approved;
          } else {
            statusBody.status = 'rejected';
            this.currentReviewStatus = this.reviewStatus.rejected;
          }
        }

        // Updates submit status after BUController submits his reviews
        this.revRecService.patchStatusObj(this.revRecId, 'rclPidSubmit', statusBody).subscribe(async statusRes => {
          this.BUControllerData = getNestedKeyValue(statusRes, 'rclPidApprove', 'BUController');
          this.revRecData = statusRes;
          this.getCurrentReviewStatus();
          if (getNestedKeyValue(statusRes, 'rclPidSubmit', 'status') == 'approved') {
            // check 17 questions
            // const questionnairesAnswerCheck = this.revRecData.rclAssessmentQuestionnaire.answers.filter((question, index) => question.answer.value === 'No' && index <= 16 ? question : null);
            // if (questionnairesAnswerCheck.length == 17) {
            //   await this.revRecService.patchStatusObj(this.revRecId, 'rclPidSubmit', { status: 'reviewed' }).toPromise();
            // }
            //
            
            const stepToBeEnabled = getNestedKeyValue(statusRes, 'rclAssessmentQuestionnaire', 'answeredQuestionsCount') == 17
                                    ? 'complete' : 'fmvAssessment';
            this.revRecService.enableNextSidebarItem(stepToBeEnabled);
          }
          this.showLoader = false;
          // this.cuiModalService.hide();
          this.isBUReviewed = true;
          this.confirmationDialogRef.close();
        }, err => {
          console.error(err);
          this.confirmationDialogRef.close();
        });
      });
    }
  }

  OnReinitiateProcess(): void {
    const dialogRef = this.dialog.open(SubmitConfirmationComponent, { data: { reinitiateObj: this.reinitiateObj, revRecObj: this.revRecData }, width: '35vw', height: 'auto' });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'uploadSuccess') {
        // this.isSubmitted = true;
        // // this.isSubmitMainScreen = false;
        // this.showSpinner = false;
        // this.isSubmitBtnEnabled = true;
      }
      // else
      // this.isSubmitBtnEnabled = true;
    });
  }
  /**
   * Setting business units based on BU controller.
   */
  async setBusinessUnitDropDownItems(userId: string, bussinessEntity: string) {
    this.businessUnitList = [];
    this.revRecService.getBusinessUnitsForBUController(userId, bussinessEntity).subscribe(businessUnitsRes => {
      if (businessUnitsRes.success && businessUnitsRes.data[0].businessUnit) {
        businessUnitsRes.data[0].businessUnit.forEach((oneBU) => {
          const buPair: any = {};
          buPair.name = oneBU;
          this.businessUnitList.push(buPair);
        });
      }
    });
  }

  //NEW CODE
  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon != null && this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() == iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      let description: string;
      if (desc && desc.length > 0) {
        description = desc.join('\n');
      }
      return description;
    }    
  }

  getHeight() {
    if(this.currentRole == this.role.BUController || this.currentRole == this.role.engSox) {
      return "auto";
    }
    return "100%";
  }
  /**
   * Downloads Assessment checklist/the New PID List
   */
   async downloadAssessmentChecklist() {
    try {
      const nodeRef = this.assessmentChecklistObj.nodeRef;
      const fileName = this.assessmentChecklistObj.fileName;
      this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
    } catch (error) {
      console.error(error);
    }
  }

  viewCommentsForSkipPidList(){
    this.cuiModalService.show(this.viewCommentsForSkipPidListModel);
  }
}
