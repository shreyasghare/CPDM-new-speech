import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CrcRecommendationsModalComponent } from './crc-recommendations-modal/crc-recommendations-modal.component';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';

@Component({
  selector: 'app-crc-identify',
  templateUrl: './crc-identify.component.html',
  styleUrls: ['./crc-identify.component.scss']
})
export class CrcIdentifyComponent implements OnInit, OnDestroy {
  role = Role;
  crcId: string;
  crcData: CommunicationsRegulatoryModel;
  recommendationStatus: string;
  isMoveToIdentify: boolean;
  isUpdated: boolean;
  isNewRecommendationsAvailable: boolean;
  showLoader = true ;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private userDetailsService: UserDetailsService,
    private toastService: ToastService,
    private crcService: CommunicationsRegulatoryService) { }

  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.parent.params.id;
    this.getCrcDataSub();
    this.getRecommendations();
  }

  /**
   * @description Get CRC details data from subject
   */
  private getCrcDataSub() {
    this.crcService.getCrcDataSub
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.crcData = res;
        this.recommendationStatus = getNestedKeyValue(this.crcData, 'identify', 'recommendationStatus');
        this.isMoveToIdentify = getNestedKeyValue(this.crcData, 'implement', 'report', 'moveToIdentify');
        this.isUpdated = this.crcData.isUpdated;
        this.showLoader = false;
      }
    });
  }

  /**
   * @description Get CRC recommendations
   */
  getRecommendations() {
    this.crcService.getRecommendations(this.crcId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      const { success, data } = res;
      if (success && data[0]) {
        this.isNewRecommendationsAvailable = res.data[0].isNewRecommendationsAvailable;
        this.crcService.updateRecommendationDataWithSubject(data[0]);
      }
    }, () => {
      this.toastService.show('Error in fetching', 'Error in fetching CRC recommendations', 'danger');
    });
  }

  /**
   * @description Getter to get current logged in user role
   */
  get currentRole(): string {
    return this.userDetailsService.userRole;
  }

  /**
   * @description Opens modal dialog to add CRC recommendations
   */
  openRecommendationsDialog() {
    const config = {
      data: {
        crcId: this.crcId,
        recommendationStatus: this.recommendationStatus,
        isMoveToIdentify: this.isMoveToIdentify,
        isUpdated: this.isUpdated
      },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(CrcRecommendationsModalComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res.success) {
        if (!this.crcData.crcRecommendationsId) {
          this.crcData.crcRecommendationsId = res.data._id;
          this.crcData.isTimestampAdded = false;
          this.crcService.updateCrcDataWithSubject(this.crcData);
        }
        this.isNewRecommendationsAvailable = res.data.isNewRecommendationsAvailable;
        this.crcService.updateRecommendationDataWithSubject(res.data);
      }
    });
  }

  /**
   * @description PM or PO can submit data for identify step
   * @param { CommunicationsRegulatoryModel } event request object to update
   */
  submit(event: CommunicationsRegulatoryModel) {
    this.showLoader = true;
    this.crcService.updateCrcDetails(this.crcId, event)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      if (getNestedKeyValue(res, 'data', 'identify', 'recommendationStatus') === 'approved') {
        res.data.isTimestampAdded = true;
      }
      this.crcService.updateCrcDataWithSubject(res.data);
    }, () => {
      this.toastService.show('Error in submit', 'Error submitting CRC recommendations', 'danger');
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
