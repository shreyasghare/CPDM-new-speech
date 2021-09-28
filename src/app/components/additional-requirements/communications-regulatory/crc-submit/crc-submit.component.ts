import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Role } from '@cpdm-model/role';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { CrcAssessmentQuestionaireModalComponent } from './crc-assessment-questionaire-modal/crc-assessment-questionaire-modal.component';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crc-submit',
  templateUrl: './crc-submit.component.html',
  styleUrls: ['./crc-submit.component.scss'],
  providers: [DatePipe]
})
export class CrcSubmitComponent implements OnInit , OnDestroy {
  crcQuestionnaireBtnName = 'Begin';
  version: string = null;
  serviceabilityId: string;
  isRecommendationsReadOnly: boolean;
  showRecommendationStatus = false;
  crcId: string;
  unsubscribe$ = new Subject();
  updatedCrcObj: CommunicationsRegulatoryModel;
  getCrcDataSubscription: Subscription;
  role = Role;
  crcRemainingQueStatus: string;
  crcNotApplicable: boolean;
  crcReviewSubmit: boolean;
  viewButton = 'View';
  isSpinner = false;
  comment: string;
  poReviewStatus: string;
  isPOSubmitBtnDisable = true;
  isPOCommentsAvailable = false;
  isPoRejectedStatus: boolean;
  isPoApprovedStatus: boolean;
  isTimestampAdded = false;
 

  crcSubmitStatus = {
    icon: 'submit',
    status: 'Assessment Questionnaire'
  };
  crcPoWaitStatus = {
    icon: 'wait',
    status: 'Please wait for the PM to submit the Assessment Questionnaire.'
  };
  crcPmWaitStatus = {
    icon: 'wait',
    status: 'Regulatory Assessment Questionnaire is submitted for review',
    message: `<p> The Regulatory Compliance Team (RCT) is evaluating the information provided. 
              A team member will be in contact if additional information is needed or to provide 
              preliminary conclusions about the requirements that apply to the offer. 
              Please contact us at <u><a class="text-link" target="_blank">comm-reg-legal@cisco.com</a></u> for any further questions</p>`
  };
  crcPmNotApplicable = {
    icon: 'notApplicable',
    status: 'Communication Regulatory Compliance is ‘Not Applicable’',
    message: `<p>The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy is ‘Not Applicable’ for this project.
              Please direct all questions to <u><a class="text-link" target="_blank">comm-reg-legal@cisco.com.</a></u></p>`,
    poEndProcessMsg: `<p>The Regulatory Compliance Team (RCT) ended the process after reviewing the Assessment Questionnaire.
                      Please direct all questions to <u><a class="text-link" target="_blank">comm-reg-legal@cisco.com.</a></u></p>`
  };
  crcPoReview = {
    icon: 'submit',
    status: 'Assessment Questionnaire is available'
  };
  crcPoComments = {
    icon: 'chat',
    status: 'Provide comments (if any)',
  };
  crcQuestionnaireObject = {
    remaningQuestionsCount: 0,
    isAllQestionsAnswered: false,
    status: 'notStarted',
  };

  poApprovedStatus = {
    icon: 'complete',
    status: 'Regulatory Assessment Questionnaire approved',
    message: `<p>The Legal Regulatory Compliance Team (RCT) has approved the provided information.
              Please contact us at <u><a class="text-link" target="_blank">comm-reg-legal@cisco.com</a></u> for any further questions.</p>`
  };

  poRejectStatus  = {
    icon: 'notApplicable',
    status: 'Communication Regulatory Compliance is ‘Not Applicable’',
    message: `<p>The Regulatory Compliance Team (RCT) ended the process.
    Please direct all questions to <u><a class="text-link" target="_blank">comm-reg-legal@cisco.com.</a></u></p>`
  };

  poCommentsHolding = {
    statusIcon: 'chat',
    status: 'Comments from the RCT team',
    message: ''
  };

