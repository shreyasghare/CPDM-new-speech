import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Role } from '@cpdm-model/role';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CommunicationsRegulatoryModel, CRCRecommendationsObjectModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';

@Component({
  selector: 'app-crc-identify-po',
  templateUrl: './crc-identify-po.component.html',
  styleUrls: ['./crc-identify-po.component.scss'],
  providers: [DatePipe]
})

export class CrcIdentifyPoComponent implements OnInit, OnDestroy {
  @Output() openRecommendationsDialog = new EventEmitter();
  @Output() submitRecommendations: EventEmitter<CommunicationsRegulatoryModel> = new EventEmitter<CommunicationsRegulatoryModel>();
  role = Role;
  crcId: string;
  crcData: CommunicationsRegulatoryModel;
  isApplicable: boolean;
  crcRecommendationsId: string;
  recommendationStatus: string;
  isMoveToIdentify: boolean;
  isUpdated: boolean;
  isPOCommentsAvailable = false;
  isPMCommentsAvailable = false;
  crcRecommendationsObject: CRCRecommendationsObjectModel;
  isNewRecommendationsAvailable: boolean;
  comment: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  addRecHoldingMsg = {
    statusIcon: 'notes',
    status: 'Start adding applicable CRC recommendations'
  };
  newCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Provide comments (if any)'
  };
  reviewHoldingMsg = {
    statusIcon: 'wait',
    status: 'Recommendations submitted for review',
    message: 'The project team will review the recommendations to provide feedback or acknowledgement'
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private datepipe: DatePipe,
    private userDetailsService: UserDetailsService,
    private crcService: CommunicationsRegulatoryService) { }

  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.parent.params.id;
    this.getCrcDataSub();
    this.getRecommendationDataSub();
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
          this.isUpdated = this.crcData.isUpdated;
          this.createReviewHoldingMsg();
          this.createPOCommentHoldingMsg();
          this.createPMCommentHoldingMsg();
          this.createImplCommentHoldingMsg();
          if (this.crcData.crcRecommendationsId) {
            this.crcRecommendationsId = this.crcData.crcRecommendationsId;
          }
        } else if (getNestedKeyValue(this.crcData, 'crcAssessmentQuestionnaire', 'fisrtThreeQuestionsAnsweredNo')) {
          this.naHoldingMsg.message = 'The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy is ‘Not Applicable’ for this project. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.';
        } else {
          this.naHoldingMsg.message = 'The Regulatory Compliance Team (RCT) ended the process. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.';
        }
      }
    });
  }

  /**
   * @description Get recommendations data from subject
   */
  private getRecommendationDataSub() {
    this.crcService.getRecommendationDataSub
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if (res) {
        this.crcRecommendationsObject = res;
        this.isNewRecommendationsAvailable = res.isNewRecommendationsAvailable;
      }
    });
  }

  /**
   * @description Create content for review banner
   */
  createReviewHoldingMsg() {
    if (this.recommendationStatus === 'rejected') {
      this.reviewHoldingMsg.statusIcon = 'reject';
      this.reviewHoldingMsg.status = 'CRC Recommendations rejected by the PM team';
      this.reviewHoldingMsg.message = 'The Regulatory Compliance Team will review the comment(s) provided and re-submit the list of recommendations';
    }  else if (this.recommendationStatus === 'approved') {
      this.reviewHoldingMsg.statusIcon = this.isMoveToIdentify ? 'notes' : 'complete';
      this.reviewHoldingMsg.status = `Communications Regulatory Compliance recommendations ${this.isMoveToIdentify ? '' : '\'Approved\''}`;
      this.reviewHoldingMsg.message = '';
    } else {
      this.reviewHoldingMsg.statusIcon = 'wait';
      this.reviewHoldingMsg.status = 'Recommendations submitted for review';
      this.reviewHoldingMsg.message = 'The project team will review the recommendations to provide feedback or acknowledgement';
    }
  }

  /**
   * @description Creates content for PO comments banner
   */
  createPOCommentHoldingMsg() {
    if (getNestedKeyValue(this.crcData, 'identify', 'poComments') && getNestedKeyValue(this.crcData, 'identify', 'poComments').length) {
      this.poCommentsHoldingMsg.message = '';
      this.crcData.identify.poComments.forEach((element, index) => {
        this.poCommentsHoldingMsg.message += `
          <p>Comment by <span class="text-link text-italic">${element.commentedBy}</span>
          <span class="text-gray-600"> | <span class="text-italic">On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
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
    if (getNestedKeyValue(this.crcData, 'identify', 'pmComments') && getNestedKeyValue(this.crcData, 'identify', 'pmComments').length) {
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
   * @description Opens modal dialog to add CRC recommendations
   */
  openDialog() {
    this.openRecommendationsDialog.emit();
  }

  /**
   * @description Submits CRC recommendations to PM for review
   */
  submit() {
    let reqObject;    
    if (this.recommendationStatus === 'submitted') {
      reqObject.identify = this.crcData.identify;
    } else if (this.recommendationStatus === 'rejected' || this.isMoveToIdentify || this.isUpdated) {
      reqObject = {
        ['identify.recommendationStatus']: 'resubmitted'
      };
    } else {
      reqObject = {
        ['identify.recommendationStatus']: 'submitted'
      };
    }
    reqObject['identify.poComments'] = this.crcData.identify.poComments ? this.crcData.identify.poComments : [];
    if (this.comment) {
      reqObject['identify.poComments'].unshift({
        comment: this.comment,
        commentedOn: new Date(),
        commentedBy: this.userDetailsService.getLoggedInCecId()
      });
    }
    reqObject.projectId = this.crcData.projectId;
    reqObject.emailTemplate = this.crcData.identify.recommendationStatus ==='rejected'? 'SendUpdatedRecommendations':'NewRecommendations';
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
