import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ProfileDetails, RecommendationDataModel } from '@cpdm-model/admin/recommendationData.model';
import { Recommendation } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';
import { EditDetailsAdminService } from '@cpdm-service/admin/edit-details-admin.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs'

const animationOptions = [
  trigger('detailExpand', [
    state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
    state('expanded', style({ height: '*' })),
    transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])
];

@Component({
  selector: 'app-reccomendation-edit-table',
  templateUrl: './reccomendation-edit-table.component.html',
  styleUrls: ['./reccomendation-edit-table.component.scss'],
  animations: animationOptions
})
export class ReccomendationEditTableComponent implements OnInit, OnDestroy {

  @ViewChild(MatTable, { static: false }) adminTable: MatTable<RecommendationDataModel> //used when add a row

  recommendationFormArray: FormArray;
  recTable: FormGroup;
  recommendationData: RecommendationDataModel;
  dataSource: AbstractControl[];
  displayedColumns = [
    'Unique Identifier',
    'Uid Name',
    'Profile',
    'Sub-Profiles',
    'Product Type',
    'Recommendation',
    'Conformance Level'
  ];
  isReadOnly = false;
  private draftedRows: Recommendation[];
  conformanceLevelDDList: string[];
  profileDDList: string[];
  subProfileDDList: Record<string, string[]>;
  profileDetails: ProfileDetails[] = [];
  recommendationList: Recommendation[];
  private getRecommendationSubscription: Subscription;
  hideSpinner = false;
  saveSubscription: Subscription;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReccomendationEditTableComponent>,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public recData: { version: string, isReadOnly: boolean },
    private dialog: MatDialog,
    private editAdminDetailsService: EditDetailsAdminService) { }

  ngOnInit() {
    this.hideSpinner = false;
    this.recTable = this.fb.group({
      tableRows: this.fb.array([])
    });
    this.getRecommendationData();
  }
  /**
   * @description To get recommendations using data from Image Content component
   */
  getRecommendationData() {
    if (this.recData) {
      const { isReadOnly, version } = this.recData;
      this.isReadOnly = isReadOnly;
      this.getRecommendationSubscription = this.editAdminDetailsService.getVersionBasedRecommendationData(version)
        .subscribe(response => {
          if (response) {
            const { success, data } = response;
            if (success) {
              const { recommendations } = data;
              this.recommendationData = data;
              this.profileDDList = [...new Set<string>(recommendations.map(rec => rec.profile))];
              this.conformanceLevelDDList = [...new Set<string>(recommendations.map(rec => rec.conformanceLevel))];
              this.recommendationList = [...recommendations];
              this.mapProfilesandSubProfiles()
              this.recommendationFormArray = new FormArray(this.recommendationList.map(val => this.createFormGroup(val)))
              this.dataSource = this.recommendationFormArray.controls;
              this.hideSpinner = true;
            }
          }
        }, () => {
          this.toastService.show('Error in data fetching', 'Error fetching the recommendations', 'danger')
          this.dialogRef.close();
        })
    } else { this.toastService.show('Error in data fetching', 'Error fetching the recommendations', 'danger'); }

  }
  /** 
   * @description Initiates a form group to display in table
   * @param data 
   * @returns 
   */
  createFormGroup(data) {
    data = data || { uniqueIdentifier: '', uidName: '', profile: '', subprofiles: '', recommendationDesc: '', productType: [''], conformanceLevel: '', status: 'No Selection', position: this.recommendationFormArray.controls.length + 1 };
    return new FormGroup({
      uniqueIdentifier: new FormControl(data.uniqueIdentifier, [Validators.required]),
      uidName: new FormControl(data.uidName, [Validators.required]),
      profile: new FormControl(data.profile, [Validators.required]),
      subProfiles: new FormControl(data.subProfiles, [Validators.required]),
      recommendationDesc: new FormControl(data.recommendationDesc, [Validators.required]),
      productType: new FormControl(data.productType, [Validators.required]),
      conformanceLevel: new FormControl(data.conformanceLevel, [Validators.required]),
      position: new FormControl(data.position),
      status: new FormControl(data.status)
    });
  }
  /**
   * @description Maps profiles and subprofiles for selection
   */
  mapProfilesandSubProfiles() {
    this.profileDDList.forEach(item => {
      const result = this.recommendationList.filter(value => (value.profile === item))
      const subProfiles = [...new Set<string>(result.map(val => val.subProfiles))]
      const pro: ProfileDetails = new ProfileDetails();
      pro['profile'] = item;
      pro['subProfiles'] = subProfiles;
      this.profileDetails.push(pro)
    })
    this.subProfileDDList = this.profileDetails.reduce(function (map, obj) {
      map[obj.profile] = obj.subProfiles;
      return map;
    }, {});
    this.onPropertyChange()
  }

  /**
   * @description Handles dropdown value change for properties
   * @param element 
   * @param property 
   */
  onPropertyChange(element?: FormControl, property?: string) {
    if (property) {
      if (property === 'profile') {
        let control = this.recommendationFormArray.controls.filter(row => row.get('uniqueIdentifier').value === element.value.uniqueIdentifier)
        control.map(row => {
          if (row.get('profile').value === 'Hardware') {
            row.patchValue({ productType: ['Hardware'] })
          } else {
            row.patchValue({ productType: ['Hardware', 'Software'] })
          }
          row.patchValue({ subProfiles: '' })
        })
      }
    }
  }
  /**
   * @description Saves the recommendations data and update the draft
   */
  saveDraftClicked() {
    this.draftedRows = this.recommendationFormArray.controls.map(row => row.value);
    let reqData: RecommendationDataModel = this.recommendationData;
    delete reqData._id;
    reqData.recommendations = this.draftedRows;
    // Encrypting recommendation description for security reason
    reqData.recommendations.forEach(element => {
      element.recommendationDesc = btoa(unescape(encodeURIComponent(element.recommendationDesc)));
    });
    this.saveSubscription = this.editAdminDetailsService.saveRecommendationsDraftData(reqData)
      .subscribe(response => {
        const { success, data } = response;
        if (success) {
          this.toastService.show('Success', 'Draft data is saved successfully', 'success')
          this.recommendationFormArray.reset(data.recommendations)
          const isDraftReady = true;
          this.dialogRef.close(isDraftReady)
        } else {
          this.toastService.show('Error', 'Error saving the draft data, please try again later', 'error')
        }
      }, () => {
        this.toastService.show('Error', 'Error saving the draft data, please try again later', 'error')
      })
  }
  /**
   * @description Discards any changes made to the data table and closes the modal
   */
  discardClicked() {
    if (!this.isReadOnly && this.recommendationFormArray.dirty) {
      const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
        {
          data: {
            header: 'Warning!',
            confirmationText: 'All your unsaved changes will be lost. Do you want to proceed?'
          },
          width: '35vw', height: 'auto', disableClose: true
        });
      confirmationDialogRef.componentInstance.onConfirmAction.subscribe(async () => {
        confirmationDialogRef.close();
        this.dialogRef.close()
      });
    }
    else { this.dialogRef.close() }
  }
  /**
   * @description Adds an empty row to the end of the table
   */
  onAddNew() {
    this.recommendationFormArray.push(this.createFormGroup(null));
    this.adminTable.renderRows();
    let tableDiv = document.getElementById('adminTable');
    tableDiv.scrollBy({
      top: tableDiv.scrollHeight,
      behavior: 'smooth'
    })
  }

  /**
   * @description Release resources
   */
  ngOnDestroy(): void {
    if (this.saveSubscription) { this.saveSubscription.unsubscribe() }
    if (this.getRecommendationSubscription) { this.getRecommendationSubscription.unsubscribe() }
  }
}