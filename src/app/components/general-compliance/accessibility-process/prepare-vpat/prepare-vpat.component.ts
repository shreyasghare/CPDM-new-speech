import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { DocCentralPostBody } from '@cpdm-model/docCentralPostBody.model';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { docCentral } from '@cpdm-shared/constants/constants';
import { Update } from '@cpdm-model/custom-toast/customToast.model';


@Component({
  selector: 'app-prepare-vpat',
  templateUrl: './prepare-vpat.component.html',
  styleUrls: ['./prepare-vpat.component.scss']
})
export class PrepareVpatComponent implements OnInit, OnDestroy {
  @Input() isPMscreen: boolean;
  files: any[] = [];
  projectId = '';
  projectObj: any;
  workspacePath: any;
  isFileUploded = false;
  uploadSuccessRes: any;
  fileName: string;
  preparingVpat = true;
  reviewComplete = false;
  uploadSuccess: boolean;
  prepareVpat: any;
  apiResponseReady: boolean;
  nodeRef: string;
  
  docCentralObj: any = {
    edcsRefLink: '',
    edcsID: '',
    fileName: ''
  };
 
  vpatDoc = '';


  componentState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };

  projectName: string;
  disableUpload = true;
  showLoader = false;

  // to disable download while untill it gets data from api
  isDownloadEnabled = true;
  isSubmitBtnDisabled = true;

  edcsUpdateToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };
  originalProjectName: string;


  constructor(private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private accessibilityService: AccessibilityProcessService,
              private docCentralService: DocCentralService,
              private projectDetailsService: ProjectsDetailService,
              private loaderService: LoaderService,
              private utilsService: UtilsService,
              private userDetailsService: UserDetailsService) { }

  async downloadFile(source: string) {
    this.projectName = this.projectDetailsService.getProjectDetails.name.replace(/\s+/g, '-');
    const productVersion = this.projectDetailsService.getProjectDetails.productVersion;
    const fileName = productVersion != '' ? `VPAT_Cisco_${this.projectName}_${productVersion}.docx` : `VPAT_Cisco_${this.projectName}.docx`;
    if (this.projectObj.docCentralLinks) {
      this.isDownloadEnabled = false;
      if (source == 'docCentral') {
        try {
          await this.docCentralService.downloadFileFromDocCentral(this.nodeRef, fileName);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await this.utilsService.downloadFileFromNode(`word/vpatDoc/${this.projectId}?path=${this.workspacePath}`, fileName);
        } catch (error) {
          console.error(error);
        }
        this.isDownloadEnabled = true;
      }
    }
  }
  async onFileSelect(files: any[]) {
    this.disableUpload = false;
    this.files = files;
  }

  uploadToDocCentral(type: string) {
      this.componentState.showLoader = true;
      const [{name}] = this.files;
      this.fileName = name;

      if (this.files && !this.docCentralObj.edcsID) {
      this.isSubmitBtnDisabled = true;
      const body: DocCentralPostBody = {
        // title:'CPDM NG',
        title: this.fileName.substr(0, this.fileName.length-5),
        description: 'VPAT document',
        permissions: this.docCentralService.generateDocCentralPermissionArray(),
        folderPath: 'accessibility/vpat',
        securityLevel: 'Cisco Public',
        status: 'Draft',
        workflow: 'Accessibility',
        projectId: this.projectId
      };
      const edcsUploadToast = this.toastService.show('EDCS Upload In Progress', this.fileName, 'info', {autoHide: false});
      this.docCentralService.docCentralUpload(this.files[0], body).subscribe(docCentralUploadRes => {
        const { nodeRef, edcsID, versionRef, _id } = docCentralUploadRes;
        this.nodeRef = nodeRef;
        let edcsBody = null;
        if (type === 'word') {
          edcsBody = {
            prepareVpat: {
              word: {
                edcsID,
                versionRef,
                nodeRef,
                fileName: this.fileName,
                uploadDate: new Date().toString(),
                _id
                }
            }
          };

          this.docCentralObj = edcsBody.prepareVpat.word;
          this.componentState.showLoader = false;
        }
        if (edcsID !== undefined && edcsID !== ''
        && nodeRef !== undefined && nodeRef !== ''
        && versionRef !== undefined && versionRef !== '') {
          this.uploadSuccess = true;

          const logginUserObj = { userObj: this.userDetailsService.currentUserValue };

          const headers = {
            adrProcess: 'adrVPAT',
            user: logginUserObj
          };
          const edcsUpdateBody = {
            prepareVpat: {
              word: {
                _id
                }
            }
          };
          this.docCentralService.patchEdcsObj(this.projectId, edcsUpdateBody).subscribe(res => {
              this.isSubmitBtnDisabled = false;

              this.componentState.showUploadSuccess = true;
              this.componentState.showUploadContainer = true;
              this.componentState.isFileUploded = true;

              this.showLoader = false;
              edcsUploadToast.update('EDCS Upload Success', this.fileName, 'success');
          });
        } else {
          this.isSubmitBtnDisabled = true;
          this.componentState.showLoader = false;
          edcsUploadToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
        }
      }, err => {
      console.error(err);
      this.isSubmitBtnDisabled = true;
      this.componentState.showLoader = false;
      edcsUploadToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
      });
    } else {
      this.onUpdateFileToDocCentral(type);
    }
  }

  onUpdateFileToDocCentral(type: string): void {
    this.isFileUploded = true;
    this.isSubmitBtnDisabled = true;
    this.removeToast();
    this.edcsUpdateToast = this.toastService.show('EDCS Update In Progress', this.fileName, 'info', {autoHide: false});
    const { edcsID, _id } = this.docCentralObj;
    const updateToDocCentralBody = {
      title: this.fileName.substr(0, this.fileName.length-5),
      edcsID,
      status: 'Draft',
      _id,
      projectName: this.originalProjectName,
      workflow: 'Accessibility'
    };
    this.docCentralService.updateFileToDocCentral(this.files[0], updateToDocCentralBody, this.projectId).subscribe(docCentralUploadRes => {
      this.isFileUploded = false;
      this.uploadSuccess = true;

      this.componentState.showLoader = false;
      // this.docCentralService.patchEdcsObj(this.projectId, edcsBody).subscribe((res) => {
      this.isSubmitBtnDisabled = false;

      this.componentState.isFileUploded = true;
      this.componentState.showUploadSuccess = true;

      this.edcsUpdateToast.update('EDCS Update Success', this.fileName, 'success');
      this.getUpdatedAccessibilityObj();
        // });
    }, err => {
      console.error(err);
      this.isSubmitBtnDisabled = false;
      // this.componentState.isFileUploded = true;
      this.componentState.showLoader = false;
      this.edcsUpdateToast.update('Document upload has failed', docCentral.updateFailed, 'info', { autoHide : false });
    }
    );
  }

  ngOnInit() {
    this.originalProjectName = this.projectDetailsService.getProjectDetails.name;
    this.showLoader = true;
    this.apiResponseReady = false;
    if (this.files.length > 0) {
      this.disableUpload = false;
    }
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.getUpdatedAccessibilityObj();
  }

  getUpdatedAccessibilityObj() {
    this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(obj => {
      this.projectObj = obj[0];
      if (getNestedKeyValue(this.projectObj, 'docCentralLinks', 'policyTesting')) {
        this.workspacePath = this.projectObj.docCentralLinks.policyTesting.nodeRef;
      }

      const docCentralUplodedWord = getNestedKeyValue(this.projectObj, 'docCentralLinks', 'prepareVpat', 'word');
      if (docCentralUplodedWord) {
          this.isSubmitBtnDisabled = false;
          this.componentState.isFileUploded = true;
          this.componentState.showUploadContainer = true;
          if (getNestedKeyValue(this.projectObj, 'workflowTimestamp', 'prepareVpat')) {
          this.preparingVpat = false;
          this.reviewComplete = true;
          this.componentState.isActive = false;
          }
          this.docCentralObj = this.projectObj.docCentralLinks.prepareVpat.word;
          this.nodeRef = this.projectObj.docCentralLinks.prepareVpat.word.nodeRef;
          this.fileName = this.projectObj.docCentralLinks.prepareVpat.word.fileName;
        } else {
          this.isSubmitBtnDisabled = true;
          this.componentState = {
            showLoader: false,
            showUploadSuccess: false,
            showUploadContainer: false,
            isFileUploded: false,
            isActive: true
          };
        }

      if (this.projectObj.workflowTimestamp) {
          if (this.projectObj.workflowTimestamp.prepareVpat) {
            this.isSubmitBtnDisabled = true;
            this.prepareVpat = this.projectObj.workflowTimestamp.prepareVpat;
            if (!this.isPMscreen || getNestedKeyValue(this.projectObj, 'workflowTimestamp', 'releaseVpat')) {
            this.accessibilityService.enableNextSidebarItem('releaseVpat');
            }
          }
        }
      this.apiResponseReady = true;
    });
  }


  onUploadClicked(type: string, event: any) {
    this.files = event;
    this.uploadToDocCentral(type);
  }

  async onSubmitClicked() {
    this.loaderService.show();
    try {
      await this.accessibilityService.updateProgressScore(this.projectId, {progressScore: 90}, 'prepareVpat').toPromise();
      await this.accessibilityService.updateWorkflowTimestamp(this.projectId, {step: 'prepareVpat'}, 'adrVPAT').toPromise();
      this.accessibilityService.enableNextSidebarItem('releaseVpat');
      this.isSubmitBtnDisabled = true;
      this.componentState.isActive = false;
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
    }
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
}
