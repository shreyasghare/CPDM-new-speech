import { Component, OnDestroy, OnInit } from '@angular/core';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { IresForInfoIconModel } from '@cpdm-model/iResForInfoIcon.model';
import { DeviceInfo } from 'ngx-device-detector';//DE3162
import { DocCentral } from '@cpdm-model/DocCentral';
import { SubmitConfirmationComponent } from '../shared/submit-confirmation/submit-confirmation.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { RevenueRecognitionModel } from '@cpdm-model/general-compliances/revenue-recognition/revenueRecognition.model';
import { docCentral } from '@cpdm-shared/constants/constants';
import { Update } from '@cpdm-model/custom-toast/customToast.model';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';


@Component({
  selector: 'complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class CompleteComponent implements OnInit, OnDestroy {
  projectName: any;
  constructor(private revRecService: RevenueRecognitionService,
              private dataService: ProjectsDataService,
              private activatedRoute: ActivatedRoute,
              private docCentralService: DocCentralService,
              public dialog: MatDialog,
              private toastService: ToastService,
              private userDetailsService: UserDetailsService,
              private projectDetailsService: ProjectsDetailService) { }
  role = Role;
  isPMscreen = true;
  isBUscreen = false;
  isRRscreen = false;
  tempDataForInfoHelper: { name: string };
  completeState: string;
  hideme = [];
  apiResponseReady: boolean;
  docCentralLinks = [];
  resForInfoIcon: IresForInfoIconModel[];
  revRecId: string;
  updatedRevRecObj: RevenueRecognitionModel;
  device: DeviceInfo;
  isMacOs: boolean;
  reinitiateObj: { isReinitiate: boolean, confirmationText: string } = {
    isReinitiate: true,
    confirmationText: 'Are you sure you want to edit the worksheet and re-initiate process? This will trigger a notification to everyone associated to this project\'s policy.'
  };
  docCentralObj: DocCentral = {
    edcsID: '',
    versionRef: '',
    nodeRef: '',
    fileName: '',
    uploadDate: '',
    _id: ''
  };
  completeConfirmation: { 'revRecId': string } = {
    revRecId: ''
  };
  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };
  isUploadBtnDisabled = false;

  edcsUpdateToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };


  getDocCentralObj() {
    this.docCentralLinks = [];
    this.revRecService.getRevRecObj(this.revRecId).subscribe(revRecObj => {
      this.apiResponseReady = true;
      this.updatedRevRecObj = revRecObj;
    
      // this.completeState = revRecObj.workflowTimestamp && revRecObj.workflowTimestamp.complete ? 'completed' : 'inprocess';
    
      this.completeState = getNestedKeyValue(revRecObj, 'rclPidSubmit', 'status') === 'completed' ? 'completed' : 'inprocess';
      let docCentralObjToShow = null;
      let isFmvObjAvailable = false;
      if (revRecObj.docCentralLinks) {
        for (const value in revRecObj.docCentralLinks) {
          for (const subValue in revRecObj.docCentralLinks[value]) {

            if (subValue === 'fmv'
              && revRecObj.docCentralLinks[value][subValue].length > 0) {
              isFmvObjAvailable = true;
              revRecObj.docCentralLinks[value][subValue].forEach(fmvObj => {
                fmvObj.type = 'fmv';
                this.docCentralLinks.push(fmvObj);
              });
              docCentralObjToShow = revRecObj.docCentralLinks[value][subValue][revRecObj.docCentralLinks[value][subValue].length - 1];
              //  this.customDropzoneState.showUploadContainer = true;
              //  this.customDropzoneState.isFileUploded = true;
            } else {
              if (subValue !== 'fmv') {
                revRecObj.docCentralLinks[value][subValue].type = 'rclPidSubmit';
                this.docCentralLinks.push(revRecObj.docCentralLinks[value][subValue]);
              }
            }
          }
        }
        if (isFmvObjAvailable) {
          this.docCentralObj = docCentralObjToShow;
          this.customDropzoneState.showUploadContainer = true;
          this.customDropzoneState.isFileUploded = true;
        }
      }
    }, err => {
      console.error(err);
      this.apiResponseReady = false;
    });
  }

  ngOnInit() {
    this.projectName = this.dataService.getProjectDetails.name;
    this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });
    this.apiResponseReady = false;
    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.device = this.userDetailsService.getUserDeviceInfo();
    this.isMacOs = this.device.os.toLocaleLowerCase() === 'mac';//DE3162
    this.getDocCentralObj();
  }

  async onDownload(nodeRef, fileName) {
    if (nodeRef != null) {
      try {
        await this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
      } catch (error) {
        console.error(error);
      }
    }

  }
  onUploadClicked(event: any) {
    // let fileName = `${event[0].name}`;
    this.isUploadBtnDisabled = true;
    const fileName = event.files ? event.files[0].name : `${event[0].name}`;
    const docCentralObj = event.files ? event.files[0] : event[0];
    const uploadToast = this.toastService.show(`EDCS Upload In Progress`, fileName, 'info', { autoHide: false });
    this.customDropzoneState.showLoader = true;
    this.customDropzoneState.isFileUploded = true;

    const projId = this.projectDetailsService.getProjectDetails._id;
    let body;
    // if (this.docCentralObj.nodeRef == null || this.docCentralObj.nodeRef == "") {
    body = {
      title: fileName,
      description: 'FMV document for Revenue Recognition Complete stage',
      folderPath: 'revenueRecognition/root',
      workflow: 'Revenue Recognition',
      projectId: projId
    };
    // } else {
    // body = this.docCentralObj.edcsID;
    // }

    // this.docCentralService.docCentralUpload(event[0], body).subscribe(docCentralUploadRes => {
    this.docCentralService.docCentralUpload(docCentralObj, body,  this.revRecId).subscribe(docCentralUploadRes => {
      const { edcsID, versionRef, nodeRef, _id } = docCentralUploadRes;
      if (edcsID) {
        const uploadDate = new Date().toString();
        const edcsBody: DocCentral =
        {
          edcsID, versionRef, nodeRef,
          fileName, uploadDate, _id
        };
        this.revRecService.patchFmvObj(this.revRecId, { fmv: docCentralUploadRes._id }).subscribe(edcsUpdateRes => {
          uploadToast.update('EDCS Upload Success', fileName, 'success');
          edcsBody.type = 'fmv';
          this.docCentralLinks.push(edcsBody);
          this.customDropzoneState.isFileUploded = true;
          this.customDropzoneState.showLoader = false;
          // this.finishStatus = edcsUpdateRes.docCentralLinks
          //   && edcsUpdateRes.docCentralLinks.complete
          //   && edcsUpdateRes.docCentralLinks.complete.fmv ? true : false;
          this.isUploadBtnDisabled = false;

        }, err => {
          this.customDropzoneState.showLoader = false;
          this.isUploadBtnDisabled = false;
        });
        this.docCentralObj = edcsBody;
      } else {
        uploadToast.update('Upload failed', 'Please try again after 5 minutes.', 'danger');
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showLoader = false;
        this.isUploadBtnDisabled = false;
      }
    }, err => {
      uploadToast.update('Upload failed', 'Please try again after 5 minutes.', 'danger');
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showLoader = false;
      this.isUploadBtnDisabled = false;
    });
  }

  onUpdateClicked(event: any, document, index) {
    // let fileName = `${event[0].name}`;
    this.hideme[index] = !this.hideme[index];
    const fileName = event.files ? event.files[0].name : `${event[0].name}`;
    const docCentralObj = event.files ? event.files[0] : event[0];
    this.removeToast();
    this.edcsUpdateToast = this.toastService.show(`EDCS Update In Progress`, fileName, 'info', { autoHide: false });

    let body;
    // if (this.docCentralObj.nodeRef == null || this.docCentralObj.nodeRef == "") {
    body = {
      title: fileName,
      description: ' FMV document for Revenue Recognition Complete stage',
      folderPath: 'revenueRecognition',
    };
    // } else {
    //   body = this.docCentralObj.edcsID;
    // }
    this.docCentralObj = document;

    const updateToDocCentralBody = {
      title: fileName,
      edcsID: this.docCentralObj.edcsID,
      _id: this.docCentralObj._id,
      workflow: 'Revenue Recognition',
      projectName: this.projectName
    };
    this.docCentralService.updateFileToDocCentral(docCentralObj, updateToDocCentralBody, this.revRecId).subscribe(docCentralUploadRes => {
      // this.docCentralService.docCentralUpload(docCentralObj, body).subscribe(docCentralUploadRes => {
      // if (docCentralUploadRes.edcsID) {
      const edcsBody = {
        edcsID: document.edcsID,
        versionRef: document.versionRef,
        nodeRef: document.nodeRef,
        fileName,
        uploadDate: new Date().toString()
      };

      // this.revRecService.patchFmvDocUodateObj(this.revRecId, document.edcsID, edcsBody).subscribe(edcsUpdateRes => {
      this.edcsUpdateToast.update('EDCS Update Success', fileName, 'success');
      this.docCentralLinks[index] = edcsBody;
      this.docCentralLinks[index].type = 'fmv';

      // }, err => {
      //   edcsUpdateToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
      // });
      // } else {
      // this.toastService.showAndUpadteToast('Upload failed', fileName, 'danger');
      // }
      this.hideme[index] = !this.hideme[index];
    }, err => {
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showLoader = false;
      this.hideme[index] = !this.hideme[index];
      this.edcsUpdateToast.update('Document upload has failed',
        docCentral.updateFailed,
        'info', { autoHide: false });
    });
  }

  // markStatusComplete() {
  //   const dialogRef = this.dialog.open(CompleteConformationComponent, { data: this.completeConfirmation, width: '35vw', height: 'auto' });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === 'finished') {
  //       this.revRecService.patchStatusObj(this.revRecId, 'submit',
  //         { status: 'completed' }).subscribe(data => {

  //           // this.completeState = "completed";
  //           this.completeState = data.submit && data.submit.status
  //             && data.submit.status === 'completed' ? 'completed' : 'inprocess';
  //           this.revRecService.enableNextSidebarItem('complete');
  //         });
  //     }
  //   });
  // }

  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() === iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      return desc;
    }
  }

  OnReinitiateProcess(): void {
    const confirmationText = 'Are you sure';
    const dialogRef = this.dialog.open(SubmitConfirmationComponent,
      {
        data: { reinitiateObj: this.reinitiateObj, revRecObj: this.updatedRevRecObj },
        width: '35vw', height: 'auto'
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'uploadSuccess') {
        // this.isSubmitted = true;
        // // this.isSubmitMainScreen = false;
        // this.showSpinner = false;
        // this.isSubmitBtnEnabled = true;
      }
      // else
      // this.isSubmitBtnEnabled = true;
    });
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
