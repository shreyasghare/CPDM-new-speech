import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ActivatedRoute } from '@angular/router';
import { Role } from '@cpdm-model/role';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { docCentral } from '@cpdm-shared/constants/constants';
import { Update } from '@cpdm-model/custom-toast/customToast.model';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { getNestedKeyValue, isBlankString } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-engineering-response',
  templateUrl: './engineering-response.component.html',
  styleUrls: ['./engineering-response.component.scss']
})
export class EngineeringResponseComponent implements OnInit, OnDestroy {
  role = Role;
  engResponseReviewStatus: string;
  poComment: string;
  isReviewing: boolean;
  showLoader = false;
  currentRole: string;
  stepName = 'engineeringResponse';
  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };

  engineeringResponse_status: { icon: string; status: string } = {
    icon: 'chevron',
    status: 'Engineering Response is not applicable'
  };
  engineeringResponseStatus: string;

  docCentralObject: { 'edcsID': string; 'versionRef': string; 'nodeRef': string; 'fileName': string; 'uploadDate': string; _id?: string } = {
    edcsID: '',
    versionRef: '',
    nodeRef: '',
    fileName: '',
    uploadDate: '',
    _id: ''
  };

  engResReviewData = [];
  slData: any;
  slDataStatus: string;

  fileName: string;
  smartLicenseId: any;

  reviewStatus = {
    rejected: {
      icon: 'reject',
      status: 'Rejected',
      message: 'Project Manager will revise the Engineering response and will resubmit.'
    },
    revised: {
      icon: 'submit',
      status: 'Engineering Response Form is revised',
      message: 'Project Manager has revised the Engineering response form. Click Review.'
    },
    approved: {
      icon: 'complete',
      status: 'Approved',
      message: 'The Engineering response Form is approved.'
    }
  };
  currentReviewStatus: any;
  isFileUpdated = false;
  confirmationDialogRef: any;
  projectName: string;
  edcsUpdateToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };
  isSubmitBtnEnabled = false;


  constructor(private toastService: ToastService,
              private smartLicensingService: SmartLicensingService, 
              private docCentralService: DocCentralService,
              private activatedRoute: ActivatedRoute,
              private userDetailsService: UserDetailsService,
              private spinnerService: SpinnerService,
              public dialog: MatDialog,
              private projectDataService: ProjectsDetailService) { }

  ngOnInit() {
    this.projectName = this.projectDataService.getProjectDetails.name;
    this.smartLicenseId = this.activatedRoute.snapshot.params.id;
    this.currentRole = this.userDetailsService.userRole;
    this.getslData();
  }

  getslData() {
    this.showLoader = true;
    this.spinnerService.show();
    this.smartLicensingService.getSmartLicensingData(this.smartLicenseId).subscribe(slData => {
      if (getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'submitted'
          || getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'revised'
          || getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'approved'
          || getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'rejected') {
            this.isSubmitBtnEnabled = false;
      } else {
        const docCentralValue = getNestedKeyValue(slData, 'data', 'docCentralLinks')[0];
        if (docCentralValue && docCentralValue.engineeringResponse) {
          this.isSubmitBtnEnabled = true;
        }
      }
      this.localDataBinding = slData.data;
      if (slData.data && slData.data.status && slData.data.status.hasOwnProperty('engineeringResponse')) {
        this.engineeringResponseStatus = slData.data.status['engineeringResponse'];
      } else {
        this.engineeringResponseStatus = '';
      }
      this.showLoader = false;
      this.spinnerService.hide();
    });
  }

  set localDataBinding(slData) {
    this.slData = slData;
    if (this.slData && this.slData.status && this.slData.status[this.stepName]) {
      this.slDataStatus = this.slData.status[this.stepName];
      this.customDropzoneState.isActive = false;
      this.getCurrentReviewStatus();
    }
    if (this.slData && this.slData.docCentralLinks && this.slData.docCentralLinks.length) {
      this.slData.docCentralLinks.forEach(element => {
        this.docCentralObject = element.engineeringResponse;
        this.customDropzoneState.showUploadSuccess = true;
        this.customDropzoneState.showUploadContainer = true;
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showLoader = false;
      });
    }
    if (this.slData && this.slData.engineeringResponse && this.slData.engineeringResponse.length) {
      this.engResReviewData = this.slData.engineeringResponse;
      this.engResponseReviewStatus = this.slData.engineeringResponse[0].status;
      this.poComment = this.slData.engineeringResponse[0].comment;
      this.isReviewing = false;
    } else {
      this.isReviewing = true;
    }
  }

  /**
 * Display holding status based on submit status
 */
  getCurrentReviewStatus() {
    switch (this.slDataStatus) {
      case 'rejected': this.currentReviewStatus = this.reviewStatus.rejected; break;
      case 'revised': this.currentReviewStatus = this.reviewStatus.revised; break;
      case 'approved': this.currentReviewStatus = this.reviewStatus.approved; break;
    }
  }

  /**
 * Downloads engineering response form & template
 */
  async downloadEnggRespForm(isTemplate) {
    let nodeRef: string;
    let fileName: string;
    try {
      if (isTemplate) {
        // nodeRef = "workspace://SpacesStore/769291f1-a377-4907-b153-9202c7d06ed8";
        const edcsId = 'EDCS-18732661';
        // fileName = "Engineering Response Template v9.3.xlsx";
        this.docCentralService.downloadFromUI(edcsId, 'approved');
      } else {
        if (this.slData && this.slData.docCentralLinks && this.slData.docCentralLinks.length) {
          this.slData.docCentralLinks.forEach(element => {
            nodeRef = element.engineeringResponse.nodeRef;
            fileName = element.engineeringResponse.fileName;
            this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  submitEnggRespToPolicyOwner() {
    this.showLoader = true;
    const status = this.slData && this.slData.status && this.slData.status[this.stepName] === 'rejected' ? 'revised' : 'submitted';
    const statusBody = { data: { [this.stepName]: status } };
    this.smartLicensingService.updateStatus(this.smartLicenseId, statusBody).subscribe(res => {
      res.data.docCentralLinks = this.docCentralObject;
      this.localDataBinding = res.data;
      if (this.slDataStatus === 'revised') {
        this.isFileUpdated = false;
      }
      this.isSubmitBtnEnabled = !(getNestedKeyValue(res, 'data', 'status', 'engineeringResponse') === 'submitted'
                                  || getNestedKeyValue(res, 'data', 'status', 'engineeringResponse') === 'revised');
      this.showLoader = false;
      this.confirmationDialogRef.close();
    }, err => {
      console.error(err);
      this.showLoader = false;
    });
  }

  onUploadEnggRespForm(event: any) {
    this.isSubmitBtnEnabled = false;
    this.customDropzoneState.isActive = false;
    if (this.docCentralObject.nodeRef == null || this.docCentralObject.nodeRef === '') {
      const edcsUploadToast = this.toastService.show(`EDCS Upload In Progress`, event[0].name, 'info', { autoHide: false });

      this.fileName = `${event[0].name}`;
      this.customDropzoneState.showLoader = true;

      const projId = this.projectDataService.getProjectDetails._id;
      const body = {
        title: this.fileName,
        description: 'Engineering Response Form Submit',
        folderPath: 'smartLicensing/root',
        workflow: 'Smart Licensing',
        projectId: projId
      };

      this.docCentralService.uploadToDocCentralNew(event[0], body).subscribe(docCentralServiceRes => {
        if (docCentralServiceRes.success === true) {
          this.customDropzoneState.showUploadSuccess = true;
          this.customDropzoneState.showUploadContainer = true;
          this.customDropzoneState.isFileUploded = true;
          this.customDropzoneState.showLoader = false;
          edcsUploadToast.update(`EDCS Upload Success`, docCentralServiceRes.body.fileName, 'success');

          this.docCentralObject = docCentralServiceRes.body;
          const edcsPatchBody = {
            engineeringResponse: docCentralServiceRes.body._id
          };
          this.smartLicensingService.patchEdcsObj(this.smartLicenseId, edcsPatchBody).subscribe(res => {
            if (this.localDataBinding && this.localDataBinding.docCentralLinks) {
              this.localDataBinding.docCentralLinks = docCentralServiceRes.body;
            }
            this.customDropzoneState.isActive = true;
            this.isSubmitBtnEnabled = true;
          });
        }
      },
        err => {
          this.customDropzoneState.isActive = true;
          this.customDropzoneState.isFileUploded = false;
          this.customDropzoneState.showLoader = false;
          this.isSubmitBtnEnabled = false;
         // edcsUploadToast.update(`EDCS Upload Failed`, 'Please try again after 5 minutes.', 'danger');
         //Fix for DE3270
          edcsUploadToast.update('EDCS Upload Failed', err.error != undefined? err.error.error: "Please try again after 5 minutes.", 'danger');

        }
      );
    } else {
      this.onUpdateFileToDocCentral(event[0]);
    }
  }

  onUpdateFileToDocCentral(event: any): void {
    this.removeToast();
    this.isSubmitBtnEnabled = false;
    this.edcsUpdateToast = this.toastService.show(`EDCS Update In Progress`, event.name, 'info', { autoHide: false });
    this.customDropzoneState.showLoader = true;
    this.customDropzoneState.isFileUploded = true;
    this.isFileUpdated = false;

    const updateToDocCentralBody = {
      title: this.fileName,
      edcsID: this.docCentralObject.edcsID,
      _id: this.docCentralObject._id,
      workflow: 'Smart Licensing',
      projectName: this.projectName
    };
    this.docCentralService.updateFileToDocCentral(event, updateToDocCentralBody, this.smartLicenseId).subscribe(docCentralUploadRes => {
      this.customDropzoneState.showUploadSuccess = true;
      this.customDropzoneState.showUploadContainer = true;
      this.customDropzoneState.showLoader = false;
      this.isFileUpdated = true;
      this.edcsUpdateToast.update(`Upload Success`, event.name, 'success');

      const edcsBody = {
        edcsID: this.docCentralObject.edcsID,
        versionRef: this.docCentralObject.versionRef,
        nodeRef: this.docCentralObject.nodeRef,
        fileName: event.name,
        uploadDate: new Date().toString()
      };

      this.docCentralObject = edcsBody;
      // const edcsPatchBody = {
      //   engineeringResponse: this.docCentralObject
      // };
      // this.smartLicensingService.patchEdcsObj(this.smartLicenseId, edcsPatchBody).subscribe(res => {
      // this.localDataBinding = res.data;
      this.customDropzoneState.isActive = true;
      this.isSubmitBtnEnabled = true;
      // });
    }, err => {
      this.edcsUpdateToast.update('Document upload has failed', docCentral.updateFailed, 'info', { autoHide: false });
      this.customDropzoneState.isActive = true;
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showLoader = false;
      this.isSubmitBtnEnabled = true;
      console.error(err);
    }
    );
  }

  /**
   * Confirmation modal to submit and send review
   * @param action action type
   */
  confirmAction(action: string) {
    const confirmationObj = { confirmationText: 'Are you sure you want to submit the \'Engineering Response\' for review to the Policy Owner?' };
    if (action === 'poReview') {
      confirmationObj.confirmationText = 'Are you sure you want to send the review for the Engineering response form?';
    }
    this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
                                                { data: confirmationObj, width: '35vw', height: 'auto', disableClose: true });

    this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
      if (action === 'poReview') {
        this.sendReview();
      } else {
        this.submitEnggRespToPolicyOwner();
      }
    });
  }

  sendReview() {
    let obj;
    this.showLoader = true;
    obj = {
      stepName: 'Engineering Response',
      progressScore: 33,
      data: {
        status: this.engResponseReviewStatus,
        comment: this.poComment,
        timestamp: new Date(),
        cecId: this.userDetailsService.getLoggedInCecId()
      }
    };
    this.smartLicensingService.updateReviewObject(this.smartLicenseId, 'engineeringResponse', obj).subscribe(slData => {
      this.localDataBinding = slData.data;
      this.showLoader = false;
      this.isReviewing = false;
      if (slData.data && slData.data.workflowTimestamp && slData.data.workflowTimestamp.engineeringResponse) {
        this.isSubmitBtnEnabled = !(getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'submitted'
                                  || getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'revised');
        if (getNestedKeyValue(slData, 'data', 'status', 'engineeringResponse') === 'approved') {
          this.smartLicensingService.enableNextSidebarItem('implementation');
        }
      }
      this.confirmationDialogRef.close();
    }, err => {
      console.error(err);
      this.confirmationDialogRef.close();
      this.showLoader = false;
    });
  }

  reSubmitEnggRespForm() {
    this.customDropzoneState.isActive = true;
    // this.isSubmitBtnEnabled = true;
  }

  ngOnDestroy() {
    // Cleaning up function
    this.removeToast();
  }

  private removeToast(): void {
    if (this.edcsUpdateToast) {
      this.edcsUpdateToast.hide();
    }
  }

  checkEmptyString(str: string): void {
    if(isBlankString(str)){
      this.poComment = '';
    }
  }
}
