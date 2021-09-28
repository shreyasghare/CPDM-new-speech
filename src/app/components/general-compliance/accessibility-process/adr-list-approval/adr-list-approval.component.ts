import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { AdrItemsDialogComponent } from '../shared/adr-items-dialog/adr-items-dialog.component';
import { adrChecklistApproval, checklistRevised, customTabs,
  listOfApplicableAdrItems, puttingStatusAndComments } from '../shared/constants';

@Component({
  selector: 'app-adr-list-approval',
  templateUrl: './adr-list-approval.component.html',
  styleUrls: ['./adr-list-approval.component.scss']
})
export class AdrListApprovalComponent implements OnInit, OnDestroy {

  @Input() isPmScreen: boolean;
  listOfAdrItems = listOfApplicableAdrItems;
  adrChecklistApproval = adrChecklistApproval;
  puttingStatusAndComments = puttingStatusAndComments;
  checklistRevised = checklistRevised;
  accessibilityData: any;
  projectId: string;
  showLoader = false;
  showRetry=true;
  

  constructor(private dialog: MatDialog,
              private route: ActivatedRoute,
              private accessibilityService: AccessibilityProcessService,
              private userDetails: UserDetailsService,
              private projectDetailsService: ProjectsDetailService,
              private toastService: ToastService,
              private docCentralService: DocCentralService) {
}

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.id;

