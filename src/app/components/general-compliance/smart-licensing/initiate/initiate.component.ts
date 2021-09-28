import { Component, OnInit, ViewChild } from '@angular/core';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Role } from '@cpdm-model/role';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { EngagementFormComponent } from './engagement-form/engagement-form.component';
import { MatDialog } from '@angular/material';
import { SubmitConformationComponent } from './submit-conformation/submit-conformation.component';
import { UserSearchDirComponent } from './user-search-dir/user-search-dir.component';
import { SmartLicensingModel } from '../models/SmartLicensingModel';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-initiate',
  templateUrl: './initiate.component.html',
  styleUrls: ['./initiate.component.scss']
})
export class InitiateComponent implements OnInit {

  @ViewChild(UserSearchDirComponent, { static: false }) userSearchDirectory: UserSearchDirComponent;

  showSpinner = true;
  initiateProcessContinues = true;
  webInrInvitationSend = false;
  slObj: any;
  inputValue: string;
  members = [] as any;
  showLoader = false;
  getErrorMessage: string;
  errorOccurred: boolean;
  sslWebinarAttend: string;
  slInitiateForm: FormGroup;
  slId: any;
  role = Role;
  currentRole: string;
  engagementFormNotSubmitted = false;
  isSubmitEnable = false;
  sLEngagedChoice: string;
  sLReleaseChoice: string;
  skipBtnText: string;
  response: string;
  confirmationDialogRef: any;
  projectId: any;
  confirmationObjUpdate: { confirmationText: string } = {
    confirmationText:
      `<div class="text-left">
    <p>Are you sure you want to jump directly to the ‘Implementation’ step? The following steps will be skipped</p>
    <ul>
      <li>Engineering Interlock</li>
      <li>Engineering Response</li>
    </ul>
    </div>`
  };

  confirmationObjFeature: { confirmationText: string } = {
    confirmationText:
      `<div class="text-left">
    <p>Are you sure you want to jump directly to the ‘Testing’ step? The following steps will be skipped</p>
    <ul>
      <li>Engineering Interlock</li>
      <li>Engineering Response</li>
      <li>Implementation</li>
      <li>Demo to ELO</li>
    </ul>
    </div>`
  };

  size = 'full';
  engQuestionnaireBtnName = 'Begin';
  engagementRequestForm: any = null;

