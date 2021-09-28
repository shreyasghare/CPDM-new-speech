import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Role } from '@cpdm-model/role';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { GlobalizationModel, serviceRequestListModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { GlobalizationService } from '@cpdm-service/additional-requirements/globalization/globalization.service';

@Component({
  selector: 'app-gz-implementation-sign-off',
  templateUrl: './gz-implementation-sign-off.component.html',
  styleUrls: ['./gz-implementation-sign-off.component.scss'],
  providers: [DatePipe]
})
export class GzImplementationSignOffComponent implements OnInit, OnDestroy {
  role = Role;
  globalizationId: string;
  projectId: string;
  globalizationData: GlobalizationModel;
  serviceRequestList: serviceRequestListModel;
  waitHoldingMsg = {
    statusIcon: 'wait',
    status: 'GTS (Globalization & Translation Services) team is completing the Implementation Checklist'
  };
  checklistHoldingMsg = {
    statusIcon: 'submit',
    status: 'Implementation Completion Checklist'
  };
  documentationHoldingMsg = {
    statusIcon: 'files',
    status: 'Provide additional documentation (if any)'
  };
  newCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Provide comments (if any)'
  };
  poCommentsHoldingMsg = {
    statusIcon: 'chat',
    status: 'Comments from the GTS team',
    message: ''
  };
  customDropzoneState = {
    showLoader: false,
    showUploadSuccess: false,
    showUploadContainer: false,
    isFileUploded: false,
    isActive: true
  };
  docCentralObj = {
    _id: '',
    edcsID: '',
    versionRef: '',
    nodeRef: '',
    fileName: '',
    uploadDate: ''
  };
  fileName: string;
  poComment: string;
  poCommentList: { comment: string, commentedOn: Date, commentedBy: string }[];
  isEditable: { pm: boolean, po: boolean };
  isVisible: { pm: boolean, po: boolean };
  showLoader: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private datepipe: DatePipe,
    private userDetailsService: UserDetailsService,
    private docCentralService: DocCentralService,
    private toastService: ToastService,
    private globalizationService: GlobalizationService) { }

  ngOnInit() {
    this.globalizationId = this.activatedRoute.snapshot.parent.params.id;
    this.getGlobalizationServiceSub();
  }

  /**
   * @description Getter to get current logged in user role
   */
  get currentRole(): string {
    return this.userDetailsService.userRole;
  }

  /**
   * @description Get globalization subject data
   */
  private getGlobalizationServiceSub() {
    this.globalizationService.getGlobalizationDataSub
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if (res) {
        this.projectId = res.projectId;
        this.globalizationData = res;
        this.serviceRequestList = getNestedKeyValue(res, 'implementation', 'serviceRequestList');
        this.poCommentList = getNestedKeyValue(res, 'implementation', 'poComments') ? getNestedKeyValue(res, 'implementation', 'poComments') : [];
        this.isEditable = getNestedKeyValue(res, 'implementation', 'isEditable');
        this.isVisible = getNestedKeyValue(res, 'implementation', 'isVisible');
        this.createPOCommentHoldingMsg();

        if (getNestedKeyValue(res, 'implementation', 'docCentralLinks', 'document')) {
          this.customDropzoneState.isFileUploded = true;
          this.customDropzoneState.showUploadContainer = true;
          this.docCentralObj = getNestedKeyValue(res, 'implementation', 'docCentralLinks', 'document');
          if (!this.isEditable.po) {
            this.documentationHoldingMsg.status = 'Additional documentation';
          }
        }
        this.customDropzoneState.isActive = this.isEditable.po;
      }
    });
  }

  /**
   * @description Creates content for PO comments banner
   */
  createPOCommentHoldingMsg() {
    this.poCommentsHoldingMsg.message = '';
    this.poCommentList.forEach((element, index) => {
      if(element.comment.length) {
      this.poCommentsHoldingMsg.message += `
        <p>Comment by <span class='text-link text-italic'>${element.commentedBy}</span>
        <span class='text-gray-600'> | <span class='text-italic'>On ${this.datepipe.transform(new Date(element.commentedOn), 'dd MMM y')}</span></span><br>
        <span>${element.comment}</span></p>`;
      }
      if (this.poCommentList.length > 1 && index < (this.poCommentList.length - 1)) {
        this.poCommentsHoldingMsg.message += `<hr>`;
      }
    });
  }

  /**
   * @description Updates service request item
   * @param { serviceRequestListModel } item Updated service request item
   */
  onServiceRequestListChange(item: serviceRequestListModel) {
    this.showLoader = true;
    let requestObj;
    requestObj = {
      projectId: this.projectId,
      uniqueKey: item.uniqueKey,
      value: item.selected
    };
    this.globalizationService.updateImplServiceRequestList(this.globalizationId, requestObj)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if (res.success) {
        // If required, make use of the response at this place
      }
      this.showLoader = false;
    }, () => {
      this.toastService.show('Error in checklist update', 'Error updating Implementation Completion Checklist', 'danger');
      this.showLoader = false;
    });
  }

  /**
   * @description Upload documents
   * @param event Document details
   */
  onUploadClicked(event) {
    if (!this.docCentralObj.nodeRef) {
      const edcsUploadToast = this.toastService.show(`Upload In Progress`, event[0].name, 'info', { autoHide: false });
      this.fileName = `${event[0].name}`;
      this.customDropzoneState.showLoader = true;
      this.customDropzoneState.isFileUploded = true;

      const body = {
        title: this.fileName,
        description: 'Globalization Implementation Sign-off',
        folderPath: 'globalization/root',
        workflow: 'Globalization',
        projectId: this.projectId
      };

      this.docCentralService.docCentralUpload(event[0], body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(docCentralUploadRes => {
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
          projectId: this.projectId,
          document: edcsBody
        };
        this.globalizationService.patchEdcsObj(this.globalizationId, edcsPatchBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe(edcsUpdateRes => {
          if (edcsUpdateRes.success) {
            this.globalizationService.updateGlobalizationDataWithSubject(edcsUpdateRes.data);
            edcsUploadToast.update('EDCS Upload Success', event[0].name, 'success');
          }
        }, err => {
          edcsUploadToast.update('Data patching failed', err.error ? err.error.error : 'Patching document details failed', 'danger');
        });
        this.docCentralObj = edcsBody;
      }, err => {
        this.customDropzoneState.showLoader = false;
        this.customDropzoneState.isFileUploded = false;
        edcsUploadToast.update('EDCS Upload Failed', err.error ? err.error.error : 'Please try again after 5 minutes.', 'danger');
      });
    }
  }

  /**
   * @description Submitting service request checklist, documentation(s) and comment
   */
  submit() {
    this.showLoader = true;
    let requestObj;
    requestObj = {
      projectId: this.projectId,
      comments: this.poCommentList
    };
    if (this.poComment) {
      requestObj.comments.unshift({
        comment: this.poComment,
        commentedOn: new Date(),
        commentedBy: this.userDetailsService.getLoggedInCecId()
      });
    }
    this.globalizationService.submitImplementation(this.globalizationId, requestObj)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if (res.success) {
        this.toastService.show('Submitted', 'Implementation checklist has been submitted', 'success');
        this.globalizationService.updateGlobalizationDataWithSubject(res.data);
      }
      this.showLoader = false;
    }, () => {
      this.toastService.show('Error in checklist update', 'Error updating Implementation Completion Checklist', 'danger');
      this.showLoader = false;
    });
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
