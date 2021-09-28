import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Role } from '@cpdm-model/role';
import { AssessmentQuestionnairePopupComponent } from './assessment-questionnaire-popup/assessment-questionnaire-popup.component';
import { SubmitConfirmationComponent } from '../shared/submit-confirmation/submit-confirmation.component';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

/**
 * Services
 */
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { RevenueRecognitionModel } from '@cpdm-model/general-compliances/revenue-recognition/revenueRecognition.model';
import { docCentral } from '@cpdm-shared/constants/constants';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Update } from '@cpdm-model/custom-toast/customToast.model';

@Component({
  selector: 'rcl-pid-submit',
  templateUrl: './rcl-pid-submit.component.html',
  styleUrls: ['./rcl-pid-submit.component.scss']
})
export class RclPidSubmitComponent implements OnInit, OnDestroy {
  edcsUpdateToast: { guid: string; ToastServiceRef: ToastService; update: Update; hide: () => void; };
  revRecUpdateListenerSubscription: Subscription;

  constructor(public dialog: MatDialog,
              private revRecService: RevenueRecognitionService,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private projectDetailsService: ProjectsDetailService,
              public cuiModalService: CuiModalService,
              private docCentralService: DocCentralService,
              private loaderService: LoaderService,
              private dataService: ProjectsDataService,
              private userService: UserDetailsService
    ) { }
 get getRclWQuestionsStatus() {
   if (this.rclQuestionnaireObject.isAllQestionsAnswered) {
    return `All ${this.updatedRevRecObj.rclAssessmentQuestionnaire.answeredQuestionsCount} questions are answered`;
   } else {
      if (this.updatedRevRecObj.rclAssessmentQuestionnaire.remaningQuestionsCount <= 1) {
        return `${this.updatedRevRecObj.rclAssessmentQuestionnaire.remaningQuestionsCount} question is remaining to be answered`;
      } else {
        return `${this.updatedRevRecObj.rclAssessmentQuestionnaire.remaningQuestionsCount} questions are remaining to be answered`;
      }
    }
  }

  get rclQuestionnaireBtnName(): string {
    if (this.updatedRevRecObj.rclAssessmentQuestionnaire) {
      const isStatusDefined = 'status' in this.updatedRevRecObj.rclAssessmentQuestionnaire;
      const isSubmitStatus = this.updatedRevRecObj.rclPidSubmit !== undefined;

      if (this.updatedRevRecObj.rclAssessmentQuestionnaire.status === 'submitted' && isSubmitStatus && this.updatedRevRecObj.rclPidSubmit.status != 'reinitiated') {
        return 'View';
      } else if (isStatusDefined && this.updatedRevRecObj.rclAssessmentQuestionnaire.status === 'submitted') {
        return 'View / Edit';
      } else if ((isStatusDefined && this.updatedRevRecObj.rclAssessmentQuestionnaire.status === 'saved') || (isSubmitStatus && this.updatedRevRecObj.rclPidSubmit.status === 'reinitiated')) {
        return 'View / Edit';
      }
    }
    return 'Begin';
  }
  projectName: string = null;
  projectNameForFile: string;
  revRecId: string;
  reinitiateBtn = 'Re-initiate';

  size = 'normal';
  sizeItems: any[] = [
    { name: 'normal', value: 'normal' },
    { name: 'large', value: 'large' },
    { name: 'full', value: 'full' },
    { name: 'fluid', value: 'fluid' },
  ];
  updatedRevRecObj: RevenueRecognitionModel;
  fileName: string;
  //US10811 - Changes to handle doc central failures during updates. Below object is alligned with docCentralUpload collection.
  //TODO lets make one interface which can be used across all the uploads
  docCentralObj: { 'edcsID': any; 'versionRef': any; 'nodeRef': any; 'fileName': string; 'uploadDate': string; '_id': string; } = {
    _id: '',
    edcsID: '',
    versionRef: '',
    nodeRef: '',
    fileName: '',
    uploadDate: ''
  };
  reinitiateObj: { isReinitiate: boolean, revRecObj: any, confirmationText: string } = {
    isReinitiate: true,
    revRecObj: {},
    confirmationText: 'Are you sure you want to edit the worksheet and re-initiate process? This will trigger a notification to everyone associated to this project\'s policy.'
  };
  sumbitConfirmation = {};

