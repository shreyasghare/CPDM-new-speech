import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role } from '@cpdm-model/role';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { DocCentral } from '@cpdm-model/DocCentral';
import { SubmitConfirmationComponent } from '../shared/submit-confirmation/submit-confirmation.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RevenueRecognitionModel } from '@cpdm-model/general-compliances/revenue-recognition/revenueRecognition.model';
import { docCentral } from '@cpdm-shared/constants/constants';
import { Update } from '@cpdm-model/custom-toast/customToast.model';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { pipe, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fmv-assessment',
  templateUrl: './fmv-assessment.component.html',
  styleUrls: ['./fmv-assessment.component.scss']
})
export class FmvAssessmentComponent implements OnInit, OnDestroy {
  role = Role;
  revRecId: string;
  docCentralLinks = [];
  fmvStatus = {
    waiting: {
      icon: 'review',
      status: 'Awaiting FMV Document',
      message: 'Revenue Recognition team will upload the FMV document'
    },
    completed: {
      icon: 'complete',
      status: 'FMV Document uploaded',
      message: 'Revenue Recognition team has uploaded the FMV document'
    },
    fmvAssessmentNotRequired: { // when 17 questions are answered as NO
      icon: 'chevron',
      status: 'FMV Assessment is not required',
      message: {
        revRecPO: 'All the questions in the RCL questionannaire is answered as \'NO\'. Hence, this step can either be skipped or you can upload an FMV document',
        otherRole: 'All the questions in the RCL questionannaire is answered as \'NO\'. Hence, this step can be skipped.'
      }
    },
    fmvSkipped: {
      icon: 'chevron',
      status: 'FMV assessment is not applicable',
      message: 'Revenue Recognition team has determined the FMV document does not apply to this project'
    }
  };
  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };
  docCentralObj: DocCentral = {
    edcsID: '',
    versionRef: '',
    nodeRef: '',
    fileName: '',
    uploadDate: '',
    _id: ''
  };
  isFmvUploaded = false;
  finishStatus = false;
  hideme = [];
  isDataAvailable = false;
  isFmvAssessmentRequired = true;
  revRecData: RevenueRecognitionModel;
  isFMVStepAssessed = false;
  confirmationDialogRef: MatDialogRef<SubmitConfirmationComponent, any>;
  isSubmitBtnEnabled = false;
  projectName: string;
  edcsUpdateToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };
  fmvComment = '';
  isFmvNotApplicableChecked = false;
  unsubscribe$ = new Subject();

  constructor(private revRecService: RevenueRecognitionService,
              private toastService: ToastService,
              private activatedRoute: ActivatedRoute, 
              private docCentralService: DocCentralService,
              public dialog: MatDialog,
              private projectDetailsService: ProjectsDetailService) { }

  ngOnInit() {
   this.projectName = this.projectDetailsService.getProjectDetails && this.projectDetailsService.getProjectDetails.name;
   this.getRevRecData();
  }

  getRevRecData(): void {
    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.revRecService.getRevRecObj(this.revRecId).pipe(takeUntil(this.unsubscribe$)).subscribe(revRecObj => {
      this.revRecData = revRecObj;
      this.isFmvAssessmentRequired = getNestedKeyValue(revRecObj, 'rclAssessmentQuestionnaire', 'answeredQuestionsCount') === 17
                                      && getNestedKeyValue(revRecObj, 'rclAssessmentQuestionnaire', 'status') === 'submitted'
                                      ? false : true;
      this.isFMVStepAssessed = getNestedKeyValue(this.revRecData, 'fmvAssessment', 'status') === 'assessed' ? true : false;
      this.isFmvUploaded = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv').length ? true : false;
      this.fmvComment = getNestedKeyValue(this.revRecData, 'fmvNotApplicable', 'comment')
                        ? getNestedKeyValue(this.revRecData, 'fmvNotApplicable', 'comment')
                        : '';
      this.isFmvNotApplicableChecked = getNestedKeyValue(this.revRecData, 'fmvNotApplicable');
      if (this.isFmvUploaded) {
        this.isSubmitBtnEnabled = true;
        this.fileUploadState();
        this.customDropzoneState.isActive = !this.isFMVStepAssessed;
        this.docCentralObj.fileName = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv')[0]['fileName'];
        this.docCentralObj.edcsID = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv')[0]['edcsID'];
        this.docCentralObj.nodeRef = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv')[0]['nodeRef'];
        this.docCentralObj.versionRef = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv')[0]['versionRef'];
        this.docCentralObj._id = getNestedKeyValue(revRecObj, 'docCentralLinks', 'fmvAssessment', 'fmv')[0]['_id'];
      }
      this.manageSubmitButton();
      this.isDataAvailable = true;
    }, () => {
      this.isDataAvailable = false;
    });
  }

  fileUploadState(): void {
    if (this.isFmvUploaded) {
      this.customDropzoneState.showUploadContainer = true;
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showUploadSuccess = false;
    }
  }

  manageSubmitButton(): void {
    if (getNestedKeyValue(this.revRecData, 'fmvNotApplicable')) {
      this.isSubmitBtnEnabled = false;
    } else {
      if ((this.isFmvUploaded && !this.isFmvNotApplicableChecked && !this.isFMVStepAssessed) 
          || (this.fmvComment && this.isFmvNotApplicableChecked)) {
        this.isSubmitBtnEnabled = true;
      }
       else {
        this.isSubmitBtnEnabled = false;
      }
    }
  }

  onChecked(event) {
    event.checked ? this.isFmvNotApplicableChecked = true : this.isFmvNotApplicableChecked = false;
    this.manageSubmitButton();
    this.fileUploadState();
  }

  getComment(event: string): void {
    this.fmvComment = event;
    this.manageSubmitButton();
  }

  onUploadClicked(event: any) {
     // let fileName = `${event[0].name}`;
    if (this.docCentralObj.nodeRef == null || this.docCentralObj.nodeRef === '') {
      const fileName = event.files ? event.files[0].name : `${event[0].name}`;
      const docCentralObj = event.files ? event.files[0] : event[0];
      const uploadToast = this.toastService.show(`EDCS Upload In Progress`, fileName, 'info', { autoHide: false });
      this.customDropzoneState.showLoader = true;
      this.customDropzoneState.isFileUploded = true;

      const projId = this.projectDetailsService.getProjectDetails._id;

      const body = {
        title: fileName,
        description: 'FMV document for Revenue Recognition Complete stage',
        folderPath: 'revenueRecognition/root',
        workflow: 'Revenue Recognition',
        projectId: projId
      };
      this.docCentralService.docCentralUpload(docCentralObj, body, this.revRecId).pipe(takeUntil(this.unsubscribe$)).subscribe(docCentralUploadRes => {
        const { edcsID, versionRef, nodeRef, _id } = docCentralUploadRes;
        if (edcsID) {
          const uploadDate = new Date().toString();
          const edcsBody: DocCentral = {
            edcsID, versionRef, nodeRef,
            fileName, uploadDate, _id
          };
          this.revRecService.patchFmvObj(this.revRecId, { fmv: docCentralUploadRes._id }).pipe(takeUntil(this.unsubscribe$)).subscribe(edcsUpdateRes => {
            uploadToast.update('EDCS Upload Success', fileName, 'success');
            edcsBody.type = 'fmv';
            this.docCentralLinks.push(edcsBody);
            this.customDropzoneState.isFileUploded = true;
            this.customDropzoneState.showLoader = false;
            this.customDropzoneState.showUploadSuccess = true;
            // this.finishStatus = edcsUpdateRes.docCentralLinks
            //   && edcsUpdateRes.docCentralLinks.complete
            //   && edcsUpdateRes.docCentralLinks.complete.fmv ? true : false;
            this.isFmvUploaded = getNestedKeyValue(edcsUpdateRes, 'docCentralLinks', 'fmvAssessment', 'fmv').length ? true : false;
            this.isSubmitBtnEnabled = true;
          }, () => {
            this.customDropzoneState.isFileUploded = true;
            this.customDropzoneState.showLoader = false;
          });
          this.docCentralObj = edcsBody;
        } else {
          uploadToast.update('Upload failed', 'Please try again after 5 minutes.', 'danger');
          this.customDropzoneState.isFileUploded = true;
          this.customDropzoneState.showLoader = false;
        }
      }, err => {
        uploadToast.update('Upload failed', 'Please try again after 5 minutes.', 'danger');
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showLoader = false;
      });
    }
    else {
      this.onUpdateFileToDocCentral(event);
    } 
  }

  onUpdateFileToDocCentral(event: any): void {
    this.removeToast();
    this.edcsUpdateToast = this.toastService.show(`EDCS Update In Progress`, event[0].name, 'info', {autoHide: false});
    this.customDropzoneState.showLoader = true;
    this.customDropzoneState.isFileUploded = true;
    this.isSubmitBtnEnabled = false;

    const updateToDocCentralBody = {
      title: event[0].name,
      edcsID: this.docCentralObj.edcsID,
      _id: this.docCentralObj._id,
      workflow: 'Revenue Recognition',
      projectName: this.projectName
    };

    this.docCentralService.updateFileToDocCentral(event[0], updateToDocCentralBody, this.revRecId).pipe(takeUntil(this.unsubscribe$)).subscribe(docCentralUploadRes => {
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showUploadSuccess = true;
      this.customDropzoneState.showLoader = false;
      this.isSubmitBtnEnabled = true;
      this.docCentralObj.fileName = event[0].name; 
      this.edcsUpdateToast.update('Upload Success', event[0].name, 'success');
    }, err => {
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showLoader = false;

        this.edcsUpdateToast.update('Document upload has failed',
        docCentral.updateFailed,
        'info', { autoHide : false });
        console.error(err);
    }
    );
  }
 
  onSubmit(): void {
    const confirmationMsg = this.isFmvNotApplicableChecked
                            ? `FMV <b>not</b> required for the workflow. Do you want to continue with your action?`
                            : `Are you sure you have uploaded the FMV document and want to move to <b>Complete</b> step?`;
    this.confirmationDialogRef = this.dialog.open(SubmitConfirmationComponent, {
      data: { isSubmitConfirmation: true, confirmationMsg }, width: '35vw', height: 'auto', disableClose: true
    });
    this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
      this.updateStatusToNode();
    });
    this.confirmationDialogRef.afterClosed().subscribe();
  }

  private updateStatusToNode(): void {
    if (this.isFmvNotApplicableChecked) {
      const updateObject = {
        fmvNotApplicable: {
          status: 'submitted',
          comment: this.fmvComment
        },
      };
      this.revRecService.updateRevRecObject(this.revRecId, updateObject).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
        const { success, data } = res;
        if (success) {
          this.revRecData = data;
          this.fmvComment = getNestedKeyValue(this.revRecData, 'fmvNotApplicable', 'comment');
          this.revRecService.enableNextSidebarItem('complete');
          this.isSubmitBtnEnabled = false;
          this.confirmationDialogRef.close(res);
        }
      }, () => {
        this.isSubmitBtnEnabled = true;
      });
    } else {
      this.revRecService.patchStatusObj(this.revRecId, 'fmvAssessment', {status: 'assessed'}).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        if(this.isFmvAssessmentRequired) {
          this.revRecService.enableNextSidebarItem('complete');
        }
        this.getRevRecData();
        this.confirmationDialogRef.close(res);
      }, err => {
        console.error(err);
      });
    }
  }

  ngOnDestroy() {
    // Cleaning up function
    this.removeToast();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private removeToast(): void {
    if (this.edcsUpdateToast) {
      this.edcsUpdateToast.hide();
    }
  }
}
