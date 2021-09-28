import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { DocCentral } from '@cpdm-model/DocCentral';



@Component({
  selector: 'app-release-vpat',
  templateUrl: './release-vpat.component.html',
  styleUrls: ['./release-vpat.component.scss']
})
export class ReleaseVpatComponent implements OnInit {

  @Input() isPMscreen;
  savedAccessibilityObj: any;
  docCentralLinks: any[] = [];
  projectId: any;
  projectObj: any;
  isReleased = false;
  apiResponseReady: boolean;
  adrChecklistFound: boolean=false;
  adrCheckListRetry:DocCentral;
  filename: string;
  showLoader: boolean;
  showRetry: boolean;
  docCentralResBody: { adrListApproval: { 'edcsID': any; 'versionRef': any; 'nodeRef': any; 'fileName': string; 'uploadDate': string; }; };
  docCentralObj: any = {
    edcsRefLink: '',
    edcsId: ''
  };


  constructor(private dataService: AccessibilityProcessService,
              private activatedRoute: ActivatedRoute,
              private docCentralService: DocCentralService,
              private loaderService: LoaderService,
              private userDetailsService: UserDetailsService,
              private projectDetailsService: ProjectsDetailService,
              private toastService: ToastService,
              private accessibilityService: AccessibilityProcessService) { }

  // downloadFileFromServer(nodeRef:string){
  //   return `${environment.apiUrl}/api/v1/doccentral/?path=${nodeRef}`;
  // }

  async downloadFile(nodeRef: string, fileName: string) {
    await this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
  }

  downloadFileFromServer(nodeRef: string) {
    return `${environment.apiUrl}/api/v1/doccentral/?path=${nodeRef}`;
  }

  ngOnInit() {
    this.apiResponseReady = false;
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.savedAccessibilityObj =  this.dataService.getAccessibilityObj();
    if (this.savedAccessibilityObj.workflowTimestamp) {
      if (this.savedAccessibilityObj.workflowTimestamp.releaseVpat) {
        this.isReleased = true;
      }
    }
    this.dataService.getUpdatedAccessibilityObj(this.projectId).subscribe(obj => {

      this.savedAccessibilityObj = obj[0];
      if (this.savedAccessibilityObj) {
        //Code changes to show Retry button if ADR Checklist upload was failed//[US11858](https://rally1.rallydev.com/#/300796297852ud/search?detail=%2Fuserstory%2F71573ddb-4883-497f-978b-476cff95236c&keywords=retry&type=1975280142&fdp=true?fdp=true): Accessibility: After step 2, the ADR Checklist file should be generated
        if(this.savedAccessibilityObj.docCentralLinks.hasOwnProperty("adrListApproval")){
          //if adrList is generated then don't show retry button
          this.adrChecklistFound=true
        };

        for (const key in this.savedAccessibilityObj.docCentralLinks) {
          const element = this.savedAccessibilityObj.docCentralLinks[key];
          if (element.word) {
            this.docCentralLinks.push(element.word);
          }
          if (element.pdf) {
            this.docCentralLinks.push(element.pdf);
          }
          if (!element.word && !element.pdf) {
            //  element.nodeRef = `https://docs.cisco.com/share/page/site/nextgen-edcs/document-details?nodeRef=${element.nodeRef}`
            this.docCentralLinks.push(element);
          }
        }
        if (this.savedAccessibilityObj.workflowTimestamp.releaseVpat) {
          this.isReleased = true;
        }
       }
      this.apiResponseReady = true;
      
      // Checking if this.docCentralLinks has ADR_Checklist_Cisco_<project name>.xlsx
      const tofindProjectName = `ADR_Checklist_Cisco_${this.projectDetailsService.getProjectDetails.name.replace(/ /g, '-')}.xlsx`;
      if (this.adrChecklistFound == false) {
          const element = {
          fileName: tofindProjectName,
          edcsID: undefined,
          uploadDate: undefined,
          adrChecklistFound: false,
          showRetry: true
        };
        this.docCentralLinks.push(element);
      }
    });
  }

 async onFinish() {
    this.loaderService.show();
    try {
        const progressScoreRes = await this.dataService.updateProgressScore(this.projectId, {progressScore: 100}, 'releaseVpat').toPromise();
        const workflowRes = await this.dataService.updateWorkflowTimestamp(this.projectId, {step: 'releaseVpat'}).toPromise();
        this.dataService.enableNextSidebarItem('releaseVpat');
        this.loaderService.hide();
        this.isReleased = true;
      } catch (error) {
        this.loaderService.hide();
      }
    // this.savedAccessibilityObj.workflowTimestamp['releaseVpat'] = new Date().toString();
    // this.dataService.startAccessibilityProcess(this.savedAccessibilityObj).subscribe(res => {
    //   if(res){
    //     this.dataService.enableNextSidebarItem('releaseVpat');
    //     this.dataService.updateProgressScore(this.projectId, {"progressScore": 100}, 'releaseVpat').subscribe(res=>{
    //     });
    //     this.isReleased = true;
    //   }
    // });
  }

