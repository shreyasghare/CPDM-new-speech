import { ChangeDetectorRef, Component, Inject, OnInit, AfterContentChecked, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Role } from '@cpdm-model/role';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { RecommendationsModel, CRCRecommendationsObjectModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';

const animationOptions = [
  trigger('detailExpand', [
      state('collapsed, void', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
];

@Component({
  selector: 'app-crc-recommendations-modal',
  templateUrl: './crc-recommendations-modal.component.html',
  styleUrls: ['./crc-recommendations-modal.component.scss'],
  animations: animationOptions
})
export class CrcRecommendationsModalComponent implements OnInit, AfterContentChecked, OnDestroy {
  role = Role;
  crcId: string;
  statusForReadOnly = ['submitted', 'resubmitted', 'approved'];
  isReadOnly: boolean;
  disableComments: boolean;
  showSaveBtn: boolean;
  displayedColumns: string[] = ['position', 'title', 'description', 'comments', 'delete'];
  crcRecommendationsObject: CRCRecommendationsObjectModel;
  crcRecommendationsDataSource: MatTableDataSource<RecommendationsModel>;
  isMoveToIdentify: boolean;
  isUpdated: boolean;
  allowNewRecommendations: boolean;
  isLoading = true;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ref: ChangeDetectorRef,
    private dialogRef: MatDialogRef<CrcRecommendationsModalComponent>,
    private toastService: ToastService,
    private userDetailsService: UserDetailsService,
    private communicationsRegulatoryService: CommunicationsRegulatoryService,
    @Inject(MAT_DIALOG_DATA) public data: { crcId: string, recommendationStatus: string, isMoveToIdentify: boolean, isUpdated: boolean }) { }

  ngOnInit() {
    this.crcId = this.data.crcId;
    this.isUpdated = this.data.isUpdated;
    this.isReadOnly = this.statusForReadOnly.includes(this.data.recommendationStatus) || this.currentRole === this.role.pm || this.isUpdated;
    this.isMoveToIdentify = this.data.isMoveToIdentify;
    this.disableComments =  this.isSubmittedForPO || this.isRejectedForPM || this.isSubmittedOnUpdateForPO || this.data.recommendationStatus === 'approved';
    this.showSaveBtn =  !this.disableComments;
    this.allowNewRecommendations = ((this.isMoveToIdentify && this.data.recommendationStatus === 'approved') || (this.isUpdated && (!this.data.recommendationStatus || this.data.recommendationStatus === 'rejected'))) && this.currentRole === this.role.communicationsRegulatoryPO;
    this.getRecommendations();
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  /**
   * @description Check if recommendations are submitted/resubmitted by PO
   */
  private get isSubmittedForPO() {
    return (this.data.recommendationStatus === 'submitted' || this.data.recommendationStatus === 'resubmitted') && this.currentRole === this.role.communicationsRegulatoryPO;
  }

  /**
   * @description Check if recommendations are rejected by PM
   */
  private get isRejectedForPM() {
    return this.data.recommendationStatus === 'rejected' && this.currentRole === this.role.pm;
  }

  /**
   * @description Check if PO requires after update actions
   */
  private get isSubmittedOnUpdateForPO() {
    return this.isUpdated && this.data.recommendationStatus !== 'rejected' && this.currentRole === this.role.communicationsRegulatoryPO;
  }


  /**
   * @description Getter to get current logged in user role
   */
  get currentRole(): string {
    return this.userDetailsService.userRole;
  }

  /**
   * @description Get CRC recommendations
   */
  getRecommendations() {
    this.communicationsRegulatoryService.getRecommendations(this.crcId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      const { success, data } = res;
      if (success && data) {
        this.initializeModalData(data[0]);
        this.isLoading = false;
      }
    }, () => {
      this.toastService.show('Error in fetching', 'Error in fetching CRC recommendations', 'danger');
    });
  }

  /**
   * @description Initializes default data for modal
   * @param data
   */
  initializeModalData(data) {
    this.crcRecommendationsObject = data ? data : {};
    const recommendations = data && data.recommendations ? data.recommendations : [];
    this.crcRecommendationsDataSource = new MatTableDataSource(recommendations);
    if (!this.isReadOnly || (this.isUpdated && (!this.data.recommendationStatus || this.data.recommendationStatus === 'rejected')) || (this.isMoveToIdentify && this.currentRole === this.role.communicationsRegulatoryPO && this.data.recommendationStatus !== 'resubmitted')) {
      this.addEmptyRowToRecommendations();
    }
  }

  /**
   * @description Add empty row at the end of the table
   */
  addEmptyRowToRecommendations() {
    const tempDataSource = JSON.parse(JSON.stringify(this.crcRecommendationsDataSource.data));
    const emptyRecommendation = {
      position: this.crcRecommendationsDataSource.data.length + 1,
      title: null,
      description: null,
      comments: null
    };
    if (this.isMoveToIdentify || this.isUpdated) {
      emptyRecommendation['isNewRecommendation'] = true;
    }
    tempDataSource.push(emptyRecommendation);
    this.crcRecommendationsDataSource.data = JSON.parse(JSON.stringify(tempDataSource));
    this.crcRecommendationsDataSource._updateChangeSubscription();
  }

  /**
   * @description Executes on change of title and description fields
   * @param { NgForm } form
   */
  onTableDataChange(form: NgForm) {
    if (form.valid && !this.isEmptyRowAvailable) {
      this.addEmptyRowToRecommendations();
    }
  }

  /**
   * @description Assigns curent user who updates comment
   * @param { RecommendationsModel } element Recommendation element
   */
  OnCommentChange(element: RecommendationsModel) {
    if (this.data.recommendationStatus) {
      element.commentsChangedBy = this.currentRole;
    }
  }

  /**
   * @description Clear viewed comment indicators
   * @param { RecommendationsModel } element Recommendation element
   */
  clearCommentIndicator(element: RecommendationsModel) {
    if (element.commentsChangedBy && element.commentsChangedBy !== this.currentRole) {
      delete element.commentsChangedBy;
      this.communicationsRegulatoryService.updateCrcRecommendationsComment(this.crcRecommendationsObject._id, this.crcRecommendationsDataSource.data)
      .subscribe(() => {
        // If required, make use of the response at this place
      }, () => {
        this.toastService.show('Error in update', 'Error in clearing comment indicators', 'danger');
      });
    }
  }

  /**
   * @description Checks for an empty row at the end of the table
   */
  get isEmptyRowAvailable() {
    const lastIndex = this.crcRecommendationsDataSource.data.length - 1;
    const { title, description } = this.crcRecommendationsDataSource.data[lastIndex];
    return !title || !description;
  }

  /**
   * @description Deletes recommendation from list
   * @param { number } index
   */
  deleteRecommendation(index: number) {
    if ((index === this.crcRecommendationsDataSource.data.length - 1 && this.isEmptyRowAvailable) || this.isReadOnly) {
      return;
    }
    this.crcRecommendationsDataSource.data.splice(index, 1);
    if (!this.crcRecommendationsDataSource.data.length) {
      this.addEmptyRowToRecommendations();
    } else {
      this.crcRecommendationsDataSource.data = this.crcRecommendationsDataSource.data.filter((item, idx) => {
        item.position = idx + 1;
        return item;
      });
      this.crcRecommendationsDataSource._updateChangeSubscription();
    }
  }

  /**
   * @description Save CRC recommendations
   */
  save() {
    this.isLoading = true;
    const requestObj = this.createRequestObj();
    this.communicationsRegulatoryService.saveRecommendations(this.crcId, requestObj)
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.isLoading = false;
      this.dialogRef.close(res);
    }, () => {
      this.toastService.show('Error in saving', 'Error in saving CRC recommendations', 'danger');
    });
  }

  /**
   * @description Creates recommendation object for saving
   * @returns { CRCRecommendationsObjectModel }
   */
  createRequestObj(): CRCRecommendationsObjectModel {
    let obj;
    this.validateRecommendations();
    if (this.crcRecommendationsObject._id) {
      obj = {
        recommendations: this.crcRecommendationsDataSource.data,
        lastUpdatedOn: new Date(),
        updatedBy: this.userDetailsService.getLoggedInCecId()
      };
    } else {
      obj = {
        communicationsRegulatoryId: this.crcId,
        recommendations: this.crcRecommendationsDataSource.data,
        createdOn: new Date(),
        createdBy: this.userDetailsService.getLoggedInCecId(),
        lastUpdatedOn: new Date(),
        updatedBy: this.userDetailsService.getLoggedInCecId()
      };
    }
    if (this.isMoveToIdentify || this.isUpdated) {
      obj.isNewRecommendationsAvailable = true;
    }
    return obj;
  }

  /**
   * @description validates value of title & description
   */
  validateRecommendations() {
    const lastIndex = this.crcRecommendationsDataSource.data.length - 1;
    const { title, description } = this.crcRecommendationsDataSource.data[lastIndex];
    if (!title || !description) {
      this.crcRecommendationsDataSource.data.splice(lastIndex, 1);
    }
  }

  /**
   * @description Closes modal dialog
   */
  closeModal() {
    this.dialogRef.close(false);
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
