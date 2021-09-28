import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TpsdService } from '@cpdm-service/general-compliance/tpsd/tpsd.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tpsd-complete',
  templateUrl: './tpsd-complete.component.html',
  styleUrls: ['./tpsd-complete.component.scss']
})
export class TpsdCompleteComponent implements OnInit, OnDestroy {
  imgSrc: string;
  coronaUrl: string;
  tpsUrl: string;
  state: string;
  showSpinner: boolean;
  isTpsdLinkError: boolean;
  approvedDetailsObject: {
    state: boolean,
    comments: string,
    userId: string,
    updatedAt?: Date
  };
  private destroy$ = new Subject();

  constructor(private activatedRoute: ActivatedRoute,
              private tpsdService: TpsdService,
              private toastService: ToastService) { }

  ngOnInit() {
    this.showSpinner = true;
    this.getTpsdData();
  }
  /**
   * Get TPSD release information
   */
  private getTpsdData() {
    const tpsdId = this.activatedRoute.snapshot.parent.params.id;
    this.tpsdService.getTpsdProjectReleaseData(tpsdId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const { success, data } = res;
        if (success) {
          if (Object.keys(data).length) {
            const { content, metadata } = data;
            this.coronaUrl = metadata.coronaUrl;
            this.tpsUrl = metadata.tpsUrl;
            this.approvedDetailsObject = metadata.approvedDetails;
            if (content.length) {
              content[0].state === 'RED' ? this.imgSrc = String.raw`assets\images\csdl\svg\waiting-status.svg`
                : this.imgSrc = String.raw`assets\images\csdl\svg\approved-status.svg`;
            }
          } else {
            this.isTpsdLinkError = true;
          }
          this.showSpinner = false;
        }
      }, () => {
        this.toastService.show('Error', 'Some error occured. Please try again later', 'danger');
        this.showSpinner = false;
      });
  }
  /**
   * Release resources
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
