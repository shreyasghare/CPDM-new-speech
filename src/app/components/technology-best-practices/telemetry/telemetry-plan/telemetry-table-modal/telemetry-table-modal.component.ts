import { Component, OnInit, OnDestroy, ViewChild, Inject, ElementRef, HostListener } from "@angular/core";
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { MatSort } from '@angular/material/sort';
import { Subscription, interval } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Services
 */
import { TelemetryService } from '@cpdm-service/technology-best-practices/telemetry/telemetry.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Recommendation } from '@cpdm-model/technology-best-practices/telemetry/telemetryRecommendation.model';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { HeaderModel, RowsModel, TelemetryPlanFilterTableModel } from '@cpdm-model/technology-best-practices/telemetry/telemetryPlanFilterTable.model';
import { TelemetryFilterCriteriaModel } from '@cpdm-model/technology-best-practices/telemetry/telemetryFilterCriteria.model';
import { UpdateResponseTelemetryRecommendationModel } from '@cpdm-model/technology-best-practices/telemetry/updateResponseTelemetryRecommendation.model';
import { environment } from 'src/environments/environment';

const animationOptions = [
  trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])
];
@Component({
  selector: 'app-table-modal',
  templateUrl: './telemetry-table-modal.component.html',
  styleUrls: ['./telemetry-table-modal.component.scss', '../../../../../../sass/components/_techBestPractices.scss'],
  animations: animationOptions,
})
export class TelemetryTableModalComponent implements OnInit, OnDestroy {
  showFilter: boolean;
  telemetryId: string;
  isReadOnly: boolean;
  hideAppliedFilterRow: boolean;
  tooltipSubscription: Subscription;
  recommendationSubscription: Subscription;
  filterTableDataSubscription: Subscription;
  telemetryDataSubscription: Subscription;
  resForInfoIcon: any;
  dataSource = new MatTableDataSource<Recommendation>();
  selection = new SelectionModel<Recommendation>(true, []);
  isTelemetryRecommendationDataLoaded: boolean;
  isTelemetryRecommendationSuccessRes: boolean;
  statusArray: [string];
  selectedRecommendations = <Recommendation[]>[];
  statusUpdateValue: string;
  showSaveBtn: boolean = false;
  filterDataLoaded: Promise<boolean>;
  recommendationCount: number = 0;
  filterHeader = <HeaderModel>{};
  filterRows = <RowsModel>{};
  updateResponse: { success: boolean; data: UpdateResponseTelemetryRecommendationModel; };
  filtersState = <{ old: TelemetryPlanFilterTableModel, new: TelemetryPlanFilterTableModel }>{};
  filtersArray: TelemetryFilterCriteriaModel = {
    filters: {
      tag: [],
      priority: [],
      embeddedApps: [],
      onOffPrem: [],
      businessOperational: [],
      status: []
    }
  }
  displayedColumns: string[] = [
    'select',
    'position',
    'tag',
    'recommendation',
    'priority',
    'embeddedApps',
    'onPremOffPrem',
    'businessOperational',
    'status',
    'comments'
  ];

  ballonData: object = {
    tag: [],
    status: []
  };
  autoSave: Subscription;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filterTableBtn', { static: true }) filterTableBtn: ElementRef;
  @ViewChild('filterTableDiv', { static: true }) filterTableDiv: ElementRef;

  // Hide filters dropdown if opened. By clicking anywhere expect filter table div
  @HostListener('document:click', ['$event']) toggleActive(event: Event) {
    // if (!this.isReadOnly) {
      const clickedOutside = !this.filterTableBtn.nativeElement.contains(event.target);
      const clickedOutsideOfTable = !this.filterTableDiv.nativeElement.contains(event.target);
      if (clickedOutside && clickedOutsideOfTable) {
        if (this.showFilter) {
          this.showFilter = false;
          this.filterStateSync();
        }
      }
    // }
  }

  constructor(private dataService: ProjectsDataService,
    private telemetryService: TelemetryService,
    public dialogRef: MatDialogRef<TelemetryTableModalComponent>,
    public dialog: MatDialog,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: { version: string, telemetryId: string, isReadOnly: boolean },
    private router: Router) { }