    const [data] = await this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).toPromise();
    this.accessibilityData = data;

    //Code changes to show Retry button if ADR Checklist upload was failed//[US11858](https://rally1.rallydev.com/#/300796297852ud/search?detail=%2Fuserstory%2F71573ddb-4883-497f-978b-476cff95236c&keywords=retry&type=1975280142&fdp=true?fdp=true): Accessibility: After step 2, the ADR Checklist file should be generated
    if(data != undefined && data.docCentralLinks != undefined &&data.docCentralLinks.adrListApproval != undefined){
      //if adrList is generated then don't show retry button
      this.showRetry = false;
    }

    if (data) {
      const { lastUser, adrStatus, workflowTimestamp } = data;
      if (lastUser === 'po' && adrStatus === 'approved' && !getNestedKeyValue(workflowTimestamp, 'implementation')) {
        this.accessibilityService.enableNextSidebarItem('implementation');
      }
    }
  }

  openDialog() {
    const adrStatus = this.accessibilityData.adrStatus;
    const lastUser = this.accessibilityData.lastUser;
    const showSeperateAdrs = adrStatus === 'saved' || adrStatus !== 'started';
    const isReadOnly = adrStatus === 'approved' || adrStatus === 'rejected'
    || adrStatus === 'resubmit' && this.isPmScreen || adrStatus === 'pendingApproval' && this.isPmScreen;
    const showSubmitConfirmation = adrStatus === 'pendingApproval' || adrStatus === 'resubmit' || lastUser === 'po'
    && adrStatus === 'saved';
    const username = this.userDetails.getLoggedInCecId();
    let actionType = null;

    switch (adrStatus) {
      case 'toReSubmit':
        actionType = 'resubmit';
        break;

      case 'identified':
      case 'saved':
        actionType = 'pendingApproval';
        break;

      default:
        break;
    }

    const config = {
      data: { projectId: this.projectId, isPmScreen: this.isPmScreen,
              isReadOnly, showApprovalScreen: true, customTabs, showSubmitConfirmation,
              showSeperateAdrs, username, actionType
            },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
  };
    const dialogRef = this.dialog.open(AdrItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
         this.accessibilityData = result;

         if (result.adrStatus === 'approved') {
           this.accessibilityService.enableNextSidebarItem('implementation');
         }

        //  if (result.adrStatus === 'approved' || result.adrStatus === 'rejected') { //previous approach
         if (result.adrStatus === 'pendingApproval' && result.lastUser === 'pm') {  // change as a part of DE3357
           try {
             await this.accessibilityService.updateProgressScore(this.projectId, { progressScore: 20 }, 'adrListApproval').toPromise();
           } catch (error) {
            console.error('error:', error);
           }
         }
        }
    });

    dialogRef.componentInstance.onApprove.subscribe(async (data) => {
     if (data) {
      if (this.accessibilityData.adrStatus !== 'approved'
      && data.adrStatus === 'approved') {
        this.accessibilityData = data;
        try {
          this.showLoader = true;
          const returnedReponse = await this.generateAndUpdaload();

          if (returnedReponse) {
            this.accessibilityData = returnedReponse;
          }
          this.showLoader = false;
        } catch (error) {
          this.showLoader = false;
          this.showRetry= true;
        }
     }
     }
    });
  }

  async resubmitChecklist() {
    const updateBody: any = { updateQuery: {
      $set: {
        adrStatus: 'toReSubmit'
      }
    }};

    const { success, data } = await this.accessibilityService.updateAdrItems(this.projectId, updateBody).toPromise();

    if (success) {
     this.accessibilityData = data;
    }
  }

  ngOnDestroy() {

  }

  //Code changes to show Retry button if ADR Checklist upload was failed//[US11858](https://rally1.rallydev.com/#/300796297852ud/search?detail=%2Fuserstory%2F71573ddb-4883-497f-978b-476cff95236c&keywords=retry&type=1975280142&fdp=true?fdp=true): Accessibility: After step 2, the ADR Checklist file should be generated
  async generateAndUpdaload() {

    this.showLoader=true;
    const title = this.generateFileName();
    const fileName = this.projectDetailsService.getProjectDetails.name;
    const permissions = this.docCentralService.generateDocCentralPermissionArray();
    const edcsID = getNestedKeyValue(this.accessibilityData, 'docCentralLinks', 'adrListApproval', 'edcsID');
    const edcsUploadToast = this.toastService.show(`EDCS ${edcsID ? 'Update' : 'Upload'} In Progress`,
    fileName, 'info', { autoHide: false });
 
    const docCentralPostBody = {
      description: 'ADR list xls file',
      permissions, workflow: 'Accessibility',
      projectId: this.projectId, _id: this.projectId,
      fileName: title, edcsID, projectName: fileName,
      status: 'Draft',
    };
    try {
    const { edcsRes } = await this.docCentralService.docCentralGenerateUpload(this.projectId, docCentralPostBody).toPromise();

    if (edcsRes) {
      const updateBody: any = { updateQuery: {
        $set: {
          'docCentralLinks.adrListApproval': edcsRes._id
        }
      }
    };

    const { success, data } = await this.accessibilityService.updateAdrItems(this.projectId, updateBody).toPromise();

      if (success) {
        edcsUploadToast.update(`EDCS ${edcsID ? 'Update' : 'Upload'} Success`, fileName, 'success');
        
          this.accessibilityData = data;
          this.showLoader=false;
          this.showRetry=false;
             
        return data;
      }
    }
    } catch (error) {
    edcsUploadToast.update(`EDCS ${edcsID ? 'Update' : 'Upload'} Failed`, fileName, 'danger');
    this.showRetry=true;
    this.showLoader=false;
    
    }

  }

  private generateFileName() {
    const filename = this.projectDetailsService.getProjectDetails.name.replace(/\s+/g, '-');
    const productVersion = this.projectDetailsService.getProjectDetails.productVersion;
    return productVersion !== '' ? `ADR_Checklist_Cisco_${filename}_${productVersion}.xlsx` : `ADR_Checklist_Cisco_${filename}.xlsx`;
  }



async donwloadAdrListApproval() {
  const nodeRef = getNestedKeyValue(this.accessibilityData, 'docCentralLinks', 'adrListApproval', 'edcsID');
  if (nodeRef) {
    const filename = this.generateFileName();
    await this.docCentralService.downloadFileFromDocCentral(nodeRef, filename);
  }
}

}

function compare(a: string | number, b: string | number, isAsc: boolean) {
  return ( a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
