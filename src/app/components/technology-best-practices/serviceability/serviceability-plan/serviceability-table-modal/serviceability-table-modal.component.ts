import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Recommendation, SavedFilters } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';
import { ServiceabilityRecModel } from '@cpdm-model/technology-best-practices/serviceability/serviceabilityRecommendation.model';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ServiceabilityService } from '@cpdm-service/technology-best-practices/serviceability/serviceability.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Subscription } from 'rxjs';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';

const animationOptions = [
  trigger('detailExpand', [
      state('collapsed, void', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
];

const defaultStatus = 'No Selection';
@Component({
  selector: 'app-serviceability-table-modal',
  templateUrl: './serviceability-table-modal.component.html',
  styleUrls: ['./serviceability-table-modal.component.scss'],
  animations: animationOptions
})
export class ServiceabilityTableModalComponent implements OnInit {
  @ViewChild('filterTableBtn', { static: true }) filterTableBtn: ElementRef;
  @ViewChild('filterTableDiv', { static: true }) filterTableDiv: ElementRef;
  @ViewChild('filterTableActionsDiv', { static: true }) filterTableActionsDiv: ElementRef;
  serviceabilityId: string;
  recommendationData: ServiceabilityRecModel;
  recommendationsDataSource: MatTableDataSource<Recommendation>;
  statusArray: ["No Selection", "Adopted", "Not applicable", "Current Release", "Future Release"];
  isRecommendationsDataLoaded = false;
  recommendationSubscription: Subscription;
  tooltipSubscription: Subscription;
  displayedColumns: string[] = [
    'select',
    'position',
    'uidName',
    'subProfiles',
    'recommendationDesc',
    'conformanceLevel',
    'status',
    'comments'
  ];
  tooltipHelperName: string[] = ['serviceability_status', 'serviceability_conformanceLevel'];
  resForInfoIcon = { serviceability_status: '', serviceability_conformanceLevel: '' };
  selection = new SelectionModel<Recommendation>(true, []);
  isReadOnly = false;
  selectedStatusForBulkUpdate = null;
  isCloseBtnEnabled = true;
  isSaveBtnEnabled = false;
  isApplyEnabled = false;
  recommendationsToUpdate = { recommendations: <Recommendation[]>[] };
  updatedRecommendations: {
    data: {
        recommendationStatus: string;
        recommendations: Recommendation[]
    },
    success: boolean
  };
  previousRecommendationState: Recommendation[];
  filterTableHeaderText = ['Product Type', 'Profile', 'Sub Profile', 'Conformance Level', 'Status'];
  filterTableColumnsData = {
    productTypeFilters: [],
    profiles: {},
    conformanceLevelFilters: ["Plastic", "Bronze", "Silver", "Gold"]
  };
  filterTableRows = [];
  filterTableRowsTempState = [];
  filterTableRowsOriginalState = [];
  showFilterTable = false;
  isDefaultFilter = true;
  isFiltersApplied = false;
  filtersChanged = false;
  savedFilters: SavedFilters = {
    productType: [],
    profile: [],
    subProfiles: [],
    conformanceLevel: [],
    status: []
  };
  selectedFilters = {
    productType: [],
    profile: [],
    subProfiles: [],
    conformanceLevel: [],
    status: []
  };
  tempSelectedFiltersCount = 0;
  tempSelectedFilters = {
    productType: [],
    profile: [],
    subProfiles: [],
    conformanceLevel: [],
    status: []
  };
  updateSubscription: Subscription;
  selectedSubProfileOriginalCount = {};
  selectedSubProfileCount = {};
  submenuItems = [];
  activeMenuProfile = "";

  @HostListener('document:click', ['$event']) toggleActive(event: Event) {
    const clickedOutsideOfButton = !this.filterTableBtn.nativeElement.contains(event.target);
    const clickedOutsideOfTable = !this.filterTableDiv.nativeElement.contains(event.target);
    const clickedOutsideOfActionsDiv = !this.filterTableActionsDiv.nativeElement.contains(event.target);
    if (clickedOutsideOfButton && clickedOutsideOfTable && clickedOutsideOfActionsDiv) {
      if (this.showFilterTable) {
        this.showFilterTable = false;
        this.filtersChanged = false;
        this.selectedSubProfileCount = {...this.selectedSubProfileOriginalCount};
        this.checkDefaultFilters(this.selectedFilters);
      }
    }
  }

  constructor(private serviceabilityService: ServiceabilityService,
              private dataService: ProjectsDataService,
              private spinnerService: SpinnerService,
              private toastService: ToastService,
              public dialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: { version: string, serviceabilityId: string, isReadOnly: boolean }
    ) { }

  ngOnInit() {
    this.serviceabilityId = this.data.serviceabilityId;
    this.getTooltipHelper();
    this.isReadOnly = this.data.isReadOnly;
    this.getServiceabilityRecommendations();
  }

  private getTooltipHelper(): void {
    this.tooltipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
      for (const element of res) {
        if (this.tooltipHelperName.includes(element.name)) {
          this.resForInfoIcon[element.name] = element.description.join('\n\n');
        }
      }
    });
  }

  /**
   * @description To get IPv6 recommendations
   */
  getServiceabilityRecommendations(): void {
    this.recommendationSubscription = this.serviceabilityService.getServiceabilityRecommendationData(this.data.serviceabilityId)
                                      .subscribe(res => {
      const { success, data: { status, recommendations, savedFilters }} = res;
      if (success) {
        this.statusArray = status;
        this.previousRecommendationState = JSON.parse(JSON.stringify([...recommendations]));
        this.recommendationsDataSource = new MatTableDataSource(recommendations);
        this.setFilterTableColumnData();
        this.createFilterTableJson(savedFilters);
        this.filterTableRowsOriginalState = JSON.parse(JSON.stringify([...this.filterTableRowsTempState]));
        this.filterTableRows = JSON.parse(JSON.stringify([...this.filterTableRowsTempState]));
        this.setSavedFilters();
        this.setSelectedFilters();
        this.setTempSelectedFilters();
        this.filterRecommendationTable();
        this.onSubProfileChanged();
        this.selectedSubProfileOriginalCount = {...this.selectedSubProfileCount};
        this.isRecommendationsDataLoaded = true;
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching the Serviceability recommendations', 'danger');
    });
  }

  /**
   * @description Set column data for filter table
   */
  private setFilterTableColumnData() {
    this.previousRecommendationState.forEach(recommendation => {
      // Set product types
      recommendation.productType.forEach(item => {
        if (!this.filterTableColumnsData.productTypeFilters.includes(item)) {
          this.filterTableColumnsData.productTypeFilters.push(item);
        }
      });
      // Set profiles
      if (!this.filterTableColumnsData.profiles[recommendation.profile]) {
        this.filterTableColumnsData.profiles[recommendation.profile] = [];
      }
      if (!this.filterTableColumnsData.profiles[recommendation.profile].includes(recommendation.subProfiles)) {
        this.filterTableColumnsData.profiles[recommendation.profile].push(recommendation.subProfiles);
      }
    });
  }

  /**
   * @description Create row wise JSON data for filter table
   * @param savedFilters 
   */
  private createFilterTableJson(savedFilters) {
    if (savedFilters && this.isFiltersSaved(savedFilters)) {
      // Create JSON from already saved data
      this.populateProductTypeColumn(savedFilters.productType);
      this.populateProfileColumn(savedFilters.profile);
      this.populateSubProfileColumn(savedFilters.subProfiles);
      this.populateConformanceLevelColumn(savedFilters.conformanceLevel);
      this.populateStatusColumn(savedFilters.status);
    } else {
      // Create JSON from master data
      this.populateProductTypeColumn();
      this.populateProfileColumn();
      this.populateSubProfileColumn();
      this.populateConformanceLevelColumn();
      this.populateStatusColumn();
    }
  }

  /**
   * @description Check if filter are already saved
   * @param savedFilters
   */
  private isFiltersSaved(savedFilters) {
    return Object.keys(savedFilters).length && (savedFilters.productType.length || savedFilters.profile.length || savedFilters.subProfiles.length || savedFilters.conformanceLevel.length || savedFilters.status.length);
  }

  /**
   * @description Populate product types to filter json
   * @param productTypeFilters
   */
  private populateProductTypeColumn(productTypeFilters?) {
    let isProductTypeSelected = false;
    const objList = [];
    productTypeFilters = productTypeFilters ? productTypeFilters : this.filterTableColumnsData.productTypeFilters;
    productTypeFilters.forEach(item => {
      const obj = {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
      };
      obj.productType["name"] = item.name ? item.name : item;
      obj.productType["selected"] = item.selected ? item.selected : false;
      if (item.selected) {
        isProductTypeSelected = true;
      }
      objList.push(obj);
    });
    // Set defaults to product types if none of them selected
    if (!isProductTypeSelected) {
      objList.forEach(item => {
        item.productType.selected = true;
      });
    }
    this.filterTableRowsTempState.push(...objList);
  }

  /**
   * @description Populate profiles to filter json
   * @param profiles
   */
  private populateProfileColumn(profiles?) {
    profiles = profiles ? profiles : Object.keys(this.filterTableColumnsData.profiles).sort();
    profiles.forEach((profile, index) => {
      const obj = {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
      };

      if (this.filterTableRowsTempState[index]) {
        this.filterTableRowsTempState[index].profile["name"] = profile.name ? profile.name : profile;
        this.filterTableRowsTempState[index].profile["selected"] = profile.selected ? profile.selected : false;
      } else {
        obj.profile["name"] = profile.name ? profile.name : profile;
        obj.profile["selected"] = profile.selected ? profile.selected : false;
        this.filterTableRowsTempState.push(obj);
      }
    });
  }

  /**
   * @description Update profile column data according to selected product type
   */
  private updateProfileColumn() {
    this.filterTableRowsTempState = JSON.parse(JSON.stringify([...this.filterTableRows]));
    const profiles = Object.keys(this.filterTableColumnsData.profiles).sort();
    if (this.tempSelectedFilters.productType.length === 1 && this.tempSelectedFilters.productType.includes("Software")) {
      const index = profiles.indexOf("Hardware");
      profiles.splice(index, 1);
      this.filterTableRowsTempState.forEach((item, index) => {
        if (!profiles.includes(item.profile["name"])) {
          // If only "Software" is selected as a product type it removes "Hardware" from profile column
          this.filterTableRowsTempState.splice(index, 1);
          const i = this.tempSelectedFilters.profile.indexOf(item.profile["name"]);
          if (i !== -1) {
            // If only "Software" is selected as a product type it removes "Hardware" from selected filters array
            this.tempSelectedFilters.profile.splice(i, 1);
          }
        }
      });
    } else {
      // Populates all the profiles with previous selected values
      profiles.forEach((profile, index) => {
        const obj = {
          productType: {},
          profile: {},
          subProfiles: {},
          conformanceLevel: {},
          status: {}
        };
  
        if (this.filterTableRowsTempState[index]) {
          this.filterTableRowsTempState[index].profile["name"] = profile;
          this.filterTableRowsTempState[index].profile["selected"] = this.tempSelectedFilters.profile.includes(profile)? true : false;
        } else {
          obj.profile["name"] = profile;
          obj.profile["selected"] = this.tempSelectedFilters.profile.includes(profile)? true : false;
          this.filterTableRowsTempState.push(obj);
        }
      });
    }
    this.filterTableRows = JSON.parse(JSON.stringify([...this.filterTableRowsTempState]));
    this.onProfileChanged();
  }

  /**
   * @description Populate sub-profiles to filter json
   * @param subProfiles
   */
  private populateSubProfileColumn(subProfiles?) {
    subProfiles = subProfiles ? subProfiles : [];
    subProfiles.forEach((profile, index) => {
      const obj = {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
      };

      if (this.filterTableRowsTempState[index]) {
        this.filterTableRowsTempState[index].subProfiles["name"] = profile.name ? profile.name : profile;
        this.filterTableRowsTempState[index].subProfiles["selected"] = profile.selected ? profile.selected : false;
      } else {
        obj.subProfiles["name"] = profile.name ? profile.name : profile;
        obj.subProfiles["selected"] = profile.selected ? profile.selected : false;
        this.filterTableRowsTempState.push(obj);
      }
    });
  }

  /**
   * @description Populate conformance level to filter json
   * @param conformanceLevelFilters
   */
  private populateConformanceLevelColumn(conformanceLevelFilters?) {
    conformanceLevelFilters = conformanceLevelFilters ? conformanceLevelFilters : this.filterTableColumnsData.conformanceLevelFilters;
    conformanceLevelFilters.forEach((conformanceLevel, index) => {
      const obj = {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
      };
      if (this.filterTableRowsTempState[index]) {
        this.filterTableRowsTempState[index].conformanceLevel["name"] = conformanceLevel.name ? conformanceLevel.name : conformanceLevel;
        this.filterTableRowsTempState[index].conformanceLevel["selected"] = conformanceLevel.selected ? conformanceLevel.selected : false;
      } else {
        obj.conformanceLevel["name"] = conformanceLevel.name ? conformanceLevel.name : conformanceLevel;
        obj.conformanceLevel["selected"] = conformanceLevel.selected ? conformanceLevel.selected : false;
        this.filterTableRowsTempState.push(obj);
      }
    });
  }

  /**
   * @description Populate status to filter json
   * @param statusFilters
   */
  private populateStatusColumn(statusFilters?) {
    statusFilters = statusFilters ? statusFilters : this.statusArray;
    statusFilters.forEach((status, index) => {
      const obj = {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
      };
      if (this.filterTableRowsTempState[index]) {
        this.filterTableRowsTempState[index].status["name"] = status.name ? status.name : status;
        this.filterTableRowsTempState[index].status["selected"] = status.selected ? status.selected : false;
      } else {
        obj.status["name"] = status.name ? status.name : status;
        obj.status["selected"] = status.selected ? status.selected : false;
        this.filterTableRowsTempState.push(obj);
      }
    });
  }

  /**
   * @description Set saved filters
   */
  private setSavedFilters(): void {
    this.savedFilters = {
      productType: [],
      profile: [],
      subProfiles: [],
      conformanceLevel: [],
      status: []
    };

    this.filterTableRows.forEach(item => {
      if (Object.keys(item.productType).length) {
        this.savedFilters.productType.push(item);
      }
      if (Object.keys(item.profile).length) {
        this.savedFilters.profile.push(item);
      }
      if (Object.keys(item.subProfiles).length) {
        this.savedFilters.subProfiles.push(item);
      }
      if (Object.keys(item.conformanceLevel).length) {
        this.savedFilters.conformanceLevel.push(item);
      }
      if (Object.keys(item.status).length) {
        this.savedFilters.status.push(item);
      }
    });
  }

  /**
   * @description Set selected/checked filters in each category
   */
  private setSelectedFilters() {
    this.selectedFilters = {
      productType: [],
      profile: [],
      subProfiles: [],
      conformanceLevel: [],
      status: []
    };

    this.filterTableRows.forEach(item => {
      if (item.productType.selected) {
        this.selectedFilters.productType.push(item.productType.name);
      }
      if (item.profile.selected) {
        this.selectedFilters.profile.push(item.profile.name);
      }
      if (item.subProfiles.selected) {
        this.selectedFilters.subProfiles.push(item.subProfiles.name);
      }
      if (item.conformanceLevel.selected) {
        this.selectedFilters.conformanceLevel.push(item.conformanceLevel.name);
      }
      if (item.status.selected) {
        this.selectedFilters.status.push(item.status.name);
      }
    });
    this.checkDefaultFilters(this.selectedFilters);
  }

  /**
   * @description To check if all/none/default of the filters are applied
   */
  private checkDefaultFilters(selectedFilters) {
    if ((!selectedFilters.productType.length || selectedFilters.productType.length === 2) &&
        !selectedFilters.profile.length &&
        !selectedFilters.conformanceLevel.length &&
        !selectedFilters.status.length) {
            this.isDefaultFilter = true;
    } else if(selectedFilters.productType.length ||
      selectedFilters.profile.length ||
      selectedFilters.conformanceLevel.length ||
      selectedFilters.status.length) {
        this.isDefaultFilter = false;
    }
  }

  /**
   * @description Set filters selected in filter modal
   * @param onFilterOpen
   */
  setTempSelectedFilters(onFilterOpen?, type?) {
    this.tempSelectedFiltersCount = 0;
    this.filtersChanged = onFilterOpen ? false : true;
    this.tempSelectedFilters = {
      productType: [],
      profile: [],
      subProfiles: [],
      conformanceLevel: [],
      status: []
    };
    this.filterTableRows.forEach(item => {
      if (item.productType.selected) {
        this.tempSelectedFiltersCount++;
        this.tempSelectedFilters.productType.push(item.productType.name);
      }
      if (item.profile.selected) {
        this.tempSelectedFiltersCount++;
        this.tempSelectedFilters.profile.push(item.profile.name);
      }
      if (item.subProfiles.selected) {
        this.tempSelectedFiltersCount++;
        this.tempSelectedFilters.subProfiles.push(item.subProfiles.name);
      }
      if (item.conformanceLevel.selected) {
        this.tempSelectedFiltersCount++;
        this.tempSelectedFilters.conformanceLevel.push(item.conformanceLevel.name);
      }
      if (item.status.selected) {
        this.tempSelectedFiltersCount++;
        this.tempSelectedFilters.status.push(item.status.name);
      }
    });

    if (type === "productType") {
      this.updateProfileColumn();
    } else if (type === "profile") {
      this.onProfileChanged();
    } else if (type === 'subProfiles') {
      this.onSubProfileChanged();
    }
    this.checkDefaultFilters(this.tempSelectedFilters);
  }

  /**
   * @description Update sub-profiles column on profile change
   */
  onProfileChanged() {
    const subProfiles = [];
    this.clearSubProfileList();
    this.tempSelectedFilters.profile.forEach(profile => {
      this.filterTableColumnsData.profiles[profile].forEach(subProfile => {
        if (!subProfiles.includes(subProfile)) {
          subProfiles.push(subProfile);
        }
      });
    });
    if (subProfiles.length) {
      subProfiles.forEach((item, index) => {
        const obj = {
          productType: {},
          profile: {},
          subProfiles: {},
          conformanceLevel: {},
          status: {}
        };
  
        if (this.filterTableRowsTempState[index]) {
          this.filterTableRowsTempState[index].subProfiles["name"] = item;
          this.filterTableRowsTempState[index].subProfiles["selected"] = this.tempSelectedFilters.subProfiles.includes(item) ? true : false;
        } else {
          obj.subProfiles["name"] = item;
          obj.subProfiles["selected"] = this.tempSelectedFilters.subProfiles.includes(item) ? true : false;
          this.filterTableRowsTempState.push(obj);
        }
      });
      this.filterTableRows = JSON.parse(JSON.stringify([...this.filterTableRowsTempState]));
    }
    this.onSubProfileChanged();
  }

  /**
   * @description Get count of selected sub-profiles for respective profiles 
   */
  onSubProfileChanged() {
    this.selectedSubProfileCount = {};
    this.tempSelectedFilters.profile.forEach(profile => {
      this.selectedSubProfileCount[profile] = [];
      this.tempSelectedFilters.subProfiles.forEach(subProfile => {
        if (this.filterTableColumnsData.profiles[profile].includes(subProfile)) {
          this.selectedSubProfileCount[profile].push(subProfile);
        }
      });
    });
  }

  /**
   * @description List of sub-profiles for hover text
   * @param profile
   */
  getSubProfileText(profile) {
    let text = "";
    this.selectedSubProfileCount[profile].forEach((item, index) => {
      text += `${index + 1}. ${item}\n`;
    });
    return text;
  }

  /**
   * @description it sets sub-menu items for popover
   * @param profile
   */
  getSubMenuItems(profile: string) {
    this.submenuItems = [];
    this.activeMenuProfile = profile;
    this.submenuItems = [...this.selectedSubProfileCount[profile]];
  }

  /**
   * @description Selects/Deselects all filter values
   * @param event contains checkbox data
   * @param filterKey is a header name
   */
  checkUncheckFilterColumn(event: { checked: boolean }, filterKey: string) {
    this.filterTableRows.forEach(item => {
        if (Object.keys(item[filterKey]).length) {
            item[filterKey].selected = event.checked;
        }
    });
    this.setTempSelectedFilters(false, filterKey);
  }

  /**
   * @description Clears list of sub-profiles
   */
  private clearSubProfileList() {
    this.filterTableRowsTempState = JSON.parse(JSON.stringify([...this.filterTableRows]));
    this.filterTableRowsTempState.forEach((item, index) => {
      if (item.productType.name || item.profile.name || item.conformanceLevel.name || item.status.name) {
        item.subProfiles = {};
      } else {
        this.filterTableRowsTempState.splice(index, this.filterTableRowsTempState.length - 1);
      }
    });
    this.filterTableRows = JSON.parse(JSON.stringify([...this.filterTableRowsTempState]));
  }

  /**
   * @description Updates selected filters to IPv6 collection
   */
  async applyFilters() {
    let isProductTypeSelected = false;
    this.isFiltersApplied = false;
    const filterObj = {
      productType: [],
      profile: [],
      subProfiles: [],
      conformanceLevel: [],
      status: []
    };

    this.filterTableRows.forEach(item => {
      if (Object.keys(item.productType).length) {
        filterObj.productType.push(item.productType);
        if (item.productType.selected) {
          isProductTypeSelected = true;
        }
      }
      if (Object.keys(item.profile).length) {
        filterObj.profile.push(item.profile);
      }
      if (Object.keys(item.subProfiles).length) {
        filterObj.subProfiles.push(item.subProfiles);
      }
      if (Object.keys(item.conformanceLevel).length) {
        filterObj.conformanceLevel.push(item.conformanceLevel);
      }
      if (Object.keys(item.status).length) {
        filterObj.status.push(item.status);
      }
    });

    if (!isProductTypeSelected) {
      filterObj.productType.forEach(item => {
        item.selected = true;
      });
    }

    this.serviceabilityService.updateSavedFiltersData(this.serviceabilityId, { savedFilters: filterObj }).subscribe(res => {
      this.savedFilters = res.data;
      this.filterTableRowsOriginalState = JSON.parse(JSON.stringify([...this.filterTableRows]));
      this.setSelectedFilters();
      this.checkDefaultFilters(this.selectedFilters);
      this.filterRecommendationTable();
      this.selectedSubProfileOriginalCount = {...this.selectedSubProfileCount};
      this.showFilterTable = false;
      this.isRecommendationsDataLoaded = true;
    });
  }

  /**
   * @description Filters recommendation data by applied product type, conformance level and status
   */
  private filterRecommendationTable() {
    this.recommendationsDataSource.data = [...this.previousRecommendationState.filter(item => {
      if ((!this.selectedFilters.productType.length || this.validateProductTypeFilter(item.productType)) &&
          (!this.selectedFilters.profile.length || this.selectedFilters.profile.includes(item.profile)) &&
          (!this.selectedFilters.subProfiles.length || this.selectedFilters.subProfiles.includes(item.subProfiles)) &&
          (!this.selectedFilters.conformanceLevel.length || this.selectedFilters.conformanceLevel.includes(item.conformanceLevel)) &&
          (!this.selectedFilters.status.length || this.selectedFilters.status.includes(item.status))) {
          return item;
      }
    })];
    this.isFiltersApplied = true;
  }

  /**
   * @description Check if product type available to filter
   * @param item
   */
  private validateProductTypeFilter(item) {
    let valid = false;
    if (item) {
      valid = item.find(productType => (this.selectedFilters.productType.includes(productType)));
    }
    return valid;
  }

  /**
   * @description Clear all applied filters
   */
  clearFilters(outsideAction?) {
    if (outsideAction) {
      this.isRecommendationsDataLoaded = false;
    }
    this.filterTableRows.forEach(item => {
      if (item.productType.selected !== undefined) {
        item.productType.selected = true;
      }
      if (item.profile.selected) {
        item.profile.selected = false;
      }
      if (item.subProfiles.selected) {
        item.subProfiles.selected = false;
      }
      if (item.conformanceLevel.selected) {
        item.conformanceLevel.selected = false;
      }
      if (item.status.selected) {
        item.status.selected = false;
      }
    });
    this.setTempSelectedFilters();
    this.updateProfileColumn();
  }

   /**
   * @description Checks if all the recommendations are selected
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.recommendationsDataSource.data.length;
    return numSelected === numRows;
  }
  
   /**
   * @description Toggles select/deselect all recommendations
   */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.recommendationsDataSource.data.forEach((row) => { this.selection.select(row); });
  }

  getImageSrc({ comment }: Recommendation) {
      const icon = comment ? 'Comment.png' : 'No+comment.png';
      return `assets/images/icons/comments/${icon}`;
  }

  onTableDataChange(data: Recommendation): void {
    this.removeExistingEntryFromList(data.position);
    this.updateRecommendations(data);
    this.isSaveBtnEnabled = true;
}

/**
 * @description To update the status of selected recommendations
 */
updateBulkStatus() {
  for (const row of this.selection.selected) {
    row.status = this.selectedStatusForBulkUpdate;
  }
  this.selectedStatusForBulkUpdate = '';
  this.createUpdatedRecommendationsData();
  this.selection.clear();
  this.isSaveBtnEnabled = true;
  this.toastService.show('Status updated', 'Status applied for selected recommendations.', 'success');
  }

  /**
   * @description To create array with updated recommendations to save
   */
  private createUpdatedRecommendationsData() {
    for (const row of this.selection.selected) {
      this.removeExistingEntryFromList(row.position);
        this.updateRecommendations(row);
    }
  }

  private updateRecommendations(row: Recommendation): void {
    this.recommendationsToUpdate.recommendations.push(row);
  }

  /**
   * @description To removes\ existing recommendation/s from list when reupdated
   * @param position is the unique number for recommendation
   */
  private removeExistingEntryFromList(position: number): void {
    const { recommendations } = this.recommendationsToUpdate;
    this.recommendationsToUpdate.recommendations = recommendations.filter(e => e.position !== position);
  }

  /**
   * @description To save updated recommendations
   */
  saveRecommendations(): void {
    this.isSaveBtnEnabled = false;
    this.isCloseBtnEnabled = false;
    this.spinnerService.show();
    const recommendations = this.mapRecommendationsLogic();
    this.updateSubscription = this.serviceabilityService.updateRecommendation(this.serviceabilityId, recommendations).subscribe((res) => {
      const { success } = res;
      if (success) {
        this.updatedRecommendations = res;
        this.recommendationsToUpdate.recommendations = [];
        this.toastService.show('Success', 'Recommendations are saved successfully', 'success');
        this.isSaveBtnEnabled = false;
        this.isCloseBtnEnabled = true;
        this.spinnerService.hide();
      }
    }, () => {
      this.toastService.show('Error', 'Error in saving the recommendations', 'danger');
      this.isSaveBtnEnabled = true;
      this.isCloseBtnEnabled = true;
      this.spinnerService.hide();
    });
  }

  private mapRecommendationsLogic(): { recommendations: Recommendation[], recommendationStatus: string, 'workflow.next': string } {
    let isStatusOtherThanNoSelection = false;
    const recommendationFrequencyCounter = {};
    this.previousRecommendationState.forEach((recommendation: Recommendation) => {
      const { comment, status, uniqueIdentifier } = recommendation;
      if (comment !== '' || status !== defaultStatus) {
          recommendationFrequencyCounter[uniqueIdentifier] = recommendation;
          isStatusOtherThanNoSelection = true;
      }
    });
    
    const updatedRec = this.recommendationsToUpdate.recommendations && JSON.parse(JSON.stringify(this.recommendationsToUpdate.recommendations));

    const newRecommendations: Recommendation[] = updatedRec.filter((recommendation: Recommendation) => {
      const existingRecommendation = recommendationFrequencyCounter[recommendation.uniqueIdentifier];
      if (existingRecommendation) {
          delete recommendationFrequencyCounter[recommendation.uniqueIdentifier];
          isStatusOtherThanNoSelection = false;
      }
      if (recommendation.status !== defaultStatus) { isStatusOtherThanNoSelection = true; }

      return recommendation.status !== defaultStatus || recommendation.comment !== '';
  });

    const retainedRecommendations = recommendationFrequencyCounter && JSON.parse(JSON.stringify(recommendationFrequencyCounter));
    const oldRecommendations: Recommendation[] = Object.values(retainedRecommendations);

    let mergedRecommendations: Recommendation[] = [...oldRecommendations, ...newRecommendations];
  
    const nextWorkflow = isStatusOtherThanNoSelection ? 'implement' : 'plan';
    return { recommendations: mergedRecommendations, recommendationStatus: 'saved', 'workflow.next': nextWorkflow };
  }

  /**
   * @description It toggles filter dialog
   */
  toggleFilterDialog() {
    this.showFilterTable = !this.showFilterTable;
    this.filterTableRows = JSON.parse(JSON.stringify([...this.filterTableRowsOriginalState]));
    if (this.showFilterTable) {
      this.setTempSelectedFilters(true);
    } else {
      this.filtersChanged = false;
    }
    this.onProfileChanged();
  }

  closeModal() {
    let response = {};
    getNestedKeyValue(this.updatedRecommendations, 'success')
      ? response = this.updatedRecommendations : response = { data: null, success: false };

    if (this.recommendationsToUpdate.recommendations.length) {
      const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: { header: 'Warning!', confirmationText: 'All your unsaved changes will be lost. Do you want to proceed?' },
        width: '35vw',
        height: 'auto',
        disableClose: true
      });
      confirmationDialogRef.componentInstance.onConfirmAction.subscribe(async () => {
        confirmationDialogRef.close();
        this.dialogRef.close(response);
      });
    } else { this.dialogRef.close(response); }
  }

  /**
   * @description Release resources
   */
  ngOnDestroy() {
    if (this.recommendationSubscription) { this.recommendationSubscription.unsubscribe(); }
    if (this.tooltipSubscription) { this.tooltipSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
  }
}
