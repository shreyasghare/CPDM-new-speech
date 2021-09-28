import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Subject } from 'rxjs';
import { ExportComplianceService } from '@cpdm-service/general-compliance/export-compliance/export-compliance.service';
import { CmtToolUrlModel, ExportComplianceModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '@cpdm-service/shared/toast.service';

@Component({
  selector: 'app-ec-link-generate',
  templateUrl: './ec-link-generate.component.html',
  styleUrls: ['./ec-link-generate.component.scss']
})
export class EcLinkGenerateComponent implements OnInit, OnDestroy {
  eprProjectId = new FormControl(null, [this.noWhitespaceValidator]);
  role = Role;
  currentRole: string;
  isEPRProjectLinked = false;
  externalCMTToolLink: string;
  showLoader = false;
  destroy$ = new Subject();
  exportComplianceDetails: ExportComplianceModel;
  projectId: string = "";

  constructor(private exportComplianceService: ExportComplianceService,
              private toastService: ToastService,
              private userDetailsService: UserDetailsService) { }

  ngOnInit() {
    this.currentRole = this.userDetailsService.userRole;
    this.getExportComplianceDetails();
    this.getCMTToolUrl();
  }

  /**
   * @description Check for whitespace validation
   * @param {FormControl} control
   */
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getExportComplianceDetails() {
    this.exportComplianceService.getExportComplianceDataSub.pipe(takeUntil(this.destroy$)).subscribe(exportComplianceData => {
      if (exportComplianceData) {
        this.projectId = exportComplianceData.projectId;
        this.exportComplianceDetails = exportComplianceData;
        this.isEPRProjectLinked = exportComplianceData.isEPRProjectLinked;
        const {eprProjectId} = this.exportComplianceDetails;
        this.eprProjectId.setValue(eprProjectId);
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching Export Compliance details', 'danger');
    });
  }

  linkEPRProjectId() {
    const requestObj = {
      eprProjectId: this.eprProjectId.value,
      isEPRProjectLinked: true,
      'workflow.next': 'submit_assign_classify',
      projectId: this.projectId,
      isEprIdUpdated : false
    };
    this.showLoader = true;
    this.exportComplianceService.linkEprProjectData(this.exportComplianceDetails._id, requestObj).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res && res.success) {
        this.toastService.show('Project details linked', `Thank you for providing your EPR ID / Request Number. <b>${this.eprProjectId.value}</b> is now linked to the Classification Management Tool (CMT).`, 'success');
        this.exportComplianceService.updateEcDataWithSubject(res.data);
      }
      this.showLoader = false;
    }, (err) => {
      this.showLoader = false;
      this.toastService.show('Invalid EPR ID', 'Make sure the EPR ID or Request number is entered correctly. Or to create a new product click "Generate" button.', 'danger');
    });
  }

  
  private getCMTToolUrl() {
    this.exportComplianceService.getCMTToolUrlDataSub
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: CmtToolUrlModel) => {
        if (res) {
          this.externalCMTToolLink = res.createProjectUrl;
        }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