  //Code changes to show Retry button if ADR Checklist upload was failed//[US11858](https://rally1.rallydev.com/#/300796297852ud/search?detail=%2Fuserstory%2F71573ddb-4883-497f-978b-476cff95236c&keywords=retry&type=1975280142&fdp=true?fdp=true): Accessibility: After step 2, the ADR Checklist file should be generated
  async retryAdrChecklistUpload() {

    this.showLoader=true;
    const title = this.generateFileName();
    const fileName = this.projectDetailsService.getProjectDetails.name;
    const permissions = this.docCentralService.generateDocCentralPermissionArray();
    const edcsID = getNestedKeyValue(this.savedAccessibilityObj, 'docCentralLinks', 'adrListApproval', 'edcsID');
    const edcsUploadToast = this.toastService.show(`EDCS ${edcsID ? 'Update' : 'Upload'} In Progress`,
    fileName, 'info', { autoHide: false });
 
    const docCentralPostBody = {
      description: 'ADR list xls file',
      permissions, workflow: 'Accessibility',
      projectId: this.projectId, _id: this.projectId,
      fileName: title, edcsID, projectName: fileName
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

        
          this.savedAccessibilityObj = data;
          for (let i = 0; i < this.docCentralLinks.length; i++){
            //Once Retry is successful pop the old object and set the new object
            if(this.docCentralLinks[i].showRetry == true){
              this.docCentralLinks[i]=edcsRes;
            }
          }
          this.showLoader=false;
        return data;
      }
    }
    } catch (error) {
    edcsUploadToast.update(`EDCS ${edcsID ? 'Update' : 'Upload'} Failed`, fileName, 'danger');
    this.showLoader=false;
    }

  }


  private generateFileName() {
    const filename = this.projectDetailsService.getProjectDetails.name.replace(/\s+/g, '-');
    const productVersion = this.projectDetailsService.getProjectDetails.productVersion;
    return productVersion !== '' ? `ADR_Checklist_Cisco_${filename}_${productVersion}.xlsx` : `ADR_Checklist_Cisco_${filename}.xlsx`;
  }


  /**
   * Upload and Retry Doc Central
   */
  uploadAndRetryDocCentral() {
    this.filename = this.projectDetailsService.getProjectDetails.name.replace(/\s+/g, '-');
    const productVersion = this.projectDetailsService.getProjectDetails.productVersion;
    const fileName = productVersion !== '' ? `ADR_Checklist_Cisco_${this.filename}_${productVersion}.xlsx` : `ADR_Checklist_Cisco_${this.filename}.xlsx`;
    const edcsUploadToast = this.toastService.show('EDCS Upload In Progress', fileName, 'info', { autoHide: false });
    const docCentralPostBody = {
      title: fileName,
      description: 'ADR list xls file',
      permissions: this.docCentralService.generateDocCentralPermissionArray()
    };

    this.showLoader = true;
    // this.showRetry = false;

    this.docCentralLinks.map((row) => {
      if (row.fileName === fileName) {
        row.found = true;
        row.showRetry = false;
      } else {
        row.found = false; // just to handle else cond
      }
    });

    this.docCentralService.docCentralGenerateUpload(this.projectId, docCentralPostBody).subscribe(edcsRes => {
      this.assignEdcsResToLocal(edcsRes);
      this.docCentralResBody = {
        adrListApproval: {
          edcsID: edcsRes.edcsID,
          versionRef: edcsRes.versionRef,
          nodeRef: edcsRes.nodeRef,
          fileName,
          uploadDate: new Date().toString()
        }
      };

      const logginUserObj = { userObj: this.userDetailsService.currentUserValue };
      const headers = {
        adrProcess: 'initiateProcess',
        user: logginUserObj
      };
      
      this.showLoader = false;
      this.docCentralLinks.map((row) => {
        if (row.fileName === fileName) {
          row.found = true;
          row.showRetry = false;
        } else {
          row.found = true;
        }
      });
      this.docCentralService.patchEdcsObj(this.projectId, this.docCentralResBody, headers).subscribe(res => {
        edcsUploadToast.update('EDCS Upload Success', fileName, 'success');
        this.docCentralLinks.map((row) => {
          if (row.fileName === fileName) {
            row.edcsID = edcsRes.edcsID;
            row.uploadDate = this.docCentralResBody.adrListApproval.uploadDate;
            row.found = true;
            row.showRetry = false;
          } else {
            row.found = true;
          }
        });

      }, err => {
        edcsUploadToast.update('EDCS Upload Failed', 'Try again.', 'danger');
        this.docCentralLinks.map((row) => {
          if (row.fileName === fileName) {
            row.found = false;
            row.showRetry = true;
          } else {
            row.found = true; // just to handle else cond
          }
        });
      }
      );
    }, err => {
      edcsUploadToast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
      console.error(err);
      this.showLoader = false;
      this.docCentralLinks.map((row) => {
        if (row.fileName === fileName) {
          row.found = false;
          row.showRetry = true;
        } else {
          row.found = true; // just to handle else cond
        }
      });
    });
  }

  assignEdcsResToLocal(edcsRes) {
    if (edcsRes) {
      this.docCentralObj.edcsRefLink = `https://docs.cisco.com/share/page/site/nextgen-edcs/document-details?nodeRef=${edcsRes.nodeRef}`;
      this.docCentralObj.edcsId = edcsRes.edcsID;
    }
  }
}