  questionnaireshowSuccessErrorContailer = false;
  showMembers = false;
  showSendNotificationText = true;
  infoIconData = [];
  disableSkipToBtn = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    fb: FormBuilder,
    private smartLicensingService: SmartLicensingService,
    private toastService: ToastService,
    public cuiModalService: CuiModalService,
    public dialog: MatDialog,
    public userDetailsService: UserDetailsService,
    private projectsDataService: ProjectsDataService
  ) {

    this.slInitiateForm = fb.group({
      sLEngagedChoice: ['', Validators.required],
      sLReleaseChoice: ['', Validators.required],
      sslWebinarChoice: ['', Validators.required],
      productMonetizationChoice: ['', Validators.required],
      inputName: '',
      userNames: fb.array([])
    });
  }


  ngOnInit() {
    this.currentRole = this.userDetailsService.userRole;
    this.projectsDataService.getItemDesc('tooltip').subscribe(res => {
      this.infoIconData = res;
    });
  }

  onSkipButtonClick(): void {
    if (this.slInitiateForm.controls.sLReleaseChoice.value.toLowerCase() == "update agent") {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, { data: this.confirmationObjUpdate, width: '35vw', height: 'auto', disableClose: true });
    }
    else {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, { data: this.confirmationObjFeature, width: '35vw', height: 'auto', disableClose: true });
    }
    this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
      this.updateSLStatus();
    });

    this.confirmationDialogRef.afterClosed().subscribe(result => {

      const { success } = result;
      if (success) {
        this.showSpinner = true;
        const skipFlag = true;
        this.smartLicensingService.postQuestionnaire(this.createQuestionnairesPostObject('submitted', this.webInrInvitationSend), this.slId, skipFlag).subscribe(initiateResponse => {
          const { data, success } = initiateResponse;

          if (success) {
            const body = {
              id: this.slId,
              skipTo: this.skipBtnText === 'Skip to implement' ? 'implementation' : 'testing'
            };
            this.smartLicensingService.skipSLStatus(body).subscribe(res => {
             // this.showSpinner = false;
              if (res.success) {
                if(res.data && res.data.skipTo) {
                  const { skipTo } = res.data;
                  this.disableSkipToBtn = true;
                  this.smartLicensingService.enableNextSidebarItem(skipTo, true);
                }
              }
            }, err => { console.log(err) });
          }
        }, err => { console.log(err) });
      }
    });
  }

  private updateSLStatus(): void {
    const statusBody = {
      data: {
        engineeringResponse: 'Not Applicable',
        engineeringInterlock: 'Not Applicable',
        implementation: 'Not Applicable',
        demoToElo: 'Not Applicable'
      }
   };
    this.smartLicensingService.updateStatus(this.slId, statusBody).subscribe(res => {
      this.confirmationDialogRef.close(res);
    }, err => {
      console.error(err);
    });
  }

  ngAfterViewInit() {
    this.slId = this.activatedRoute.snapshot.params.id;
    this.getUpdatedSLObj();
  }

  private syncEngagementFormBtnName(slData: SmartLicensingModel) {
    const { state } = slData.initiate.engagementRequestForm;
    if (this.currentRole == this.role.pm) {
      state != 'notSubmitted' ? this.questionnaireshowSuccessErrorContailer = true : false;

      if (state === 'notSubmitted') {
        this.engQuestionnaireBtnName = 'Begin';
      } else if (slData.workflowTimestamp && slData.workflowTimestamp.initiate) {
        this.engQuestionnaireBtnName = 'View';
      } else if (state === 'saved' || state === 'submitted') {
        this.engQuestionnaireBtnName = 'View / Edit';
      }
    } else {
      state === 'notSubmitted' ? this.engagementFormNotSubmitted = true : null;
      this.engQuestionnaireBtnName = 'View';
    }
  }

  get getQuestionniareStatus() {
    let questionnaireState = null;
    const { state, savedQuestionsCount, isAllQuestionsAnswered } = getNestedKeyValue(this.slObj, 'initiate', 'engagementRequestForm');
    if (state === 'saved' && savedQuestionsCount > 0) {
      questionnaireState = `${savedQuestionsCount} ${savedQuestionsCount === 1 ? 'Question is' : 'Questions are'} remaining to be answered`;
    } else if (isAllQuestionsAnswered) {
      questionnaireState = `All questions are answered`;
    } else {
      questionnaireState = `All mandatory questions are answered`;
    }
    return questionnaireState;
  }

  private getUpdatedSLObj() {
    this.smartLicensingService.getSmartLicensingData(this.slId).subscribe(slRes => {
      const { success, data } = slRes;
      if (success) {
        this.slObj = data;
        const { status } = data;
        if(status) {
          this.disableSkipToBtn = true;
        }
        this.slObj.projectId._id = data.projectId._id;
        this.syncEngagementFormBtnName(data);

        if (data.initiate && data.initiate.questionnaires) {
          this.webInrInvitationSend = data.initiate.questionnaires.invitationSend;
          if ((data.initiate.questionnaires.state).toLowerCase() === 'submitted') {
            this.initiateProcessContinues = false;
            this.engQuestionnaireBtnName = 'View';
          }
          data.initiate.questionnaires.answers.forEach(element => {
            if (element.questionNumber === '1') {
              this.slInitiateForm.controls.sLEngagedChoice.value ? this.slInitiateForm.controls.sLEngagedChoice.value : this.slInitiateForm.controls.sLEngagedChoice.setValue(element.answer);
              this.sLEngagedChoice = this.slInitiateForm.controls.sLEngagedChoice.value;
            }
            if (element.questionNumber === '1.a') {
              this.slInitiateForm.controls.sLReleaseChoice.value ? this.slInitiateForm.controls.sLReleaseChoice.value : this.slInitiateForm.controls.sLReleaseChoice.setValue(element.answer);
              if (this.slInitiateForm.controls.sLReleaseChoice.value && this.slInitiateForm.controls.sLReleaseChoice.value != "") {
                if (this.slInitiateForm.controls.sLReleaseChoice.value.toLowerCase() == "update agent") {
                  this.skipBtnText = "Skip to implement";
                }
                else if (this.slInitiateForm.controls.sLReleaseChoice.value.toLowerCase() == "update product feature") {
                  this.skipBtnText = "Skip to testing";
                }
              }
            }
            if (element.questionNumber === '2') {
              this.slInitiateForm.controls.sslWebinarChoice.value ? this.slInitiateForm.controls.sslWebinarChoice.value : this.slInitiateForm.controls.sslWebinarChoice.setValue(element.answer);
              this.sslWebinarAttend = this.slInitiateForm.controls.sslWebinarChoice.value;
            }
            if (element.questionNumber === '2.a') {
              this.members = (element.answer.members && element.answer.members.length > 0) ? element.answer.members : [];
            }
            if (element.questionNumber === '3') {
              this.slInitiateForm.controls.productMonetizationChoice.value ? this.slInitiateForm.controls.productMonetizationChoice.value : this.slInitiateForm.controls.productMonetizationChoice.setValue(element.answer);
            }
            this.webInrInvitationSend ? this.showSendNotificationText = false : this.showSendNotificationText = true;
          });
        }
        this.isAllFromAnswered();
        this.showSpinner = false;
      }

    });
  }
  private isAllFromAnswered() {
    let validAnswers = 0;
    if (this.slInitiateForm.value) {
      if (this.slInitiateForm.value.productMonetizationChoice) {
        validAnswers++;
        if (this.slInitiateForm.value.sLEngagedChoice === 'yes') {
          if (this.slInitiateForm.value.sLReleaseChoice) {
            validAnswers++;
          }
        } else if (this.slInitiateForm.value.sLEngagedChoice === 'no') {
          validAnswers++;
        }
        if (this.slInitiateForm.value.sslWebinarChoice === 'no') {
          if (this.members.length) {
            validAnswers++;
          }
        } else if (this.slInitiateForm.value.sslWebinarChoice === 'yes') {
          validAnswers++;
        }
      }
    }
    if (this.slObj.initiate.engagementRequestForm.state === 'submitted' && validAnswers === 3) {
      this.isSubmitEnable = true;
    } else {
      this.isSubmitEnable = false;
    }
  }

  onSslWebinarAttendChange(event) {
    this.sslWebinarAttend = this.slInitiateForm.value.sslWebinarChoice == 'yes' ? 'yes' : 'no';
    this.isAllFromAnswered();
    this.smartLicensingService.updateSslWebinarAttend({ slId: this.activatedRoute.snapshot.params.id, sslWebinarAttend: this.sslWebinarAttend }).subscribe(data => {
      this.slObj.initiate.questionnaires = data.questionnaires;
      // this.showSendNotificationText = this.slObj.initiate.questionnaires.invitationSend;
    },
      err => {
      });
    if (this.sslWebinarAttend === 'yes') {
      // this.members = [];
      // this.userSearchDirectory.userMembers = [];
      this.userSearchDirectory.inputValue = null;
      this.userSearchDirectory.showMembers = false;
      this.showSendNotificationText = true;
    } else {
      this.userSearchDirectory.showMembers = true;
      this.slObj.initiate && this.slObj.initiate.questionnaires && this.slObj.initiate.questionnaires.invitationSend ? this.showSendNotificationText = false : this.showSendNotificationText = true;
    }
  }

  getSelectedMembers(event) {
    this.showSendNotificationText = true;
    this.members = event;
    this.isAllFromAnswered();
  }

  sendNotification() {
    const notificationToast = this.toastService.show(`Sending invitation for`, `Getting Started with Smart Licensing`, 'info', { autoHide: false });
    this.smartLicensingService.invitetoSLWebinr({ slId: this.activatedRoute.snapshot.params.id, slPId: this.slObj.projectId._id, members: this.members, invitationSend: this.webInrInvitationSend }).subscribe(data => {
      this.slObj.initiate.questionnaires = data.questionnaires;
      this.showSendNotificationText = !data.questionnaires.invitationSend;
      this.webInrInvitationSend = data.questionnaires.invitationSend;
      notificationToast.update(`Invitation sent for`, `Getting Started with Smart Licensing`, 'success');
    },
      err => {
        notificationToast.update('Invitation failed', null, 'danger');
      });
  }

  onProductMonetizationButtonChange(event) {
    this.isAllFromAnswered();
  }

  onSubmit() {
    const dialogRef = this.dialog.open(SubmitConformationComponent, { data: null, width: '35vw', height: 'auto', });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'finished') {
        this.showLoader = true;
        this.smartLicensingService.postQuestionnaire(this.createQuestionnairesPostObject('submitted', this.webInrInvitationSend), this.slId).subscribe(res => {
          const { data, success } = res;
          this.slObj = res.data;

          if (success) {
            this.showLoader = false;
            this.initiateProcessContinues = false;
            this.syncEngagementFormBtnName(data);
            this.slObj = data;
            if (res.data && res.data.workflowTimestamp && res.data.workflowTimestamp.initiate) {
              this.smartLicensingService.enableNextSidebarItem('engineeringInterlock');
            }
          }
        }, err => {
        });
      }
    });

  }
  openQestionnareComponent() {
    const questionnaire = this.dialog.open(EngagementFormComponent, { data: { slId: this.slId, slObj: this.slObj, isReadOnly: !this.initiateProcessContinues }, panelClass: 'full-width-dialog', disableClose: true });
    questionnaire.afterClosed().subscribe(result => {
      const { success, data } = result;
      if (success) {
        this.getUpdatedSLObj();
        this.engagementRequestForm = data;

      }
    });
  }

  createQuestionnairesPostObject(status: string = 'notSubmitted', invitationSatus: boolean = false) {
    const questionnairesObj = {
      questionnaires: {
        state: status,
        answers: [
          {
            questionNumber: '1',
            answer: this.slInitiateForm.controls.sLEngagedChoice.value
          }, {
            questionNumber: '1.a',
            answer: this.slInitiateForm.controls.sLReleaseChoice.value
          }, {
            questionNumber: '2',
            answer: this.slInitiateForm.controls.sslWebinarChoice.value
          }, {
            answer: { members: this.members },
            questionNumber: '2.a'
          }, {
            questionNumber: '3',
            answer: this.slInitiateForm.controls.productMonetizationChoice.value
          }],
        invitationSend: invitationSatus
      }
    };
    // if (this.slInitiateForm.controls['sslWebinarChoice'].value == 'no') {
    //   questionnairesObj.questionnaires.answers.push({
    //     "questionNumber": '1.a',
    //     'answer': { 'members': this.members }
    //   });
    // } else {
    //   questionnairesObj.questionnaires.answers.push({
    //     "questionNumber": '1.a',
    //     'answer': { 'members': null }
    //   });
    // }

    return questionnairesObj;
  }

  async onSLEngagedChange(event) {
    this.sLEngagedChoice = this.slInitiateForm.value.sLEngagedChoice === 'yes' ? 'yes' : 'no';
    this.slInitiateForm.controls.sLReleaseChoice.setValue(null);
    await this.smartLicensingService.updateSmartLicensingProcessQuestionnaire({
      slId: this.activatedRoute.snapshot.params.id,
      sLEngagedChoice: this.sLEngagedChoice,
      sLReleaseChoice: this.slInitiateForm.value.sLReleaseChoice
    })
      .subscribe(response => {
        this.slObj.initiate.questionnaires = response.data.questionnaires;
      },
        err => {
          console.log(err);
        });
    this.isAllFromAnswered();
  }

  async onSLReleaseChange(event) {
    this.skipBtnText = this.slInitiateForm.value.sLReleaseChoice === 'Update agent' ? 'Skip to implement' : 'Skip to testing';
    await this.smartLicensingService.updateSmartLicensingProcessQuestionnaire({
      slId: this.activatedRoute.snapshot.params.id,
      sLEngagedChoice: this.sLEngagedChoice,
      sLReleaseChoice: this.slInitiateForm.value.sLReleaseChoice
    })
      .subscribe(response => {
        this.slObj.initiate.questionnaires = response.data.questionnaires;
      },
        err => {
          console.log(err);
        });
    this.isAllFromAnswered();
  }

  showSkipButton() {
    if (this.slInitiateForm && this.slInitiateForm.controls && this.slInitiateForm.controls.sLReleaseChoice && this.slInitiateForm.controls.sLReleaseChoice.value && this.slInitiateForm.controls.sLReleaseChoice.value != "") {
      return true;
    }
    return false;
  }

  showSubmittedText() {
    if (this.slInitiateForm && this.slInitiateForm.controls && this.slInitiateForm.controls.sLEngagedChoice)
      return !this.initiateProcessContinues && this.slInitiateForm.controls.sLEngagedChoice.value === 'no';
  }
  getTooltipText(name: string) {
    let desc: string;
    if (this.infoIconData.length > 0) {
      for (const iterator of this.infoIconData) {
        if (name.toLowerCase() === iterator.name.toLowerCase()) {
          desc = iterator.description.join('\n');
          break;
        }
      }
      return desc;
    }
  }
}