  ngOnInit() {
    this.showFilter = false;
    this.telemetryId = this.data.telemetryId;
    this.isReadOnly = this.data.isReadOnly;
    this.hideAppliedFilterRow = true

    this.tooltipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });

    this.getRecommendationFilters();

    const autoSaveInterval = interval(environment.autoSaveTimeInterval);
    if(!this.isReadOnly){
      this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
    }
  }
  
  // Prepare sliced data to be shown on ballon for unique identifier and status
  createBallonData() {
    const keyTag = 'tag';
    const ketStatus = 'status';
    this.ballonData[keyTag] = [];
    this.ballonData[ketStatus] = [];
    this.filtersArray.filters[keyTag].slice(3).forEach((tagRow) => this.ballonData[keyTag].push(tagRow['recommendations.tag']));
    this.ballonData[keyTag] = this.ballonData[keyTag].join(', ');
    this.filtersArray.filters[ketStatus].slice(2).forEach((statusRow) =>
    this.ballonData[ketStatus].push(statusRow['recommendations.status']));
    this.ballonData[ketStatus] = this.ballonData[ketStatus].join(', ');
  }

  // Populate filter table data.
  private getRecommendationFilters(): void {
    this.filterTableDataSubscription = this.telemetryService.getTelemetryPlanFilterTableData(this.telemetryId).subscribe((data) => {
      const { success, data: filterTableData } = data;
      if (success) {
        this.filterHeader = filterTableData.header;
        this.filterRows = filterTableData.rows;
        // To restrict loading of filter table ui before we get the data from api as calling api is an async operation. 
        this.filterDataLoaded = Promise.resolve(true);

        // First we are fetching filters from database. Then on response first creating filter array then fetching telemetry recommendation.
        // Then filtering the data based on created filter array.
        this.createFilterArray();
        this.getTelemetryRecommendationData();
      }
    });
  }
  // Method to check and uncheck particular column in filter table
  checkUncheckFilterColumn(event: any, filterKey: string): void {
    this.filterRows[filterKey].forEach((columnContent) => columnContent.selected = event.checked);
  }
  // Method to handle check-uncheck functionality of specific filter
  checkUncheckSpecificFilter(event: any, filterKey: string) {
    const uniqueIdentifiersSelectedCount = this.filterRows['uniqueIdentifiers'].filter((elem) => {
      return elem.selected === true;
    }).length;
    const prioritySelectedCount = this.filterRows['priority'].filter((elem) => {
      return elem.selected === true;
    }).length;
    const embeddedAppsSelectedCount = this.filterRows['embeddedApps'].filter((elem) => {
      return elem.selected === true;
    }).length;
    const onOffPremSelectedCount = this.filterRows['onOffPrem'].filter((elem) => {
      return elem.selected === true;
    }).length;
    const businessOperationalSelectedCount = this.filterRows['businessOperational'].filter((elem) => {
      return elem.selected === true;
    }).length;
    const statusSelectedCount = this.filterRows['status'].filter((elem) => {
      return elem.selected === true;
    }).length;

    switch (filterKey) {
      case 'recommendations.tag': {
        if (event.checked && uniqueIdentifiersSelectedCount === this.filterRows['uniqueIdentifiers'].length) {
          this.filterHeader['uniqueIdentifiers'].selected = true;
        } else if (!event.checked) { this.filterHeader['uniqueIdentifiers'].selected = false; }
        break;
      }
      case 'recommendations.priority': {
        if (event.checked && prioritySelectedCount === this.filterRows['priority'].length) {
          this.filterHeader['priority'].selected = true;
        } else if (!event.checked) { this.filterHeader['priority'].selected = false; }
        break;
      }
      case 'recommendations.embeddedApps': {
        if (event.checked && embeddedAppsSelectedCount === this.filterRows['embeddedApps'].length) {
          this.filterHeader['embeddedApps'].selected = true;
        } else if (!event.checked) { this.filterHeader['embeddedApps'].selected = false; }
        break;
      }
      case 'recommendations.onOffPrem': {
        if (event.checked && onOffPremSelectedCount === this.filterRows['onOffPrem'].length) {
          this.filterHeader['onOffPrem'].selected = true;
        } else if (!event.checked) { this.filterHeader['onOffPrem'].selected = false; }
        break;
      }
      case 'recommendations.businessOperational': {
        if (event.checked && businessOperationalSelectedCount === this.filterRows['businessOperational'].length) {
          this.filterHeader['businessOperational'].selected = true;
        } else if (!event.checked) { this.filterHeader['businessOperational'].selected = false; }
        break;
      }
      case 'recommendations.status': {
        if (event.checked && statusSelectedCount === this.filterRows['status'].length) {
          this.filterHeader['status'].selected = true;
        } else if (!event.checked) { this.filterHeader['status'].selected = false; }
        break;
      }
    }
  }
  // Method to get tooltip data
  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon != null && this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() == iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      let description: string;
      if (desc && desc.length > 0) {
        description = desc.join('\n');
      }
      return description;
    }
  }
  // Populate telemetry recommendation table
  getTelemetryRecommendationData() {
    this.dataSource.data = [];
    this.recommendationSubscription = this.telemetryService.getTelemetryRecommendationData(this.telemetryId).subscribe((data) => {
      const { success, data: telemetryRecommendationData } = data;
      if (success) {
        // telemetryRecommendationData.recommendations.forEach(recommendation => {
        //   this.dataSource.data.push(recommendation);
        // });
        this.dataSource = new MatTableDataSource<Recommendation>
        (this.syncNotSavedRecommendations(telemetryRecommendationData.recommendations));
        // Filter telemetry data based on previously created filter array.
        this.filterTelemetryRecommendation(this.filtersArray);
        this.recommendationCount = this.dataSource.data.length;
        this.dataSource.sort = this.sort;
        this.statusArray = telemetryRecommendationData.status;
        this.createBallonData();
      } else {
        this.isTelemetryRecommendationDataLoaded = true;
        this.isTelemetryRecommendationSuccessRes = false;
      }
    }, (error) => {
      this.router.navigate([`/**`]);
    });
  }
  /**
   * 
   */
  private syncNotSavedRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const mergedRecommendations = [];
    for (const recommendation of recommendations) {
      const { uniqueIdentifier } = recommendation;
      const savedRecommendation = this.selectedRecommendations.find(item => item.uniqueIdentifier === uniqueIdentifier);
      mergedRecommendations.push(savedRecommendation ? savedRecommendation : recommendation);
    }
    return mergedRecommendations;
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Recommendation): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row['position'] + 1
      }`;
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => {
        this.selection.select(row)
      });
  }
  // Method to close the modal pane
  closeModal() {
    let response = {};
    if (this.updateResponse) {
      response = this.updateResponse;
    } else {
      response = { success: false, data: null };
    }

    if (!this.showSaveBtn) return this.dialogRef.close(response);
    const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
      {
        data: { header: 'Warning!', confirmationText: 'All your unsaved changes will be lost. Do you want to proceed?' },
        width: '35vw', height: 'auto', disableClose: true
      });

    confirmationDialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      confirmationDialogRef.close();
      this.dialogRef.close(response);
    });
  }
  ngOnDestroy(): void {
    if (this.tooltipSubscription)
      this.tooltipSubscription.unsubscribe();

    if (this.recommendationSubscription)
      this.recommendationSubscription.unsubscribe();

    if (this.filterTableDataSubscription)
      this.filterTableDataSubscription.unsubscribe();

    if (this.telemetryDataSubscription) { this.telemetryDataSubscription.unsubscribe(); }
    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
  }
  /**
   * Bulk update status
   */
  bulkStatusUpdate() {
    this.selection.selected.forEach((row) => {
      row.status = this.statusUpdateValue;
    });
    this.statusUpdateValue = '';
    this.selection.clear();
    this.showSaveBtn = true;
    this.toast.show('Filters Applied', 'Filters applied successfully for selected telemetry(s).', 'info');
  }

  // Method to toggle filter pane//
  toggleFilter() {
    this.filtersState[this.showFilter ? 'new' : 'old'] = {
      header: JSON.parse(JSON.stringify(this.filterHeader)),
      rows: JSON.parse(JSON.stringify(this.filterRows))
    }
    this.showFilter = !this.showFilter;
    this.filterStateSync();
  }

  private filterStateSync(): void {
    if (!this.showFilter) {
      const { old } = this.filtersState
      if (old) {
        const { header, rows } = old;
        this.filterHeader = { ...header };
        this.filterRows = { ...rows };
      }
    }
  }
  // Method to clear all filters
  clearAllFilter() {
    Object.entries(this.filterHeader).forEach((header) => header[1]['selected'] = false);
    Object.entries(this.filterRows).forEach((columnContent) => {
      columnContent.map((rowContent) => {
        if (Array.isArray(rowContent)) {
          rowContent.map((row) => row.selected = false);
        }
      });
    });
  }
  clearAllAppliedFilters() {
    const keyTag = 'tag';
    const ketStatus = 'status';
    this.ballonData[keyTag] = [];
    this.ballonData[ketStatus] = [];
    this.clearAllFilter();
    this.applyFilter();
  }
  // Method to apply filter
  async applyFilter() {
    this.recommendationCount = 0;
    this.showFilter = false;
    this.createFilterArray();
    this.saveLastState();
    this.getTelemetryRecommendationData();

    await this.telemetryService.updateTelemetryObject(this.telemetryId, { 'savedFilters': this.filtersArray.filters }).toPromise();
  }

  /**
   * Save last state
   */
  saveLastState() {
    this.selectedRecommendations = [];
    for (const row of this.dataSource.data) {
      const { comment = null, status = null, uniqueIdentifier } = row;
      if (comment !== null || status !== 'No Selection') {
        this.selectedRecommendations.push(row);
      }
    }
  }

  // Filter telemetry data based on filters applied.
  filterTelemetryRecommendation(filtersArray: TelemetryFilterCriteriaModel) {
    this.dataSource.data = this.dataSource.data.filter((row, index) => {
      // Unique Identifier
      let tagFlag = false;
      if ((filtersArray.filters.tag.length > 0 &&
        filtersArray.filters.tag.some((singleTag) => singleTag['recommendations.tag'] === row.tag))
        || filtersArray.filters.tag.length === 0) { tagFlag = true; }

      // Priority
      let priorityFlag = false;
      if ((filtersArray.filters.priority.length > 0 &&
        filtersArray.filters.priority.some((singlePriority) => singlePriority['recommendations.priority'] === row.priority))
        || filtersArray.filters.priority.length === 0) { priorityFlag = true; }

      // Embedded / Apps
      let embeddedAppsFlag = false;
      let embeddedAppsData = row.embeddedApps.split(',');
      embeddedAppsData = embeddedAppsData.map(val => val.trim());
      if ((filtersArray.filters.embeddedApps.length > 0 &&
        filtersArray.filters.embeddedApps.some((singleEmbeddedApps) => {
          if (embeddedAppsData.includes(singleEmbeddedApps['recommendations.embeddedApps'])) { return true; } else { return false; }
        })) || filtersArray.filters.embeddedApps.length === 0) { embeddedAppsFlag = true; }

      // On Prem / Off Prem
      let onOffPremFlag = false;
      let onOffPremData = row.onOffPrem.split(',');
      onOffPremData = onOffPremData.map(val => val.trim());
      if ((filtersArray.filters.onOffPrem.length > 0 &&
        filtersArray.filters.onOffPrem.some((singleOnOffPrem) => {
          if (onOffPremData.includes(singleOnOffPrem['recommendations.onOffPrem'])) { return true; } else { return false; }
        })) || filtersArray.filters.onOffPrem.length === 0) { onOffPremFlag = true; }

      // Business / Operational
      let businessOperationalFlag = false;
      let businessOperationalData = row.businessOperational.split(',');
      businessOperationalData = businessOperationalData.map(val => val.trim());
      if ((filtersArray.filters.businessOperational.length > 0 &&
        filtersArray.filters.businessOperational.some((singleBusinessOperational) => {
          if (businessOperationalData.includes(singleBusinessOperational['recommendations.businessOperational']))
          { return true; } else { return false; }
        })) || filtersArray.filters.businessOperational.length === 0) { businessOperationalFlag = true; }

      // status
      let statusFlag = false;
      if ((filtersArray.filters.status.length > 0 &&
        filtersArray.filters.status.some((singleStatus) =>
        singleStatus['recommendations.status'] === row.status))
        || filtersArray.filters.status.length === 0) { statusFlag = true; }

      if (tagFlag && priorityFlag && embeddedAppsFlag && onOffPremFlag && businessOperationalFlag && statusFlag) {
        // record will be shown in ui.
        return true;
      } else { return false; }
    });
    if (this.dataSource.data.length > 0) {
      this.isTelemetryRecommendationDataLoaded = true;
      this.isTelemetryRecommendationSuccessRes = true;
    } else {
      this.isTelemetryRecommendationDataLoaded = true;
      this.isTelemetryRecommendationSuccessRes = false;
    }
  }

  private statusAndCommentState(callback): void {
    this.telemetryDataSubscription = this.telemetryService.getTelemetryData(this.telemetryId).subscribe(res => {
      const { success, data: telemeteryDBResponse } = res;
      if (success) {
        if (telemeteryDBResponse.recommendations.length > 0) { // In case save state is changed to 'save'
          this.selectedRecommendations = [];
          for (const row of this.dataSource.data) {
            const found = telemeteryDBResponse.recommendations.find((dbResponseRow) => {
              return row.uniqueIdentifier === dbResponseRow.uniqueIdentifier;
            });
            if (found) { // Found the already changed row.
              this.selectedRecommendations.push(row);
              continue;
            }
            // Means this row is first time going to save so checking whether status is NOT 'No Selection' and comment NOT null.
            if (row.comment !== undefined || row.status !== 'No Selection') {
              this.selectedRecommendations.push(row);
            }
          }
        } else { // In case the save state of recommendation is 'notSaved'
          this.selectedRecommendations = [];
          for (const row of this.dataSource.data) {
            const { comment = null, status = null, uniqueIdentifier } = row;
            if (comment !== null || status !== 'No Selection') {
              this.selectedRecommendations.push(row);
            }
          }
        }
        callback();
      } else {
        this.router.navigate([`/**`]);
      }
    }, error => {
      this.router.navigate([`/**`]);
    });
  }
  // Creating filter array
  createFilterArray(empty: boolean = false) {
    this.filtersArray = {
      filters: {
        tag: [],
        priority: [],
        embeddedApps: [],
        onOffPrem: [],
        businessOperational: [],
        status: []
      }
    };

    if (!empty) {
      this.hideAppliedFilterRow = true;
      this.filterRows['uniqueIdentifiers'].forEach((tagRow) => {
        if (tagRow.selected) {
          this.filtersArray['filters'].tag.push({ 'recommendations.tag': tagRow.value });
          this.hideAppliedFilterRow = false;
        }
      });

      this.filterRows['priority'].forEach((priorityRow) => {
        if (priorityRow.selected) {
          this.filtersArray['filters'].priority.push({ 'recommendations.priority': priorityRow.value });
          this.hideAppliedFilterRow = false;
        }
      });

      this.filterRows['embeddedApps'].forEach((embeddedAppsRow) => {
        if (embeddedAppsRow.selected) {
          this.filtersArray['filters'].embeddedApps.push({ 'recommendations.embeddedApps': embeddedAppsRow.value });
          this.hideAppliedFilterRow = false;
        }
      });

      this.filterRows['onOffPrem'].forEach((onOffPremRow) => {
        if (onOffPremRow.selected) {
          this.filtersArray['filters'].onOffPrem.push({ 'recommendations.onOffPrem': onOffPremRow.value });
          this.hideAppliedFilterRow = false;
        }
      });

      this.filterRows['businessOperational'].forEach((businessOperationalRow) => {
        if (businessOperationalRow.selected) {
          this.filtersArray['filters'].businessOperational.push({ 'recommendations.businessOperational': businessOperationalRow.value });
          this.hideAppliedFilterRow = false;
        }
      });

      this.filterRows['status'].forEach((statusRow) => {
        if (statusRow.selected) {
          this.filtersArray['filters'].status.push({ 'recommendations.status': statusRow.value });
          this.hideAppliedFilterRow = false;
        }
      });
    }
  }

  // Callback
  saveTelemetry = () => {
    const updatedTelemetryRecommendation = { recommendations: this.selectedRecommendations };
    this.telemetryService.updateTelemetryRecommendation(this.telemetryId, updatedTelemetryRecommendation).subscribe((updateResponse) => {
      this.updateResponse = updateResponse;
      this.showSaveBtn = false;
      this.isTelemetryRecommendationDataLoaded = true;
      this.toast.show('Success', 'Recommendations are saved successfully', 'success');
    });
  }
  // Save telemetry
  saveTelemetryRecommendation() {
    this.isTelemetryRecommendationDataLoaded = false;
    this.statusAndCommentState(this.saveTelemetry);
  }
  /**
   * 
   * @param data
   */
  onChangeTableData(data: string) {
    this.showSaveBtn = true;
  }
  getImageSrc({ comment }: Recommendation) {
    const icon = comment !== undefined && comment !== '' ? 'Comment.png' : 'No+comment.png';
    return `assets/images/icons/comments/${icon}`;
  }

  autoSaveOnTimeInterval() {
    if (this.showSaveBtn) { //flag based on save button
      this.statusAndCommentState(
        () => {
          this.telemetryService.updateTelemetryRecommendation(this.telemetryId, { recommendations: this.selectedRecommendations })
            .subscribe(res => {
              this.updateResponse = res;
              this.toast.show('Success', 'Recommendations are successfully auto saved', 'success');
            }, err => {
              this.toast.show('Failed', 'Recommendations auto save failed', 'danger');
            })
        }
      );
    } else {
      console.log('form invalid, Cannot autoSave form ');
    }
  }

}
