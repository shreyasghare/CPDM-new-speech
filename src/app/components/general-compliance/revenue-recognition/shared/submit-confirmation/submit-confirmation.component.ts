import { Component, OnInit, Inject, OnDestroy, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { Subscription } from 'rxjs';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-submit-confirmation',
  templateUrl: './submit-confirmation.component.html',
  styleUrls: ['./submit-confirmation.component.scss']
})
export class SubmitConfirmationComponent implements OnInit, OnDestroy {
  onConfirmAction = new EventEmitter();
  projectName: any;
  projectNameForFile: any;
  revRecId: any;
  isRclDocUploaded = false;
  docCentralResObj: any;
  showLoader = false;
  generatedRclDocFromNodeSubscription: Subscription;
  isReinitiate: boolean;
  isSLDemotoELO: boolean;
  slId: string;
  isSubmitConfirmation = false;
  isReviewConfirmation = false;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private activatedRoute: ActivatedRoute,
              private docCentralService: DocCentralService,
              private revRecService: RevenueRecognitionService,
              private projectDetailsService: ProjectsDetailService,
              private spinnerService: SpinnerService,
              private smartLicensingService: SmartLicensingService,
              private toastService: ToastService) { }

  ngOnInit() {
    if (getNestedKeyValue(this.data, 'reinitiateObj', 'isReinitiate')) {
      this.isReinitiate = true;
      this.revRecId = this.data.revRecObj._id;
    } 
    else if (getNestedKeyValue(this.data, 'isSubmitConfirmation')) {
      this.isSubmitConfirmation = true;
    }
    else if (getNestedKeyValue(this.data, 'isReviewConfirmation')) {
      this.isReviewConfirmation = true;
    }
    else if (this.data.revRecObj && this.data.revRecObj._id) {
      this.revRecId = this.data.revRecObj._id;
    }
    this.projectName = this.projectDetailsService.getProjectDetails.name;
    this.projectNameForFile = this.projectName.replace(/[\s+,\/]/g, '-');
  }
    
    onCancel(event?: any) {
      event ? this.dialogRef.close(event) : this.dialogRef.close();
    }

  onConfirm() {
    this.showLoader = true;
    let statusBody = {};
    if(this.isSubmitConfirmation || this.isReviewConfirmation) {
      this.onConfirmAction.emit({success: true});
    }
    else if (this.isReinitiate) {
      statusBody = {status: 'reinitiated'};
      this.revRecService.patchStatusObj(this.revRecId, 'rclPidSubmit', statusBody).subscribe(statusRes => {
        this.showLoader = false;
        this.revRecService.enableNextSidebarItem('rclPidSubmit');
        this.onCancel('reinitiated');
      }, err => {
        console.error(err);
      });
    } else {
      const docCentralPostBody = {
        fileName: `${this.projectNameForFile}_Revenue_Recognition_Assessment_Checklist.docx`,
        title: `${this.projectNameForFile}_Revenue_Recognition_Assessment_Checklist.docx`,
        description: 'Assessment Checklist doc file',
        permissions: this.docCentralService.generateDocCentralPermissionArray(),
        projectId: this.data && this.data.projectId ? this.data.projectId : ''
      };
      this.generatedRclDocFromNodeSubscription = this.revRecService.generateRclDocFromNode(this.revRecId, this.projectNameForFile, docCentralPostBody).subscribe(docCentralUploadRes => {
        // this.isRclDocUploaded = true;
        this.docCentralResObj = {
          edcsID: docCentralUploadRes.edcsID,
          versionRef: docCentralUploadRes.versionRef,
          nodeRef: docCentralUploadRes.nodeRef,
          fileName: `${this.projectNameForFile}_Revenue_Recognition_Assessment_Checklist.docx`,
          uploadDate: new Date().toString(),
          _id: docCentralUploadRes._id
        };
        const edcsPatchBody = {
          rclPidSubmit: {assessmentChecklist: this.docCentralResObj._id} //US10811 - Changes to save doc central reference id in resepctive collections
        };

        this.revRecService.patchEdcsObj(this.revRecId, edcsPatchBody).subscribe(edcsUpdateRes => {
          if (edcsUpdateRes.rclPidSubmit) {
            statusBody = {status: 'revised'};
          } else {
            statusBody = {status: 'submitted'};
          }
          this.revRecService.patchStatusObj(this.revRecId, 'rclPidSubmit', statusBody).subscribe(statusRes => {
            this.revRecService.enableNextSidebarItem('rclPidApprove');
            this.toastService.show('EDCS Upload Success', `${this.projectNameForFile}_Revenue_Recognition_Assessment_Checklist.docx`, 'success');
            this.showLoader = false;
            this.onCancel('uploadSuccess');
          }, err => {
            console.error(err);
          });
        });
      }, err => {
        this.toastService.show('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
        this.onCancel();
        console.error(err);
      });
    }
  }

  ngOnDestroy() {
    if (this.generatedRclDocFromNodeSubscription) {
      this.generatedRclDocFromNodeSubscription.unsubscribe();
    }
  }
}
