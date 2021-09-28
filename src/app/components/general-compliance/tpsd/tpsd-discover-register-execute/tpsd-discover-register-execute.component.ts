import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TpsdRegisterExecuteContent } from '@cpdm-model/general-compliances/tpsd/tpsd.model';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { TpsdService } from '@cpdm-service/general-compliance/tpsd/tpsd.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tpsd-discover-register-execute',
  templateUrl: './tpsd-discover-register-execute.component.html',
  styleUrls: ['./tpsd-discover-register-execute.component.scss']
})

export class TpsdDiscoverRegisterExecuteComponent implements OnInit, OnDestroy {
  tpsdRegisterExecuteData: TpsdRegisterExecuteContent[];
  imgSrc: string;
  iscommentTextAreaDisabled: boolean;
  tpsUrl: string;
  coronaUrl: string;
  isProjectLinkingError: boolean;
  isCommentSubmitted: boolean;
  approvedObject: {
    state: boolean;
    comments: string;
    userId: string;
    updatedAt?: Date;
  };
  private tpsdId: string;
  private destroy$ = new Subject();
  constructor(
    private tpsdService: TpsdService,
    private toastService: ToastService,
    private userDetailsService: UserDetailsService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.tpsdId = this.activatedRoute.snapshot.parent.params.id;
    this.getTpsdInfo(this.tpsdId);
  }
  /**
   * @description To get the TPSD Product & Release Details
   */
  private getTpsdInfo(tpsdId: string) {
    this.tpsdService.getTpsdProjectReleaseData(tpsdId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const { success, data } = res;
        if (success) {
          if (Object.keys(data).length) {
            this.isProjectLinkingError = false;
            const { metadata, content } = data;
            this.approvedObject = metadata.approvedDetails;
            this.tpsdRegisterExecuteData = content;
            this.coronaUrl = metadata.coronaUrl;
            this.tpsUrl = metadata.tpsUrl;
            this.handleReleaseStatus(content);
            this.handleCheckboxExplanantionInput(this.approvedObject);
            if (getNestedKeyValue(metadata, 'approvedDetails', 'state')
              || getNestedKeyValue(metadata, 'productState') === 'GREEN') {
              this.tpsdService.updateTpsdDataWithSubject(metadata);
            }
          } else {
            this.isProjectLinkingError = true;
          }
        } else {
          this.toastService.show('Error', 'Error fetching the release details. Please try later', 'danger');
        }
      }, () => {
        this.toastService.show('Error', 'Error fetching the release details. Please try later', 'danger');
      });
  }
  /**
   * @description Update image path based on state
   * @param data
   */
  private handleReleaseStatus(data: TpsdRegisterExecuteContent[]) {
    if (data.length && typeof data[0].state !== undefined && data[0].state !== null) {
      data[0].state === 'RED' ? this.imgSrc = String.raw`assets\images\csdl\svg\waiting-status.svg`
        : this.imgSrc = String.raw`assets\images\csdl\svg\approved-status.svg`;
    } else {
      this.imgSrc = '';
    }
  }
  /**
   * @description Enables/Disable explanation textarea input
   * @param approvedDetails
   */
  private handleCheckboxExplanantionInput(approvedDetails) {
    approvedDetails.comments !== null ? this.iscommentTextAreaDisabled = true
      : this.iscommentTextAreaDisabled = false;
  }
  /**
   * @description Override Approved Details
   * @param event
   */
  overrideReleaseStatus(textarea: HTMLTextAreaElement, overrideCheckbox: HTMLInputElement) {
    if (overrideCheckbox.checked) {
      this.approvedObject = {
        state: true,
        comments: textarea.value,
        userId: this.userDetailsService.getLoggedInCecId(),
        updatedAt: new Date()
      };
      const requestObj = {
        approvedDetails: this.approvedObject,
        'workflow.next': 'complete',
        progressScore: 75,
        stepName: 'Discover/Register & Execute'
      };
      this.tpsdService.updateTpsdObject(this.tpsdId, requestObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          if (response && response.success) {
            this.tpsdService.updateTpsdDataWithSubject(response.data);
            this.isCommentSubmitted = true;
            this.iscommentTextAreaDisabled = true;
          }
        });
    }
  }
  /**
   * @description release resources
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
