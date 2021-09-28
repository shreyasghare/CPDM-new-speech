import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CmtToolUrlModel, ExportComplianceAssignModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';
import { ExportComplianceService } from '@cpdm-service/general-compliance/export-compliance/export-compliance.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-ec-submit-assign-classify',
  templateUrl: './ec-submit-assign-classify.component.html',
  styleUrls: ['./ec-submit-assign-classify.component.scss']
})
export class EcSubmitAssignClassifyComponent implements OnInit, OnDestroy {
  showLoader = true;
  exportComplianceId: string;
  cmtUrl: string;
  ECAssignedData: ExportComplianceAssignModel;
  headerText: string;
  linkText: string;
  destroy$ = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private exportComplianceService: ExportComplianceService) { }

  ngOnInit() {
    this.exportComplianceId = this.activatedRoute.snapshot.parent.params.id;
    this.getExportComplianceAssignedData();
  }

  /**
   * @description Get URL for CMT Tool
   */
  private getCMTToolUrl() {
    this.exportComplianceService.getCMTToolUrlDataSub
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: CmtToolUrlModel) => {
        if (res && res.eprProjectId) {
          this.cmtUrl = `${res.openProjectUrl}/${res.eprProjectId}`;
        }
    });
  }

  /**
   * @description Get Export Compliance assigned data
   */
  private getExportComplianceAssignedData() {
    this.exportComplianceService.getExportComplianceAssignedData(this.exportComplianceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: { success: boolean, data: ExportComplianceAssignModel }) => {
        if (res.success) {
          this.ECAssignedData = res.data;
          this.showLoader = false;
          this.getCMTToolUrl();
          this.SetHeaderAndLinkText();
          if (getNestedKeyValue(this.ECAssignedData, 'caseStatus') === 'Closed') {
            if (!('isWorkflowInProgress' in this.ECAssignedData)) { this.ECAssignedData.isWorkflowInProgress = true; }
            this.exportComplianceService.updateEcDataWithSubject(this.ECAssignedData);
          }
        }
    }, err => {
      this.showLoader = false;
      this.toastService.show('Error in data fetching', err.error.error, 'danger');
    });
  }

  /**
   * @description Set text for header and link based on case status
   */
  private SetHeaderAndLinkText() {
    switch(this.ECAssignedData.caseStatus) {
      case 'Draft':
      case 'Draft In Progress':
        this.headerText = 'Provide details about your product and submit on';
        this.linkText = 'CMT tool';
        break;
      case 'Closed':
        this.headerText = 'Classification is complete. Check';
        this.linkText = 'more details';
        break;
      default:
        this.headerText = 'The GET (Global Export & Trade) team is working on your case. Check';
        this.linkText = 'more details';
    }
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
