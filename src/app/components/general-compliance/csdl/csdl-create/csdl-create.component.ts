import { Component, OnInit, OnDestroy, AfterContentChecked } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CsdlProjectModalComponent } from './csdl-project-modal/csdl-project-modal.component';
import { CsdlProjectModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { Subscription } from 'rxjs';
import { CsdlCreateProjectModalComponent } from './csdl-create-project-modal/csdl-create-project-modal.component';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';

@Component({
  selector: 'app-csdl-create',
  templateUrl: './csdl-create.component.html',
  styleUrls: ['./csdl-create.component.scss']
})
export class CsdlCreateComponent implements OnInit, OnDestroy, AfterContentChecked {
  csdlProjectId = new FormControl(null, [this.noWhitespaceValidator]);
  existingProjectDetails: CsdlProjectModel;
  projectName: string;
  linkedCsdlId: number;
  owners: { cecId: string }[];
  isDetailsConfirmed = false;
  isNewCSDLProject = false;
  isDataLoading = false;
  canUpdateCSDLId = true;
  updateBtnInfo = 'Lets you update the CSDL ID by entering an existing one or creating a new one.';

  csdlDetailsSubscription: Subscription;
  csdlProjectDetailsSubscription: Subscription;
  csdlUpdateCSDLSubscription: Subscription;

  role = Role;
  currentRole: string;

  constructor(private dialog: MatDialog,
              private csdlService: CsdlService,
              private toastService: ToastService,
              private userDetailsService: UserDetailsService) { }

  ngOnInit() {
    this.currentRole = this.userDetailsService.userRole;
    this.getCsdlDetails();
  }

  ngAfterContentChecked() {
    const link = document.querySelector('.here-link');
    link && link.addEventListener('click', () => {
      link.setAttribute('disabled', 'disabled');
      this.getProjectDetails();
    });
  }

  /**
   * @description Check for whitespace validation
   * @param {FormControl} control
   */
   public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = ((control.value && control.value.toString()) || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  
  /**
   * @description Subscribe for CSDL details subject
   */
  private getCsdlDetails() {
    this.csdlDetailsSubscription = this.csdlService.getCsdlDataSub.subscribe(res => {
      if (res) {
        this.projectName = res.projectDetails ? res.projectDetails.name : res.projectName;
        this.owners = res.projectDetails ? res.projectDetails.owners : [];
        if (!res.isCSDLIdUpdated && res.csdlProjectId) {
          this.linkedCsdlId = res.csdlProjectId;
          this.isNewCSDLProject = res.isNewCsdlProject;
          this.isDetailsConfirmed = true;
          this.canUpdateCSDLId = res.workflow.timestamp ? false : true;
          this.csdlProjectId.setValue(res.csdlProjectId);
        } else {
          this.linkedCsdlId = null;
          this.isNewCSDLProject = false;
          this.isDetailsConfirmed = false;
          this.csdlProjectId.setValue(res.csdlProjectId);
        }
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching CSDL details', 'danger');
    });
  }

  /**
   * @description Get existing project details by CSDL ID
   */
  getProjectDetails() {
    this.isDataLoading = true;
    this.csdlProjectDetailsSubscription = this.csdlService.getProjectDetailsByCsdlId(this.linkedCsdlId ? this.linkedCsdlId : this.csdlProjectId.value).subscribe(res => {
      if (res.success) {
        this.existingProjectDetails = res.data;
        if (this.isNewCSDLProject) {
          this.openCreateProjectModal();
        } else {
          this.openProjectDetailsModal();
        }
      }
      this.isDataLoading = false;
    }, err => {
      this.toastService.show(`Invalid CSDL ID: ${this.csdlProjectId.value}`, err.error.data.detail, 'danger');
      this.isDataLoading = false;
    });
  }

  /**
   * @description Open modal for project details
   */
  private openProjectDetailsModal() {
    const config = {
      data: { projectDetails: this.existingProjectDetails, isDetailsConfirmed: this.isDetailsConfirmed },
      width: '60rem'
    };
    const dialogRef = this.dialog.open(CsdlProjectModalComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.csdlService.updateCsdlData(res.data);
        this.toastService.show('Details confirmed', `The <b>${this.existingProjectDetails.project_name}</b> with CSDL ID <b>${this.existingProjectDetails.project_id}</b> is successfully linked. Click <a class='here-link'>here</a> to see project details.`, 'success');
      }
    });
  }

  /**
   * @description Open modal for project details
   */
  openCreateProjectModal() {
    const config = {
      data: { projectDetails: this.existingProjectDetails, isDetailsConfirmed: this.isDetailsConfirmed, projectName: this.projectName, owners: this.owners },
      width: this.isNewCSDLProject ? '70rem' :'110rem',
      disableClose: true
    };
    const dialogRef = this.dialog.open(CsdlCreateProjectModalComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.csdlService.updateCsdlData(res.data);
      }
    });
  }

  ngOnDestroy() {
    if (this.csdlDetailsSubscription) {
      this.csdlDetailsSubscription.unsubscribe();
    }
    if (this.csdlProjectDetailsSubscription) {
      this.csdlProjectDetailsSubscription.unsubscribe();
    }
    if (this.csdlUpdateCSDLSubscription) {
      this.csdlUpdateCSDLSubscription.unsubscribe();
    }
  }
}
