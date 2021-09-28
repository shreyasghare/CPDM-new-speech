import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { DocCentralPostBody } from '@cpdm-model/docCentralPostBody.model';
import { docCentral } from '@cpdm-shared/constants/constants';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Update } from '@cpdm-model/custom-toast/customToast.model';

@Component({
  selector: 'app-policy-testing',
  templateUrl: './policy-testing.component.html',
  styleUrls: ['./policy-testing.component.scss']
})
export class PolicyTestingComponent implements OnInit, OnDestroy {
  @Input() isPMscreen: boolean;
  testingComplete = false;
  performingTests = true;
  projectId: string;
  fileName: string;
  showFileUploadStatus = false;
  files: any = [];
  uploadSuccessRes: any;
  projectObj: any;
  policyTesting: any;
  policyTestingPmObj: {};
  apiResponseReady: boolean;
  showLoader = false;

  docCentralObj: any = {
    edcsRefLink: '',
    edcsID: '',
    fileName: ''
  };
  projectName: string;
  disableUpload = true;
  // to disable download while untill it gets data from api
  isDownloadEnabled = true;
  nodeRef: string;
  isFileUploaded = false;
  isSubmitBtnDisabled = true;

  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };

  showSkipCheckbox = false;
  isSkipValidationChecked = false;
  disableSkipValidation = false;
  isChecklistSynced = true;
  disableSyncAdrChecklist = true;
  disableSyncBtn = true;
  showSuccessIcon = false;
  syncAdrChecklistMsg = 'ADR checklist data in sync with the latest changes.';
  edcsUploadToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };
  originalProjectName: string;
  performTest= `The Accessibility Team is performing tests. The report will be available when the Policy Testing
  step is complete.`;

  constructor(private activatedRoute: ActivatedRoute, private toastService: ToastService,
              private accessibilityService: AccessibilityProcessService,
              private docCentralService: DocCentralService,
              private projectDetailsService: ProjectsDetailService,
              private loaderService: LoaderService,
              private utilsService: UtilsService,
              private userDetailsService: UserDetailsService) { }

  async downloadFile(source: string) {
    this.projectName = this.projectDetailsService.getProjectDetails.name.replace(/\s+/g, '-');
    const productVersion = this.projectDetailsService.getProjectDetails.productVersion;
    const fileName = productVersion != '' ? `AccTest_Cisco_${this.projectName}_${productVersion}.docx` : `AccTest_Cisco_${this.projectName}.docx`;
    this.isDownloadEnabled = false;

    if (source == 'node') {
        try {
          await this.utilsService.downloadFileFromNode(`word/policyTesting/${this.projectId}`, fileName);
        } catch (error) {
          console.error(error);
        }
        this.isDownloadEnabled = true;

      } else {
        try {
          await this.docCentralService.downloadFileFromDocCentral(this.nodeRef, this.fileName);
        } catch (error) {
          console.error(error);
        }
      }
  }

  uploadToDocCentral() {
    this.isSubmitBtnDisabled = true;
    this.disableSyncAdrChecklist = true;
    this.disableSyncBtn = true;
    this.edcsUploadToast = this.toastService.show('Validation In Progress', this.fileName, 'info', {autoHide: false});
    if (this.files.type && this.files.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      this.customDropzoneState.showLoader = true;
      this.disableSkipValidation = true;
      // this.isChecklistSynced = false;

      const userId = this.userDetailsService.getLoggedInCecId();
      this.accessibilityService.validateFile(this.files, this.projectId, userId, this.isSkipValidationChecked).subscribe(res => {
        if (res.success && res.message === 'Valid document') {
          if (this.files && !this.docCentralObj.edcsID) {
              this.isSubmitBtnDisabled = true;
              const body: DocCentralPostBody = {
                // title:'Policy Testing',
                title: this.fileName.substr(0, this.fileName.length-5),
                description: 'Policy Testing Word Document',
                folderPath: 'accessibility/policyTesting',
                securityLevel: 'Cisco Confidential',
                status: 'Approval.N.A',
                workflow: 'Accessibility',
                projectId: this.projectId
              };
              // let edcsUploadToast = null;
              this.docCentralService.uploadToDocCentralNew(this.files, body).subscribe(edcsRes => {
                if (edcsRes.success === false) {
                  this.customDropzoneState.showLoader = true;
                  this.edcsUploadToast.update('EDCS Upload In Progress', this.fileName, 'info', {autoHide: false});
                } else if (edcsRes.success === true) {
                  if (getNestedKeyValue(edcsRes.body, 'edcsID') !== undefined && getNestedKeyValue(edcsRes.body, 'edcsID') !== ''
                    && getNestedKeyValue(edcsRes.body, 'nodeRef') !== undefined && getNestedKeyValue(edcsRes.body, 'nodeRef') !== ''
                    && getNestedKeyValue(edcsRes.body, 'versionRef') !== undefined && getNestedKeyValue(edcsRes.body, 'versionRef') != '') {

                    this.docCentralObj = edcsRes.body;
                    const edcsBody = {policyTesting: edcsRes.body._id};

                    this.docCentralService.patchEdcsObj(this.projectId, edcsBody).subscribe(res => {
                      if(!this.isSkipValidationChecked) {
                        this.manageSyncAdrViewAfterUpdate(res);
                        this.adrChecklistViewAfterSync(res);
                      } else {
                        this.isSubmitBtnDisabled = false;
                      }

                      this.customDropzoneState.showUploadSuccess = true;
                      this.customDropzoneState.showUploadContainer = true;
                      this.customDropzoneState.isFileUploded = true;
                      this.customDropzoneState.showLoader = false;
                      this.showSkipCheckbox = false;
                      // this.disableSyncBtn = false;
                      this.edcsUploadToast.update('EDCS Upload Success', this.fileName, 'success');
                    });
                  } else {
                    this.fileUploadFailed();
                    this.edcsUploadToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
                  }
                }
              }, err => {
                this.fileUploadFailed();
                this.edcsUploadToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
              });
          } else {
            this.onUpdateFileToDocCentral();
          }
        } else {
          let errHeader = '';
          this.fileUploadFailed();
          if(res.errHeader) {
            errHeader = res.errHeader;
            this.showSkipCheckbox = true;
            this.disableSkipValidation = false;
          } else errHeader = 'Invalid file'
          this.edcsUploadToast.update(errHeader, res.message,  'danger');
        }
      }, err => {
        this.fileUploadFailed();
        this.edcsUploadToast.update('Invalid file', 'Http error occured.', 'danger');
      });
    } else {
      this.edcsUploadToast.update('Invalid file', 'Please upload word file only.', 'danger');
    }
  }

  private fileUploadFailed(): void {
    this.manageSyncAdrViewAfterUpdate(this.projectObj);
    this.adrChecklistViewAfterSync(this.projectObj);
    this.isSubmitBtnDisabled = true;
    // this.customDropzoneState.isFileUploded = true;
    this.customDropzoneState.showLoader = false;
  }
  private fileUpdateFailed(): void {
    this.manageSyncAdrViewAfterUpdate(this.projectObj);
    this.adrChecklistViewAfterSync(this.projectObj);
    this.isSubmitBtnDisabled = false;
    this.customDropzoneState.showLoader = false;
  }

  onUpdateFileToDocCentral(): void {
    this.disableSyncBtn = true;
    this.isSubmitBtnDisabled = true;
    this.edcsUploadToast.update('EDCS Update In Progress', this.fileName, 'info', {autoHide: false});
    this.docCentralObj.title = this.fileName.substr(0, this.fileName.length-5);
    this.docCentralObj.workflow = 'Accessibility';
    this.docCentralObj.projectName = this.originalProjectName;

    this.docCentralService.updateToDocCentralNew(this.files, this.docCentralObj, this.projectId).subscribe(edcsRes => {
      const {success, message, data} = edcsRes;

      if (success && data) {
        if (getNestedKeyValue(data, 'edcsID') !== undefined && getNestedKeyValue(data, 'edcsID') !== ''
        && getNestedKeyValue(data, 'nodeRef') !== undefined && getNestedKeyValue(data, 'nodeRef') !== ''
        && getNestedKeyValue(data, 'versionRef') !== undefined && getNestedKeyValue(data, 'versionRef') !== '') {
            // const edcsBody = {policyTesting: data._id};
            // this.docCentralService.patchEdcsObj(this.projectId, edcsBody).subscribe(res => {
              this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(accRes => {
                if(!this.isSkipValidationChecked) {
                  this.manageSyncAdrViewAfterUpdate(accRes[0]);
                  this.adrChecklistViewAfterSync(accRes[0]);
                } else this.isSubmitBtnDisabled = false;
                this.docCentralObj.fileName = this.fileName;
                this.customDropzoneState.isFileUploded = true;
                this.customDropzoneState.showUploadSuccess = true;
                this.customDropzoneState.showLoader = false;
                // this.isSubmitBtnDisabled = false;
                this.disableSkipValidation = true;
                // this.disableSyncBtn = false;
                this.edcsUploadToast.update('EDCS Update Success', this.fileName, 'success');
              });
            // });
        } else {
          this.fileUpdateFailed();
          this.edcsUploadToast.update('Document upload has failed', docCentral.updateFailed, 'info', { autoHide : false });

        }
      } else if (success === false && message === 'uploading') {
        this.customDropzoneState.showLoader = true;
      }
    }, (error) => {

      this.fileUpdateFailed();
      this.edcsUploadToast.update('Document upload has failed', docCentral.updateFailed, 'info', { autoHide : false });
    });
  }

  async onSubmitClicked() {
    this.loaderService.show();
    try {
        await this.accessibilityService.updateProgressScore(this.projectId, {progressScore: 80}, 'policyTesting').toPromise();
        await this.accessibilityService.updateWorkflowTimestamp(this.projectId, {step: 'policyTesting'}, 'adrTesting').toPromise();
        this.accessibilityService.enableNextSidebarItem('prepareVpat');
        this.loaderService.hide();
        this.isSubmitBtnDisabled = true;
        this.customDropzoneState.isActive = false;
      } catch (error) {
        this.loaderService.hide();
      }
  }

  ngOnInit() {
    this.originalProjectName = this.projectDetailsService.getProjectDetails.name;
    this.apiResponseReady = false;
    this.showLoader = true;
    if (this.files.length > 0) {
      this.disableUpload = false;
    }
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.projectObj = this.accessibilityService.getAccessibilityObj();
    this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(obj => {
      this.projectObj = obj[0];
      if (this.projectObj.workflowTimestamp) { 
        if (this.projectObj.workflowTimestamp.policyTesting) {
          this.testingComplete = true;
          this.performingTests = false;
          this.isSubmitBtnDisabled = true;
          this.policyTesting = this.projectObj.workflowTimestamp.policyTesting;
          if (getNestedKeyValue(this.projectObj, 'workflowTimestamp', 'prepareVpat') === undefined) {
            this.accessibilityService.enableNextSidebarItem('prepareVpat');
          }
        } else if (getNestedKeyValue(this.projectObj, 'docCentralLinks', 'policyTesting') != undefined
          && getNestedKeyValue(this.projectObj, 'workflowTimestamp', 'policyTesting') === undefined) {
            if(!this.isSkipValidationChecked) {
              this.manageSyncAdrViewAfterUpdate(this.projectObj);
              this.adrChecklistViewAfterSync(this.projectObj);
            } else { 
              this.isSubmitBtnDisabled = false;
            }
        }
      }
      const uplodedDocCentralFileInfo = getNestedKeyValue(this.projectObj, 'docCentralLinks', 'policyTesting');

      if (uplodedDocCentralFileInfo) {
        this.customDropzoneState.showUploadContainer = true;
        this.customDropzoneState.isFileUploded = true;
        this.docCentralObj = uplodedDocCentralFileInfo;
        const { nodeRef, fileName } = uplodedDocCentralFileInfo;
        this.nodeRef = nodeRef;
        this.fileName = fileName;
        if (getNestedKeyValue(this.projectObj, 'workflowTimestamp', 'policyTesting')) {
          this.customDropzoneState.isActive = false;
        }
      }
      this.apiResponseReady = true;
    });

  }

  onUploadClicked([file]) {
    this.files = file;
    this.fileName = file.name;
    this.uploadToDocCentral();
  }

  isFileSelected(event: boolean) {
    this.isSkipValidationChecked = !event;
  }

  isFileRemoved(event: boolean) {
    this.showSkipCheckbox = !event;
  }

  onChecked(event) {
    if (event.target.checked) { 
      this.isSkipValidationChecked = true;
    }
  }

  onSyncAdrChecklist(): void {
    this.disableSyncBtn = true;
    const edcsUploadToast = this.toastService.show('In-progress', 'Syncing ADR Checklist...', 'info', {autoHide: false});
    const docCentralPostBody = {
      title: 'excel',
      description: 'ADR list xls file',
      permissions: this.docCentralService.generateDocCentralPermissionArray(),
      workflow: "Accessibility",
      isAdrDataModified: true
    };
    this.projectObj = this.accessibilityService.getAccessibilityObj();
    this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(accRes => {
      [this.projectObj] = accRes;
      if(getNestedKeyValue(this.projectObj, 'docCentralLinks', 'adrListApproval') != undefined) {
        const { docCentralLinks: { adrListApproval } } = this.projectObj;
        if(adrListApproval.edcsID) docCentralPostBody['edcsID'] = adrListApproval.edcsID;
        if(adrListApproval.fileName) docCentralPostBody['fileName'] = adrListApproval.fileName;
        if(adrListApproval.nodeRef) docCentralPostBody['nodeRef'] = adrListApproval.nodeRef;
        if(adrListApproval.uploadDate) docCentralPostBody['uploadDate'] = adrListApproval.uploadDate;
        if(adrListApproval.versionRef) docCentralPostBody['versionRef'] = adrListApproval.versionRef;
        if(adrListApproval.versionRef) docCentralPostBody['_id'] = adrListApproval._id;
      }
  
      this.docCentralService.docCentralGenerateUpload(this.projectId, docCentralPostBody).subscribe(res => {
        // const { accessibilityData: policyTesting } = res;
        this.projectObj = res.accessibilityData;
        if(getNestedKeyValue(this.projectObj, 'policyTesting', 'isSyncedToAdrChecklist')) {
          this.isChecklistSynced = true;
          this.syncAdrChecklistMsg = 'ADR checklist data in sync with the latest changes.';
          this.disableSyncBtn = true;
          this.showSuccessIcon = true;
          this.isSubmitBtnDisabled = false;
          edcsUploadToast.update('Success', 'ADR Checklist is synced successfully.', 'success');
        } else {
          this.manageSyncAdrViewAfterUpdate(this.projectObj);
          this.isSubmitBtnDisabled = true;
          this.disableSyncBtn = false;
          edcsUploadToast.update('Invalid Response', 'Error while syncing the data. Please try again.', 'danger');
        }
      }, err => {
        this.manageSyncAdrViewAfterUpdate(this.projectObj);
        this.isSubmitBtnDisabled = true;
        this.disableSyncBtn = false;
        edcsUploadToast.update('Invalid Response', 'Error while syncing the data. Please try again.', 'danger');
      });
    });
  }

  private manageSyncAdrViewAfterUpdate(accData): void {
    if(!this.isSkipValidationChecked) {
      if(getNestedKeyValue(accData, 'policyTesting', 'isAdrDataModified')) {
        this.isChecklistSynced = false;
        this.syncAdrChecklistMsg = 'ADR Checklist data not in sync due to recent changes. Please click to sync the ADR Checklist.';
        this.disableSyncAdrChecklist = false;
        this.disableSyncBtn = false;
      } else  {
        this.isSubmitBtnDisabled = false;
      }
    }
  }
  private adrChecklistViewAfterSync(accData): void {
    if (getNestedKeyValue(accData, 'policyTesting', 'isSyncedToAdrChecklist')) {
      this.isChecklistSynced = true;
      this.showSuccessIcon = true;
      this.syncAdrChecklistMsg = 'ADR checklist data in sync with the latest changes.';
      this.disableSyncBtn = true;
      this.isSubmitBtnDisabled = false;
    }
  }

  ngOnDestroy() {
    // Cleaning up function
    this.removeToast();
  }

  private removeToast(): void {
    if (this.edcsUploadToast) {
      this.edcsUploadToast.hide();
    }
  }
}