  constructor(public dialog: MatDialog,
              private datepipe: DatePipe,
              private userDetailsService: UserDetailsService,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private crcService: CommunicationsRegulatoryService) { }


  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.parent.params.id;
    this.getCrcDetails();
  }

  getCrcRemainingQueStatus(crcData) {
    if (this.crcQuestionnaireObject.isAllQestionsAnswered) {
      if (crcData.crcAssessmentQuestionnaire.fisrtThreeQuestionsAnsweredNo) {
        this.crcRemainingQueStatus =  `All the 3 questions are answered`;
      } else {
        this.crcRemainingQueStatus =  `All the 8 questions are answered`;
      }
    } else {
      if (crcData.crcAssessmentQuestionnaire.remianingQuestionsCount <= 1) {
        this.crcRemainingQueStatus =  `${crcData.crcAssessmentQuestionnaire.remianingQuestionsCount} question remaining to be answered`;
      } else {
        this.crcRemainingQueStatus =  `${crcData.crcAssessmentQuestionnaire.remianingQuestionsCount} questions remaining to be answered`;
      }
    }
  }

  getCrcDetails() {
    this.isSpinner  = true;
    this.getCrcDataSubscription = this.crcService.getCrcDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe(crcData => {
      if (crcData) {
        this.updatedCrcObj = crcData;
        this.isPOCommentsAvailable = getNestedKeyValue(this.updatedCrcObj, 'crcAssessmentQuestionnaire', 'poComments') ? getNestedKeyValue(this.updatedCrcObj, 'crcAssessmentQuestionnaire', 'poComments').length : false;
        if (this.updatedCrcObj.crcAssessmentQuestionnaire) {
          if (this.updatedCrcObj.crcAssessmentQuestionnaire.isQuestionnaireSubmitted) {
            if (this.updatedCrcObj.crcAssessmentQuestionnaire.fisrtThreeQuestionsAnsweredNo) {
              this.crcNotApplicable = true;
              this.crcReviewSubmit = false;
            } else {
              this.crcReviewSubmit = true;
              this.crcNotApplicable = false;
            }

            if (this.updatedCrcObj.crcAssessmentQuestionnaire.poReviewStatus === 'approved') {
              this.isPoRejectedStatus = false;
              this.isPoApprovedStatus = true;
            } else if (this.updatedCrcObj.crcAssessmentQuestionnaire.poReviewStatus === 'rejected') {
              this.isPoRejectedStatus = true;
              this.isPoApprovedStatus = false;
            }
            this.crcQuestionnaireBtnName = 'View';
          } else if (this.updatedCrcObj.crcAssessmentQuestionnaire.status === 'submitted' || this.updatedCrcObj.crcAssessmentQuestionnaire.status === 'saved') {
            this.crcQuestionnaireBtnName = 'View / Edit';
            if (crcData.isUpdated) {
              this.isPoApprovedStatus = false;
              this.isPoRejectedStatus = false;
              this.crcReviewSubmit = false;
            }
          } else {
            this.crcQuestionnaireBtnName = 'Begin';
          }
        }
        this.isSpinner  = false;
        this.crcQuestionnaireLogic(crcData);
        this.createPOCommentHolding();
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching CRC details', 'danger');
    });
  }

  crcQuestionnaireLogic(crcObj) {
    if ('status' in crcObj.crcAssessmentQuestionnaire) {
      this.crcQuestionnaireObject.status = crcObj.crcAssessmentQuestionnaire.status;
      this.crcQuestionnaireObject.remaningQuestionsCount = crcObj.crcAssessmentQuestionnaire.remianingQuestionsCount;
      this.crcQuestionnaireObject.isAllQestionsAnswered = this.crcQuestionnaireObject.remaningQuestionsCount === 0;
    } else {
      this.crcQuestionnaireObject = {
        remaningQuestionsCount: null,
        isAllQestionsAnswered: false,
        status: 'notStarted',
      };
    }
    this.getCrcRemainingQueStatus(crcObj);
  }

  onBeginAssessment(buttonStatus) {
    let isReadonlyFlag = false;
    if (buttonStatus === 'View') {
      isReadonlyFlag = true;
    }
    const config = {
      data: { crcData: this.updatedCrcObj, isReadonly: isReadonlyFlag},
      width: '100rem',
      height: '79vh',
      disableClose: true
    };
    const dialogRef = this.dialog.open(CrcAssessmentQuestionaireModalComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success && this.updatedCrcObj.crcAssessmentQuestionnaire) {
        this.updatedCrcObj.crcAssessmentQuestionnaire = res.data.crcAssessmentQuestionnaire;
        this.crcService.updateCrcDataWithSubject(this.updatedCrcObj);
      }
    });
  }

  onSubmitAssessment() {
    let statusBody;
    if (this.updatedCrcObj.crcAssessmentQuestionnaire.fisrtThreeQuestionsAnsweredNo) {
      statusBody = {
        ['crcAssessmentQuestionnaire.isApplicable']: false,
        ['crcAssessmentQuestionnaire.isQuestionnaireSubmitted']: true,
        'workflow.active': 'complete',
        'workflow.timestamp.submit': new Date,
        'projectId': this.updatedCrcObj.projectId,
        'emailTemplate': 'QuestionnaireSubmission',
        progressScore: 100,
        stepName: 'Complete'
      };
      this.isTimestampAdded = true;
      this.submit(statusBody);
    } else if (this.crcQuestionnaireObject.isAllQestionsAnswered) {
      statusBody = {
        ['crcAssessmentQuestionnaire.isApplicable']: true,
        ['crcAssessmentQuestionnaire.isQuestionnaireSubmitted']: true,
        'projectId': this.updatedCrcObj.projectId,
        'emailTemplate': 'QuestionnaireSubmission',
        progressScore: 25,
        stepName: 'Started'
      };
      this.submit(statusBody);
    }
  }

  onApproveReject(value) {
    if (value === 'rejected') {
      this.poReviewStatus = 'rejected';
    this.crcPoComments.status = '<div><span class="text-danger">*</span>Provide comments</div><div class="text-danger text-size-14 text-weight-400">NOTE: An explanation is required when selecting \'End Process\'</div>';
      if (this.comment) {
        this.isPOSubmitBtnDisable = false;
      } else {
        this.isPOSubmitBtnDisable = true;
      }
    } else if (value === 'approved') {
      this.crcPoComments.status = 'Provide comments (if any)';
      this.poReviewStatus = 'approved';
      this.isPOSubmitBtnDisable = false;
    }
  }

  onChangeComment(comment) {
    if (comment.trim() && this.poReviewStatus === 'rejected') {
      this.isPOSubmitBtnDisable = false;
    } else if (this.poReviewStatus === 'approved'){
      this.isPOSubmitBtnDisable = false;
    } else {
      this.isPOSubmitBtnDisable = true;
    }
  }

  onSubmitPOComments() {
    let reqObject;
    if (this.poReviewStatus === 'rejected') {
      reqObject = {
        ['crcAssessmentQuestionnaire.poReviewStatus']: 'rejected',
        ['crcAssessmentQuestionnaire.isApplicable']: false,
        'workflow.active': 'complete',
        'workflow.timestamp.submit': new Date,
        'projectId': this.updatedCrcObj.projectId,
        'emailTemplate' : 'EndProcess',
        progressScore: 100,
        stepName: 'Complete'
      };
      reqObject['crcAssessmentQuestionnaire.poComments'] = this.updatedCrcObj.crcAssessmentQuestionnaire.poComments ? this.updatedCrcObj.crcAssessmentQuestionnaire.poComments : [];
    } else {
      reqObject = {
        ['crcAssessmentQuestionnaire.poReviewStatus']: 'approved',
        ['crcAssessmentQuestionnaire.isApplicable']: true,
        'workflow.active': 'identify',
        'workflow.timestamp.submit': new Date,
        'projectId': this.updatedCrcObj.projectId,
        progressScore: 50,
        stepName: 'Submit'
      };
      reqObject['crcAssessmentQuestionnaire.poComments'] = [];
    }
    this.isTimestampAdded = true;
    if (this.comment) {
      reqObject['crcAssessmentQuestionnaire.poComments'].unshift({
        comment: this.comment.trim(),
        commentedOn: new Date(),
        commentedBy: this.userDetailsService.getLoggedInCecId()
      });
    }
    this.submit(reqObject);
  }

  createPOCommentHolding() {
    if (this.isPoApprovedStatus || this.isPoRejectedStatus) {
      this.poCommentsHolding.message = '';
      let approvedText;
      if (this.isPoApprovedStatus) {
        approvedText = 'Approved';
      } else if (this.isPoRejectedStatus){
        approvedText = 'Rejected';
      }
      this.updatedCrcObj.crcAssessmentQuestionnaire.poComments.forEach((element, index) => {
        this.poCommentsHolding.message += `
          <p><span class=${approvedText === 'Rejected' ? 'status-rejected' : 'status-approved'}>${approvedText}</span>
           | Comment by <span class="text-link text-italic"><u>${element.commentedBy}</u></span>
          <span class="text-gray-600"> | <span class="text-italic">On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
          <span>${element.comment}</span></p>`;
        if (this.updatedCrcObj.crcAssessmentQuestionnaire.poComments.length > 1 && index < (this.updatedCrcObj.crcAssessmentQuestionnaire.poComments.length - 1)) {
          this.poCommentsHolding.message += `<hr>`;
        }
      });
    }
  }

  submit(event: CommunicationsRegulatoryModel) {
    this.isSpinner = true;
    this.crcService.updateCrcDetails(this.crcId, event).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      if (this.isTimestampAdded && res.data) {
        res.data.isTimestampAdded = true;
      }
      this.crcService.updateCrcDataWithSubject(res.data);
      this.switchingScreen();
      this.isSpinner = false;
    }, () => {
      this.toastService.show('Error in submit', 'Error submitting CRC details', 'danger');
      this.isSpinner = false;
    });
  }

  switchingScreen() {
    if (this.updatedCrcObj.crcAssessmentQuestionnaire.fisrtThreeQuestionsAnsweredNo) {
      this.crcNotApplicable = true;
      this.crcReviewSubmit = false;
    } else if (this.poReviewStatus !==undefined && this.poReviewStatus === 'rejected') {
      this.isPoRejectedStatus = true;
      this.isPoApprovedStatus = false;
    } else if (this.poReviewStatus !==undefined && this.poReviewStatus === 'approved') { 
      this.isPoRejectedStatus = false;
      this.isPoApprovedStatus = true;
    } else if (this.crcQuestionnaireObject.isAllQestionsAnswered) {
      this.crcReviewSubmit = true;
      this.crcNotApplicable = false;
    }
  }

  ngOnDestroy() {
    if (this.getCrcDataSubscription) {
      this.getCrcDataSubscription.unsubscribe();
    }
  }
}