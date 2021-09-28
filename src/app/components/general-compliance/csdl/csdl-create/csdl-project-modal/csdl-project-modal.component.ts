import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { CsdlProjectModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-csdl-project-modal',
  templateUrl: './csdl-project-modal.component.html',
  styleUrls: ['./csdl-project-modal.component.scss']
})
export class CsdlProjectModalComponent implements OnInit, OnDestroy {
  projectDetails: CsdlProjectModel;
  isDetailsConfirmed = false;
  showLoader = false;
  confirmProjectDetailsSubscription: Subscription;
  projectLink: string;

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private data: { projectDetails: CsdlProjectModel, isDetailsConfirmed: boolean },
    private csdlService: CsdlService) {
      this.projectDetails = this.data.projectDetails;
      this.isDetailsConfirmed = this.data.isDetailsConfirmed;
      this.projectLink = `${environment.csdlManageSIHomeLink}${environment.csdlManageSIProjectLink}`.replace("_id", this.projectDetails.project_id && this.projectDetails.project_id.toString());
  }

  ngOnInit() { }

  /**
   * @description Confirms CSDL project details and links CSDL Id
   */
  confirmDetails() {
    const requestObj = { csdlProjectId: this.projectDetails.project_id, 'workflow.next': 'plan_execute', 'isCSDLIdUpdated':false, 'isCSDLIdLinked':true };
    this.showLoader = true;
    this.confirmProjectDetailsSubscription = this.csdlService.confirmProjectDetails(this.csdlService.CsdlID, requestObj).subscribe(res => {
      this.showLoader = false;
      this.dialogRef.close(res);
    }, err => {
      this.showLoader = false;
    });
  }


  /**
   * @description Closes project modal
   */
  closeModal() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.confirmProjectDetailsSubscription) {
      this.confirmProjectDetailsSubscription.unsubscribe();
    }
  }

}
