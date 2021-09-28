import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExportComplianceService } from '@cpdm-service/general-compliance/export-compliance/export-compliance.service';
import { CmtToolUrlModel } from '@cpdm-model/general-compliances/export-compliance/exportCompliance.model';

@Component({
  selector: 'app-ec-complete',
  templateUrl: './ec-complete.component.html',
  styleUrls: ['./ec-complete.component.scss']
})
export class EcCompleteComponent implements OnInit, OnDestroy {
  completeStatus = {
    icon: 'check',
    status: 'The Export Compliance process is complete',
    message: `<em><strong>Note:</strong> To see more details, go to <a>CMT tool</a></em>`
  };
  destroy$ = new Subject();
  constructor(private exportComplianceService: ExportComplianceService) { }

  ngOnInit() {
    this.getCMTToolUrl();
  }

  /**
   * @description Get URL for CMT Tool
   */
  private getCMTToolUrl() {
    this.exportComplianceService.getCMTToolUrlDataSub
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: CmtToolUrlModel) => {
        if (res && res.eprProjectId) {
          this.completeStatus['message'] = `<em><strong>Note:</strong> To see more details, go to <a href='${res.openProjectUrl}/${res.eprProjectId}' target='_blank'>CMT tool</a></em>`;
        }
    });
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
