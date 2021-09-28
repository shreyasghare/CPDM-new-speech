import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';

@Component({
  selector: 'app-crc-identify-pm',
  templateUrl: './crc-identify-pm.component.html',
  styleUrls: ['./crc-identify-pm.component.scss'],
  providers: [DatePipe]
})
export class CrcIdentifyPmComponent implements OnInit, OnDestroy {
  @Output() openRecommendationsDialog = new EventEmitter();
  @Output() submitRecommendations: EventEmitter<CommunicationsRegulatoryModel> = new EventEmitter<CommunicationsRegulatoryModel>();
  waitHoldingMsg = {
    statusIcon: 'wait',
    status: 'The Regulatory Compliance Team is identifying the recommendations. Please wait.'
  };
  reviewHoldingMsg = {
    statusIcon: 'notes',
    status: 'Please review the Communications Regulatory Compliance recommendations',
    message: ''
  };
  poCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Comments from the RCT team',
    message: ''
  };
  pmCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Comments from the PM team',
    message: ''
  };
  newCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Provide comments (if any)'
  };
  implCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Implementation comments from the Regulatory Compliance Team',
    message: ''
  };
  naHoldingMsg = {
    statusIcon: 'notApplicable',
    status: 'Communication Regulatory Compliance is \'Not applicable\'',
    message: ''
  };

  crcData: CommunicationsRegulatoryModel;
  isApplicable: boolean;
  recommendationStatus: string;
  isMoveToIdentify: boolean;
  recommendationApprovalStatus: string;
  isPOCommentsAvailable = false;
  isPMCommentsAvailable = false;
  comment: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private datepipe: DatePipe,
    private crcService: CommunicationsRegulatoryService,
    private userDetailsService: UserDetailsService) { }

  ngOnInit() {
    this.getCrcDataSub();
  }

  /**
   * @description Get CRC details data from subject
   */
  private getCrcDataSub() {
    this.crcService.getCrcDataSub
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.crcData = res;
        this.isApplicable = getNestedKeyValue(this.crcData, 'crcAssessmentQuestionnaire', 'isApplicable') || getNestedKeyValue(this.crcData, 'crcAssessmentQuestionnaire', 'isApplicable') === undefined;
        if (this.isApplicable) {
          this.recommendationStatus = getNestedKeyValue(this.crcData, 'identify', 'recommendationStatus');
          this.isPOCommentsAvailable = getNestedKeyValue(this.crcData, 'identify', 'poComments') ? getNestedKeyValue(this.crcData, 'identify', 'poComments').length : false;
          this.isPMCommentsAvailable = getNestedKeyValue(this.crcData, 'identify', 'pmComments') ? getNestedKeyValue(this.crcData, 'identify', 'pmComments').length : false;
          this.isMoveToIdentify = getNestedKeyValue(this.crcData, 'implement', 'report', 'moveToIdentify');
          this.createReviewHoldingMsg();
          this.createPOCommentHoldingMsg();
          this.createPMCommentHoldingMsg();
          this.createImplCommentHoldingMsg();
        } else if (getNestedKeyValue(this.crcData, 'crcAssessmentQuestionnaire', 'fisrtThreeQuestionsAnsweredNo')) {
            this.naHoldingMsg.message = 'The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy is ‘Not Applicable’ for this project. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.';
        } else {
          this.naHoldingMsg.message = 'The Regulatory Compliance Team (RCT) ended the process. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.';
        }
      }
    });
  }

  /**
   * @description Creates content for review banner
   */
  createReviewHoldingMsg() {
    if (this.recommendationStatus === 'rejected') {
      this.reviewHoldingMsg.statusIcon = 'reject';
      this.reviewHoldingMsg.status = 'CRC Recommendations rejected by the PM team';
      this.reviewHoldingMsg.message = 'Regulatory Compliance Team will re-submit the recommendations';
    } else if (this.recommendationStatus === 'approved') {
      this.reviewHoldingMsg.statusIcon = 'complete';
      this.reviewHoldingMsg.status = this.isMoveToIdentify ? 'The Regulatory Compliance Team is identifying the recommendations. Please wait.' : 'Communications Regulatory Compliance recommendations \'Approved\'';
      this.reviewHoldingMsg.message = '';
    } else {
      this.reviewHoldingMsg.statusIcon = 'notes';
      this.reviewHoldingMsg.status = 'Please review the Communications Regulatory Compliance recommendations';
      this.reviewHoldingMsg.message = '';
    }
  }

  /**
   * @description Creates content for PO comments banner
   */
  createPOCommentHoldingMsg() {
    if (this.recommendationStatus) {
      this.poCommentsHoldingMsg.message = '';
      this.crcData.identify.poComments.forEach((element, index) => {
        this.poCommentsHoldingMsg.message += `
          <p>Comment by <span class='text-link text-italic'>${element.commentedBy}</span>
          <span class='text-gray-600'> | <span class='text-italic'>On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
          <span>${element.comment}</span></p>`;
        if (this.crcData.identify.poComments.length > 1 && index < (this.crcData.identify.poComments.length - 1)) {
          this.poCommentsHoldingMsg.message += `<hr>`;
        }
      });
    }
  }

  /**
   * @description Creates content for PM comments banner
   */
  createPMCommentHoldingMsg() {
    if (this.recommendationStatus === 'rejected' || this.recommendationStatus === 'approved') {
      this.pmCommentsHoldingMsg.message = '';
      this.crcData.identify.pmComments.forEach((element, index) => {
        this.pmCommentsHoldingMsg.message += `
          <p><span class=${element.status === 'rejected' ? 'status-rejected' : 'status-approved'}>${element.status}</span> | Comment by <span class='text-link text-italic'>${element.commentedBy}</span>
          <span class='text-gray-600'> | <span class='text-italic'>On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
          <span class=${!element.comment ? 'text-gray-600' : ''}>${element.comment ? element.comment : 'No comments'}</span></p>`;
        if (this.crcData.identify.pmComments.length > 1 && index < (this.crcData.identify.pmComments.length - 1)) {
          this.pmCommentsHoldingMsg.message += `<hr>`;
        }
      });
    }
  }

  /**
   * @description Creates content for implementation comment banner
   */
  createImplCommentHoldingMsg() {
    if (getNestedKeyValue(this.crcData, 'implement', 'report', 'poComments') && getNestedKeyValue(this.crcData, 'implement', 'report', 'poComments').length) {
      this.implCommentsHoldingMsg.message = '';
      this.crcData.implement.report.poComments.forEach((element, index) => {
        if (element.commentForIdentify) {
          this.implCommentsHoldingMsg.message += `
            <p><span class=${element.status === 'rejected' ? 'status-rejected' : 'status-approved'}>${element.status}</span> | Comment by <span class='text-link text-italic'>${element.commentedBy}</span>
            <span class='text-gray-600'> | <span class='text-italic'>On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
            <span class=${!element.comment ? 'text-gray-600' : ''}>${element.comment ? element.comment : 'No comments'}</span></p>`;
          if (this.crcData.implement.report.poComments.length > 1 && index < (this.crcData.implement.report.poComments.length - 1)) {
            this.implCommentsHoldingMsg.message += `<hr>`;
          }
        }
      });
    }
  }

  /**
   * @description Opens modal dialog to view CRC recommendations
   */
  openDialog() {
    this.openRecommendationsDialog.emit();
  }

  /**
   * @description Executes on change of review
   */
  onReviewChange() {
    if (this.recommendationApprovalStatus === 'rejected') {
      this.newCommentsHoldingMsg.status = '<div><span class="text-danger">*</span>Provide comments</div><div class="text-danger text-size-14 text-weight-400">NOTE: An explanation is required when selecting \'Reject\'</div>';
    } else {
      this.newCommentsHoldingMsg.status = 'Provide comments (if any)';
    }
  }

  /**
   * @description Submits review for PO CRC recommendations
   */
  submit() {
    let reqObject;
    reqObject = {
      ['identify.recommendationStatus']: this.recommendationApprovalStatus,
      projectId: this.crcData.projectId,
      emailTemplate: this.recommendationApprovalStatus == 'rejected' ? 'NotAcceptRecommendations' : 'AcknowledgeRecommendations'
    };
    if (this.recommendationApprovalStatus === 'approved') {
      reqObject.progressScore = 75;
      reqObject.stepName = 'Identify';
      reqObject['workflow.active'] = 'implement';
      reqObject['workflow.timestamp.identify'] =  new Date;
      if (this.isMoveToIdentify) {
        reqObject['implement.report.moveToIdentify'] = false;
      }
    }
    reqObject['identify.pmComments'] = this.crcData.identify.pmComments ? this.crcData.identify.pmComments : [];
    reqObject['identify.pmComments'].unshift({
      status: this.recommendationApprovalStatus,
      comment: this.comment,
      commentedOn: new Date(),
      commentedBy: this.userDetailsService.getLoggedInCecId()
    });
    this.submitRecommendations.emit(reqObject);
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