  isSubmitBtnEnabled = false;
  isSubmitted = false;
  showSpinner: boolean;
  // disableDropzone: any = false;
  role = Role;

  rclQuestionnaireObject = {
    remaningQuestionsCount: null,
    answeredQuestionsCount: null,
    isAllQestionsAnswered: false,
    status: 'notStarted',
  };

  buControllers: any[] = [];
  businessUnitList: any[] = [];

  selectedBuController: string;
  selectedBU: string;
  savedBuControllers: any;
  enableBUDropdown: boolean;
  toolTipSubscription: Subscription;
  resForInfoIcon: any;
  errorOccurred: boolean;
  searchMember: FormControl = new FormControl();
  users = [];
  inputValue: string;
  members = [] as any;
  showLoader: boolean;
  getErrorMessage: string;
  projectId: string;

  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };

  formEditableState:boolean;
  skipPIdListSubscription: Subscription;

  ngOnInit() {
    this.showSpinner = true;
    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.projectName = this.projectDetailsService.getProjectDetails.name;
    this.projectNameForFile = this.projectName.replace(/[\s+,\/]/g, '-');
    this.projectId = this.projectDetailsService.getProjectDetails._id;

    this.revRecId = this.activatedRoute.snapshot.params.id;
    this.revRecService.setComplianceRefID(this.revRecId);
    this.toolTipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });

    this.getRclObj();
    this.setBuControllerDropDownItems();
    this.revRecUpdateListenerSubscription = this.revRecService.getRevRecUpdateListener().subscribe(() => {
      this.getRclObj();
    })

    this.searchMember.valueChanges.subscribe(
      async term => {
        this.users = [];
        this.errorOccurred = false;
        if ( term && (typeof term === 'string') && (term.trim()).length >= 3) {
          (await this.userService.searchUser(term)).subscribe(
          data => {
            this.users = (data && data.length > 0) ? data : [{name: 'No Record(s) Found', cecId: null, email: null}];
          },
          err => {
            this.users = [{
              name: this.searchMember.value,
              cecId: null,
              email: null,
              errorStatus: err
            }] ;
          });
        }
    });
  }

  private setBuControllerDropDownItems() {
    this.revRecService.getAllBuControllers().subscribe(buControllersRes => {
      if (buControllersRes.success) {
        this.buControllers = buControllersRes.data;
        this.savedBuControllers = buControllersRes.data;
        this.buControllers = this.buControllers.filter(singleBuController => {
          if (
            singleBuController.isAlternateProxy === false
            ) { return true; } else { return false; }
        }).map(item => {
          const container: any = {};
          container.value = item._id;
          container.name = item.bussinessEntity ? `${item.bussinessEntity} - ${item.name} ` : item.name;
          return container;
        });
        this.buControllers.sort((a, b) => (a.name > b.name) ? 1 : -1);
      }
    });
  }

  onSelection() {
    this.loaderService.show();
    let selectedBuController = null;
    let condition = null;
    if (this.selectedBuController != null && this.selectedBuController != 'No Selection') {
      selectedBuController = this.savedBuControllers.filter(value => {
        return this.selectedBuController === value._id;
      });

      condition = 'add';
      const { _id, name, userId, bussinessEntity } = selectedBuController[0];

      this.revRecService.setBuController(this.revRecId, 'add', _id, name, userId, bussinessEntity).subscribe(res => {
        if (bussinessEntity !== undefined && bussinessEntity !== 'No Selection') { this.enableBUDropdown = true; }
        this.loaderService.hide();
        this.getRclObj();
      });

      // Setting business units
      this.setBusinessUnitDropDownItems(userId, bussinessEntity);
    } else {
      condition = 'remove';
      this.isSubmitBtnEnabled = false;
      this.enableBUDropdown = false;
      this.selectedBU = '';
      this.revRecService.setBuController(this.revRecId, 'remove', '').subscribe(res => {
        this.loaderService.hide();
      });
    }
  }

  /**
  * Saving business unit on change of its dropdown. 
  */
  onSelectionBusinessUnit() {
    this.loaderService.show();
    const selectedBuController = this.savedBuControllers.filter(value => {
      return this.selectedBuController === value._id;
    });
    const { _id, name, userId, bussinessEntity } = selectedBuController[0];
    if (this.selectedBU !== undefined) {
      this.revRecService.setBuController(this.revRecId, 'addBusinessUnit', _id, name, userId, 
      bussinessEntity, this.selectedBU).subscribe(res => {
        this.loaderService.hide();
      });
    }
  }
  /**
  * Setting business units based on BU controller.
  */
  async setBusinessUnitDropDownItems(userId: string, bussinessEntity: string) {
    this.businessUnitList = [];
    this.revRecService.getBusinessUnitsForBUController(userId, bussinessEntity).subscribe(businessUnitsRes => {
      if (businessUnitsRes.success && businessUnitsRes.data.length > 0 && businessUnitsRes.data[0].businessUnit) {
        businessUnitsRes.data[0].businessUnit.forEach((oneBU) => {
          const buPair: any = {};
          buPair.name = oneBU;
          this.businessUnitList.push(buPair);
        });
      }
    });
  }
  /**
   * Setting alternate proxy
   */
  setAlternateProxy(alternateProxy: { cecId: string, name: string, fullName: string }) {
    this.members = [];
    this.members.push(alternateProxy);
    if (alternateProxy.name.split(' ')[1]) {
      this.members[0].name = `${alternateProxy.name.split(' ')[0]} ${alternateProxy.name.split(' ')[1].split('')[0]}`;
    } else {
      this.members[0].name = `${alternateProxy.name.split(' ')[0]}`;
    }
  }

  private getRclObj() {
    this.revRecService.getRevRecObj(this.revRecId).subscribe(async revRecObj => {
      this.updatedRevRecObj = revRecObj;
      this.showSpinner = false;
      this.rclQuestionnaireLogic(revRecObj);
      
      this.updatedRevRecObj.skipPidListUpload.flag=revRecObj.skipPidListUpload? revRecObj.skipPidListUpload.flag : false;
      this.updatedRevRecObj.skipPidListUpload.comments=revRecObj.skipPidListUpload? revRecObj.skipPidListUpload.comments : null;

      
      if ('buController' in this.updatedRevRecObj) {
        this.selectedBuController = this.updatedRevRecObj.buController._id;
        this.enableBUDropdown = true;
      }
      if ('buController' in this.updatedRevRecObj) {
        await this.setBusinessUnitDropDownItems(this.updatedRevRecObj.buController.cecId,
          this.updatedRevRecObj.buController.bussinessEntity);
        if (this.updatedRevRecObj.buController.businessUnit) {
          this.selectedBU = this.updatedRevRecObj.buController.businessUnit;
        }
      }
      // Alternate proxy
      if (this.updatedRevRecObj.alternateProxy) {
        const alternateProxy = {
          cecId: this.updatedRevRecObj.alternateProxy.cecId,
          name: this.updatedRevRecObj.alternateProxy.name,
          fullName: this.updatedRevRecObj.alternateProxy.name
        };
        this.setAlternateProxy(alternateProxy);
      }
      if (revRecObj.docCentralLinks) {
        if (revRecObj.docCentralLinks.rclPidSubmit && revRecObj.docCentralLinks.rclPidSubmit.rclAssessmentQuestionnaire) {
          this.reinitiateBtn = 'Submit';
        }

        if (revRecObj.docCentralLinks.rclPidSubmit && revRecObj.docCentralLinks.rclPidSubmit.scopingChecklist) {
          // this.isSubmitMainScreen = true;
          this.reinitiateBtn = 'Submit';
          this.showSpinner = false;
          this.customDropzoneState.isFileUploded = true;
          this.customDropzoneState.showUploadContainer = true;
          this.docCentralObj = revRecObj.docCentralLinks.rclPidSubmit.scopingChecklist;
          this.customDropzoneState.isActive = this.updatedRevRecObj.rclPidSubmit
            && this.updatedRevRecObj.rclPidSubmit.status !== 'reinitiated' ? false : true;
        }

        this.formEditableState=this.rclQuestionnaireBtnName=='View'? false: true;

        if (((revRecObj.docCentralLinks.rclPidSubmit && revRecObj.docCentralLinks.rclPidSubmit.scopingChecklist && !revRecObj.skipPidListUpload.flag)
              || (revRecObj.skipPidListUpload.flag && revRecObj.skipPidListUpload.comments))
            && revRecObj.docCentralLinks.rclPidSubmit && revRecObj.docCentralLinks.rclPidSubmit.assessmentChecklist) {
          if (revRecObj.rclAssessmentQuestionnaire.status === 'submitted') {
            if (this.updatedRevRecObj.rclPidSubmit && this.updatedRevRecObj.rclPidSubmit.status &&
              this.updatedRevRecObj.buController) {
              this.isSubmitted = true;
              this.isSubmitBtnEnabled = true;
              this.reinitiateBtn = 'Update RCL / PID list';
              if (this.updatedRevRecObj.rclPidSubmit.status === 'reinitiated') {
                this.reinitiateBtn = 'Resubmit';
              }
            }
            return;
          }
          if (revRecObj.rclAssessmentQuestionnaire.status === 'saved') {
            this.isSubmitBtnEnabled = false;
          }
        }
        if (revRecObj.rclAssessmentQuestionnaire.status === 'saved') {
          this.isSubmitBtnEnabled = false;
        }
        if (((this.updatedRevRecObj.docCentralLinks.rclPidSubmit &&
            this.updatedRevRecObj.docCentralLinks.rclPidSubmit.scopingChecklist &&
            !revRecObj.skipPidListUpload.flag)
              || (revRecObj.skipPidListUpload.flag && revRecObj.skipPidListUpload.comments)) &&
          this.updatedRevRecObj.rclAssessmentQuestionnaire.status &&
          this.updatedRevRecObj.rclAssessmentQuestionnaire.status === 'submitted' &&
          this.updatedRevRecObj.buController && !this.updatedRevRecObj.rclPidSubmit) {
          this.isSubmitBtnEnabled = true;
          this.reinitiateBtn = 'Submit';
        } else if(getNestedKeyValue(this.updatedRevRecObj, "rclPidSubmit", "status") === "submitted") {
          this.isSubmitBtnEnabled = false;
          this.reinitiateBtn = 'Resubmit';
        } else {
          this.reinitiateBtn = 'Submit';
        }

        // else{
        //   if(this.updatedRevRecObj.buController){
        //     this.isSubmitBtnEnabled =  true;
        //   }else{
        //     this.isSubmitBtnEnabled =  false;
        //   }
        //   this.reinitiateBtn = "Submit";
        //   this.isSubmitted = false;
        // }

      } else {
        this.reinitiateBtn = 'Submit';
      }
    });
    // this.isSubmitBtnEnabled =  true;
  }

  rclQuestionnaireLogic(revRecObj: any) {
    if ('status' in revRecObj.rclAssessmentQuestionnaire) {
      this.rclQuestionnaireObject.status = revRecObj.rclAssessmentQuestionnaire.status;
      this.rclQuestionnaireObject.answeredQuestionsCount = revRecObj.rclAssessmentQuestionnaire.answeredQuestionsCount;
      this.rclQuestionnaireObject.remaningQuestionsCount = revRecObj.rclAssessmentQuestionnaire.remaningQuestionsCount;
      this.rclQuestionnaireObject.isAllQestionsAnswered = this.rclQuestionnaireObject.answeredQuestionsCount > 0 && this.rclQuestionnaireObject.remaningQuestionsCount === 0;
    } else {
      this.rclQuestionnaireObject = {
        remaningQuestionsCount: null,
        answeredQuestionsCount: null,
        isAllQestionsAnswered: false,
        status: 'notStarted',
      }
    }
  }

  onBegin(btnName: string): void {
    let isReadonlyFlag = false;
    if (btnName === 'View') {
      isReadonlyFlag = true;
    }
    this.openQuestionnaireDailog(isReadonlyFlag);
  }


  openQuestionnaireDailog(isReadonlyFlag: boolean): void {
    const dialogRef = this.dialog.open(AssessmentQuestionnairePopupComponent
      , {
        data: { revRecData: this.updatedRevRecObj, isReadonly: isReadonlyFlag }
        , panelClass: 'full-width-dialog', disableClose: true
      });
    dialogRef.afterClosed().subscribe(() => {
      this.getRclObj();
    });
  }

  onSubmitBtn(btnValue): void {
    if (this.isSubmitBtnEnabled && (btnValue === 'Resubmit' || btnValue === 'Submit')) {
      if (this.selectedBU === undefined) {
        const selectedBuController = this.savedBuControllers.filter(value => {
          return this.selectedBuController === value._id;
        });
        const { _id, name, userId, bussinessEntity } = selectedBuController[0];
        this.revRecService.setBuController(this.revRecId, 'add', _id, name, userId, bussinessEntity, 'No Selection').subscribe(res => {
 
        });
      }
      this.openConfirmDialog();
    } else {
      const dialogRef = this.dialog.open(SubmitConfirmationComponent, {
        data:
          { reinitiateObj: this.reinitiateObj, revRecObj: this.updatedRevRecObj }, width: '35vw', height: 'auto'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'reinitiated') {
          this.showSpinner = false;
          this.getRclObj();
        }
      });
    }
  }


  openConfirmDialog(): void {
    const dialogRef = this.dialog.open(SubmitConfirmationComponent, {
      data:
        { revRecObj: this.updatedRevRecObj, projectId: this.projectId }, width: '35vw', height: 'auto', disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'uploadSuccess') {
        this.showSpinner = false;
        // this.isSubmitted = true;
        // this.isSubmitMainScreen = false;
        // this.isSubmitBtnEnabled = true;
        this.getRclObj();
      }
      else{ this.getRclObj(); }
  // else
      // this.isSubmitBtnEnabled = true;
    });
  }

  onUploadClicked(event: any) {
    if (this.docCentralObj.nodeRef == null || this.docCentralObj.nodeRef == '') {
      const edcsUploadToast = this.toastService.show(`EDCS Upload In Progress`, event[0].name
        , 'info', { autoHide: false });
      this.fileName = `${event[0].name}`;
      this.customDropzoneState.showLoader = true;
      this.customDropzoneState.isFileUploded = true;

      const body = {
        title: this.fileName,
        description: 'Revenue Recognition Submit',
        folderPath: 'revenueRecognition/root',
        workflow: 'Revenue Recognition',
        projectId: this.projectId
      };

      this.docCentralService.docCentralUpload(event[0], body).subscribe(docCentralUploadRes => {
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showUploadSuccess = true;
        this.customDropzoneState.showLoader = false;
        const edcsBody = {
          edcsID: docCentralUploadRes.edcsID,
          versionRef: docCentralUploadRes.versionRef,
          nodeRef: docCentralUploadRes.nodeRef,
          fileName: this.fileName,
          uploadDate: new Date().toString(),
          _id: docCentralUploadRes._id
        };

        const edcsPatchBody = {
          rclPidSubmit: { scopingChecklist: edcsBody._id } //US10811 - Changes to save doc central reference id in resepctive collections
        };
        // this.revRecService.getScopingChecklist().subscribe(res=>{
        //   this.toastService.showAndUpadteToast('Download Success', `Scoping_Checklist.xlsx`, 'success');
        //   saveAs(res, `Scoping_Checklist`);


        this.revRecService.patchEdcsObj(this.revRecId, edcsPatchBody).subscribe(edcsUpdateRes => {
          edcsUploadToast.update('EDCS Upload Success', event[0].name, 'success');
          // this.revRecService.enableSubmitBtn(true);
          // if(edcsUpdateRes.docCentralLinks.submit && edcsUpdateRes.docCentralLinks.submit.scopingChecklist){
          //     if(edcsUpdateRes.rclAssessmentQuestionnaire.status === 'submitted'){
          //       this.isSubmitBtnEnabled =  true;
          //     }

          // }
          this.getRclObj();
        }, err => {
          console.error(err);
        });

        this.docCentralObj = edcsBody;
      }, err => {
        this.customDropzoneState.showLoader = false;
        this.customDropzoneState.isFileUploded = false;
        //Fix for DE3270
        edcsUploadToast.update('EDCS Upload Failed', err.error != undefined? err.error.error: "Please try again after 5 minutes.", 'danger');
      });
    } else {
      this.onUpdateFileToDocCentral(event);
    }

  }

  onUpdateFileToDocCentral(event: any): void {
    this.removeToast();
    this.edcsUpdateToast = this.toastService.show(`EDCS Update In Progress`, event[0].name, 'info', { autoHide: false });
    this.customDropzoneState.showLoader = true;
    this.customDropzoneState.isFileUploded = true;

    const updateToDocCentralBody = {
      title: event[0].name,
      edcsID: this.docCentralObj.edcsID,
      _id: this.docCentralObj._id,
      projectName: this.projectName,
      workflow: 'Revenue Recognition'
    };

    this.docCentralService.updateFileToDocCentral(event[0], updateToDocCentralBody, this.revRecId).subscribe(docCentralUploadRes => {
      this.revRecService.getRevRecObj(this.revRecId).subscribe(revRecObj => {
        if(getNestedKeyValue(revRecObj, 'rclPidSubmit', 'status') == 'reinitiated') {
          const res = this.revRecService.patchStatusObj(this.revRecId, 'emailStatus', { pidReuploaded: 'postReinitiate'}).toPromise();
        }
        this.customDropzoneState.isFileUploded = true;
        this.customDropzoneState.showUploadSuccess = true;
        this.customDropzoneState.showLoader = false;
        this.docCentralObj.fileName = event[0].name; // US10811 - Changes added now. not sure why this was missed before
        this.edcsUpdateToast.update('Upload Success', event[0].name, 'success');
      });
    }, err => {
      this.customDropzoneState.isFileUploded = true;
      this.customDropzoneState.showLoader = false;
      // US10811 - Changes to save doc central reference id in resepctive collections
      this.edcsUpdateToast.update('Document upload has failed',
        docCentral.updateFailed,
        'info', { autoHide: false });
      console.error(err);
    }
    );
  }

  // Downloading from Doc Central
  async onDownload() {
    const documentId = 'EDCS-18553303';
    // let fileName: string = "New_PID_List.xlsx"
    // try {
    //   await this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
    // } catch (error) {
    //   console.error(error)
    // }

    this.docCentralService.downloadFromUI(documentId, 'approved');
  }
  /**
   * Tooltip Info Icon
   */
  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon != null && this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() == iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      let description: string;
      if (desc && desc.length > 0) {
        description = desc.join('\n');
      }
      return description;
    }
  }

  ngOnDestroy(): void {
    if (this.toolTipSubscription != null) {
      this.toolTipSubscription.unsubscribe();
    }

    if (this.skipPIdListSubscription != null) {
      this.skipPIdListSubscription.unsubscribe();
    }
    if (this.revRecUpdateListenerSubscription != null) {
      this.revRecUpdateListenerSubscription.unsubscribe();
    }

    // Cleaning up function
    this.removeToast();
  }

  private removeToast(): void {
    if (this.edcsUpdateToast) {
      this.edcsUpdateToast.hide();
    }
  }
 
  /**
   *
   * On change of alternate approver
   */
  matOptionSelected(selectedValue){
    if (selectedValue.cecId || 'errorStatus' in  selectedValue) {
      this.inputValue = selectedValue;
    } else {
      this.inputValue = null;
    }
  }
  getSelectedUserName(selectedUser) {
    if (selectedUser) { return selectedUser.name; }
  }
  async onMemberAddition() {
    this.showLoader = true;
    await this.addSelectedUserToMemberArray(this.inputValue);
    this.showLoader = false;
  }
  /**
   * 
   * @param selectedUser 
   */
  async addSelectedUserToMemberArray(selectedUser) {
    if ('errorStatus' in  selectedUser) {
      try {
        selectedUser = await this.userService.getUserDetailsFromDirectory(selectedUser.name).toPromise();
      } catch (err) {
        console.error(err);
        return this.setErrorMessage('Invalid CEC Id');
      }
    }
    const userExist = this.members.filter(member => {
      return member.cecId === selectedUser.cecId;
    });

    if (userExist.length === 0 ) {
      this.members = [];
      const memberObj = {name: selectedUser.name, cecId: selectedUser.cecId, fullName: selectedUser.name};
      this.members.push( memberObj );
      this.inputValue = null;
      this.searchMember.reset();
      this.members.forEach((obj, index) => {
        if (obj.name.split(' ')[1]) {
          this.members[index].name = `${obj.name.split(' ')[0]} ${obj.name.split(' ')[1].split('')[0]}`;
        } else {
          this.members[index].name = `${obj.name.split(' ')[0]}`;
        }
      });
      // Call to api to save alternate proxy.
      this.loaderService.show();
      const alternateProxy = { cecId: selectedUser.cecId, name: selectedUser.name };
      this.revRecService.setUpdateAlternateProxy(this.revRecId, 'add', alternateProxy).subscribe(res => {
        this.loaderService.hide();
      });
    } else {
      this.searchMember.reset();
      this.inputValue = null;
      this.setErrorMessage('User Already Exist');
    }
  }
  /**
   *
   * 
   */
  setErrorMessage(err: string): void {
    this.errorOccurred = true;
    this.getErrorMessage = err;
    setTimeout(() => {
      this.errorOccurred = false;
      this.getErrorMessage = '';
    }, 4000);
  }
  /**
   * 
   * @param index
   */
  onRemove(index) {
    this.members.splice(index, 1);
    // call to remove alternate proxy from mongo database revrec.buController
    this.loaderService.show();
    this.revRecService.setUpdateAlternateProxy(this.revRecId, 'remove').subscribe(res => {
      this.loaderService.hide();
    });
  }

  skipPidListFlagClicked(event) {
    this.updatedRevRecObj.skipPidListUpload.flag= event.target.checked? true : false;
    if(!this.updatedRevRecObj.skipPidListUpload.flag 
      && !(this.updatedRevRecObj.docCentralLinks.rclPidSubmit && this.updatedRevRecObj.docCentralLinks.rclPidSubmit.scopingChecklist))
      {
        this.isSubmitBtnEnabled =  false;
      }
    else if(this.updatedRevRecObj.skipPidListUpload.flag 
      && !(this.updatedRevRecObj.skipPidListUpload.comments &&this.updatedRevRecObj.skipPidListUpload.comments.length>0)){
      this.isSubmitBtnEnabled =  false; 
    }
    this.loaderService.show();
    this.skipPIdListSubscription=this.revRecService.updateSkipPidListDetails(this.revRecId, 
                                 {"skipPidListUploadFlag":this.updatedRevRecObj.skipPidListUpload.flag,
                                 "skipPidListUploadComments":this.updatedRevRecObj.skipPidListUpload.comments
                                 }).subscribe(res => {
      this.loaderService.hide();
      this.getRclObj();
    });
  }

  onPidListCommentChanged(event){
    this.updatedRevRecObj.skipPidListUpload.comments=this.updatedRevRecObj.skipPidListUpload.comments.trim();
    if(!(this.updatedRevRecObj.skipPidListUpload.comments.length>0)){
        this.isSubmitBtnEnabled =  false;
    }
    this.loaderService.show();
    this.skipPIdListSubscription=this.revRecService.updateSkipPidListDetails(this.revRecId, 
                                 {"skipPidListUploadFlag":this.updatedRevRecObj.skipPidListUpload.flag,
                                 "skipPidListUploadComments":this.updatedRevRecObj.skipPidListUpload.comments
                                 }).subscribe(res => {
      this.loaderService.hide();
      this.getRclObj();
    });
      
  }
}
