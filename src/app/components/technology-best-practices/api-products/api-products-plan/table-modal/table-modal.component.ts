import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener, Inject } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatTableDataSource } from '@angular/material/table';
import { Recommendation } from '@cpdm-model/technology-best-practices/api-products/apiProductsRecommendation.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { HeaderModel, RowsModel, ApiProductsPlanFilterTableModel } from '@cpdm-model/technology-best-practices/api-products/apiProductsPlanFilterTable.model';
import { FilterCriteriaModel } from '@cpdm-model/technology-best-practices/api-products/filterCriteria.model';
import { UpdatedApiProductsRecommendationModel } from '@cpdm-model/technology-best-practices/api-products/updatedApiProductsRecommendation.model';
import { Subscription, interval } from 'rxjs';
import { UpdateResApiProductsRecommendationModel } from '@cpdm-model/technology-best-practices/api-products/updateResApiProductsRecommendation.model';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ApiProductsService } from '@cpdm-service/technology-best-practices/api-products/api-products.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { IresForInfoIconModel } from '@cpdm-model/iResForInfoIcon.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from 'src/environments/environment';

const initialLimit = 10;
const animationOptions = [
  trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])
];

@Component({
  selector: 'app-table-modal',
  templateUrl: './table-modal.component.html',
  styleUrls: ['./table-modal.component.scss', '../../../../../../sass/components/_techBestPractices.scss'],
  animations: animationOptions,
})
export class TableModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport, { static: true }) viewport: CdkVirtualScrollViewport;

  showFilter = false;
  content: "string";
  title: "string";

  isReadOnly: boolean = false;

  displayedColumns: string[] = [
    "select",
    "position",
    "tag",
    "recommendation",
    "priority",
    "status",
    "comments",
  ];

  dataSource = new MatTableDataSource<Recommendation>();
  selection = new SelectionModel<Recommendation>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('filterTableBtn', { static: true }) filterTableBtn: ElementRef;
  @ViewChild('filterTableDiv', { static: true }) filterTableDiv: ElementRef;

  filterHeader = <HeaderModel>{};
  filterRows = <RowsModel>{};
  statusArray: [string];
  filtersArray: FilterCriteriaModel = {
    filters: {
      tag: [],
      priority: [],
      status: []
    }
  }
  filterDataLoaded: Promise<boolean>
  isApiProductsRecommendationDataLoaded: boolean = false
  isApiProductsRecommendationSuccessRes: boolean = true
  apiProductsId: string;
  resForInfoIcon: IresForInfoIconModel[];
  updatedApiProductsRecommendation: UpdatedApiProductsRecommendationModel
  selectedRecommendations = <Recommendation[]>[];
  statusUpdateValue: string
  filtersState = <{ old: ApiProductsPlanFilterTableModel, new: ApiProductsPlanFilterTableModel }>{};
  recommendationCount: number = null;

  ballonData: Object = {
    tag: [],
    status: []
  }

  virtualScroll = {
    skip: 0,
    limit: initialLimit
  };

  showSaveBtn: boolean = false;
  tooltipSubscription: Subscription;
  filterTableDataSubscription: Subscription;
  recommnedationSubscription: Subscription;
  updatedResponse: { success: boolean; data: UpdateResApiProductsRecommendationModel; };
  hideAppliedFilterRow: boolean
  firstBatchLoded: boolean = false;
  autoSave : Subscription;
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

  constructor(
    private dataService: ProjectsDataService,
    private apiProductsService: ApiProductsService,
    public dialogRef: MatDialogRef<TableModalComponent>,
    public dialog: MatDialog,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: { version: string, apiProductsId: string, isReadOnly: boolean }
  ) { }

  ngOnInit() {
    this.showFilter = false;
    this.apiProductsId = this.data.apiProductsId;
    this.isReadOnly = this.data.isReadOnly;
    this.hideAppliedFilterRow = true

    this.tooltipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });

    this.getApiProductsRecommendationData();
    this.getRecommendationFilters();

    const autoSaveInterval = interval(environment.autoSaveTimeInterval);
    if(!this.isReadOnly){
      this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
    }
  }

  // Populate filter table data.
  private getRecommendationFilters(): void {
    this.filterTableDataSubscription = this.apiProductsService.getApiProductsPlanFilterTableData(this.apiProductsId).subscribe((data) => {
      const { success, data: filterTableData } = data;
      if (success) {
        this.filterHeader = filterTableData.header;
        this.filterRows = filterTableData.rows;
        // To restrict loading of filter table UI before we get the data from api as calling api is an async operation. 
        this.filterDataLoaded = Promise.resolve(true);
        this.createFilterArray();
      }
    });
  }

  private lazyLoadAllRemainingTableData(): void {
    this.virtualScroll.skip = initialLimit;
    if (this.recommendationCount >= this.virtualScroll.skip) {
      this.virtualScroll.limit = this.recommendationCount - this.virtualScroll.skip;

      // const downloadingToast = this.toast.showProgressBar('Fetching Table Data', 'Please wait...', { showAnimation: false });
      this.apiProductsService.getApiProductsRecommendationDataAndShowProgress(this.apiProductsId, this.filtersArray, this.virtualScroll).subscribe(res => {

        const events = res as { loaded: number, total: number };
        // this.toast.updateProgressBar(downloadingToast, Math.floor(events.loaded / events.total * 100), 'Success', 'Table Data Fetched.');

        // Put here to totally remove loader
        // this.isApiProductsRecommendationDataLoaded = true;
        // this.isApiProductsRecommendationSuccessRes = true;
        if (res.body) {
          const { success, data: apiProductsRecommendationData, } = res.body;
          if (success) {
            apiProductsRecommendationData.recommendations.forEach(recommendation => {
              this.dataSource.data.push(recommendation);
            });
            this.dataSource.sort = this.sort;
            this.isApiProductsRecommendationDataLoaded = true;
            this.isApiProductsRecommendationSuccessRes = true;
          }
        }
      })
    }
  }

  ngAfterViewInit() {

  }

  // Populate api-products recommendation table
  getApiProductsRecommendationData(fromVirtualScroll = false, filterCriteria: FilterCriteriaModel = null, virtualScrollObj = this.virtualScroll) {
    if (!fromVirtualScroll) {
      this.dataSource = new MatTableDataSource<Recommendation>();
    }
    this.recommnedationSubscription = this.apiProductsService.getApiProductsRecommendationData(this.apiProductsId, filterCriteria, virtualScrollObj).subscribe((data) => {
      const { success, data: apiProductsRecommendationData } = data;
      if (success) {
        if (virtualScrollObj.skip < apiProductsRecommendationData.recommendationCount) {
          if (fromVirtualScroll) {
            apiProductsRecommendationData.recommendations.forEach(recommendation => {
              this.dataSource.data.push(recommendation);
            });
          } else {
            this.dataSource = new MatTableDataSource<Recommendation>(this.syncNotSavedRecommendations(apiProductsRecommendationData.recommendations));
            this.isApiProductsRecommendationDataLoaded = true;
            this.isApiProductsRecommendationSuccessRes = true;
          }
          this.recommendationCount = apiProductsRecommendationData.recommendationCount;

          if (!this.firstBatchLoded) {
            this.lazyLoadAllRemainingTableData();
          }

          this.dataSource.sort = this.sort;
          this.statusArray = apiProductsRecommendationData.status;

          if (!this.firstBatchLoded) this.firstBatchLoded = true
        }
        this.createBallonData()
      } else {
        this.isApiProductsRecommendationDataLoaded = true
        this.isApiProductsRecommendationSuccessRes = false
      }
    })
  }

  private syncNotSavedRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const mergedRecommendations = [];
    for (const recommendation of recommendations) {
      const { uniqueIdentifier } = recommendation;
      const savedRecommendation = this.selectedRecommendations.find(item => item.uniqueIdentifier === uniqueIdentifier);
      mergedRecommendations.push(savedRecommendation ? savedRecommendation : recommendation);
    }
    return mergedRecommendations;
  }

  ngOnDestroy() {
    if (this.tooltipSubscription)
      this.tooltipSubscription.unsubscribe();

    if (this.recommnedationSubscription)
      this.recommnedationSubscription.unsubscribe();

    if (this.filterTableDataSubscription)
      this.filterTableDataSubscription.unsubscribe();

    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
  }

  //Method to get tooltip data
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

  //Method to close the modal pane
  closeModal() {
    let response = {};
    if (this.updatedResponse) {
      response = this.updatedResponse;
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
    })
  }

  //Save api-products recommendation data
  saveApiProductsRecommendations() {
    this.statusAndCommentState();
    this.isApiProductsRecommendationDataLoaded = false;
    const updatedApiProductsRecommendations = {
      recommendations: this.selectedRecommendations
    }

    this.apiProductsService.updateRecommendation(this.apiProductsId, updatedApiProductsRecommendations).subscribe((updatedResponse) => {
      this.updatedResponse = updatedResponse;
      this.showSaveBtn = false;
      this.isApiProductsRecommendationDataLoaded = true;
      this.toast.show('Success', 'Recommendations are saved successfully', 'success');
    })
  }

  private statusAndCommentState(): void {
    for (const row of this.dataSource.data) {
      const { comment = null, status = null, uniqueIdentifier } = row;

      if (comment !== null || status !== null) {
        const index = this.selectedRecommendations.findIndex(x => x.uniqueIdentifier === uniqueIdentifier);

        if (index !== -1) {
          this.selectedRecommendations.splice(index, 1);
        }
        this.selectedRecommendations.push(row);
      }
    }
  }

  //Method to toggle filter pane
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
      const { old } = this.filtersState;
      if (old) {
        const { header, rows } = old;
        this.filterHeader = { ...header };
        this.filterRows = { ...rows };
      }
    }
  }

  //Method to apply filter 
  async applyFilter() {
    this.virtualScroll.skip = 0;
    this.virtualScroll.limit = initialLimit;
    this.recommendationCount = 0;
    this.firstBatchLoded = false;

    if (this.selectedRecommendations.length > 0)
      this.showSaveBtn = true;

    this.showFilter = false;

    this.createFilterArray();

    if (this.filtersArray.filters['tag'].length > 4
      || this.filtersArray.filters['status'].length > 4) this.createBallonData();

    // Call to web recommendation api to get filtered data
    this.isApiProductsRecommendationDataLoaded = false;
    this.statusAndCommentState();
    this.getApiProductsRecommendationData(false, this.filtersArray);

    await this.apiProductsService.updateApiProductsObject(this.apiProductsId, { 'savedFilters': this.filtersArray.filters }).toPromise();
  }

  // Prepare sliced data to be shown on ballon for unique identifier and status
  createBallonData() {
    this.ballonData['tag'] = []
    this.ballonData['status'] = []
    this.filtersArray.filters['tag'].slice(4).forEach((tagRow) => this.ballonData['tag'].push(tagRow['recommendations.tag']))
    this.filtersArray.filters['status'].slice(3).forEach((statusRow) => this.ballonData['status'].push(statusRow['recommendations.status']))
  }

  clearAllAppliedFilters() {
    this.ballonData['tag'] = []
    this.ballonData['status'] = []
    this.clearAllFilter();
    this.applyFilter();
  }

  createFilterArray(empty: boolean = false) {
    this.filtersArray = {
      filters: {
        tag: [],
        priority: [],
        status: []
      }
    }

    if (!empty) {
      this.hideAppliedFilterRow = true
      this.filterRows['uniqueIdentifiers'].forEach((tagRow) => {
        if (tagRow.selected) {
          this.filtersArray['filters'].tag.push({ 'recommendations.tag': tagRow.value })
          this.hideAppliedFilterRow = false
        }
      })

      this.filterRows['priority'].forEach((priorityRow) => {
        if (priorityRow.selected) {
          this.filtersArray['filters'].priority.push({ 'recommendations.priority': priorityRow.value })
          this.hideAppliedFilterRow = false
        }
      })

      this.filterRows['status'].forEach((statusRow) => {
        if (statusRow.selected) {
          this.filtersArray['filters'].status.push({ 'recommendations.status': statusRow.value })
          this.hideAppliedFilterRow = false
        }
      })
    }
  }

  // Method to clear all filters
  clearAllFilter() {
    this.virtualScroll.skip = 0;
    this.virtualScroll.limit = initialLimit;
    this.recommendationCount = 0;

    Object.entries(this.filterHeader).forEach((header) => header[1]['selected'] = false)
    Object.entries(this.filterRows).forEach((columnContent) => {
      columnContent.map((rowContent) => {
        if (Array.isArray(rowContent)) {
          rowContent.map((row) => row.selected = false)
        }
      })
    })
  }

  // Method to check and uncheck particular column in filter table
  checkUncheckFilterColumn(event: any, filterKey: string): void {
    this.filterRows[filterKey].forEach((columnContent) => columnContent.selected = event.checked)
  }

  // Method to handle check-uncheck functionality of specific filter
  checkUncheckSpecificFilter(event: any, filterKey: string) {
    let uniqueIdentifiersSelectedCount = this.filterRows['uniqueIdentifiers'].filter(function (elem) {
      return elem.selected == true;
    }).length

    let prioritySelectedCount = this.filterRows['priority'].filter(function (elem) {
      return elem.selected == true;
    }).length

    let statusSelectedCount = this.filterRows['status'].filter(function (elem) {
      return elem.selected == true;
    }).length

    switch (filterKey) {
      case 'recommendations.tag': {
        if (event.checked && uniqueIdentifiersSelectedCount == this.filterRows['uniqueIdentifiers'].length) {
          this.filterHeader['uniqueIdentifiers'].selected = true
        } else if (!event.checked) this.filterHeader['uniqueIdentifiers'].selected = false
        break
      }
      case 'recommendations.priority': {
        if (event.checked && prioritySelectedCount == this.filterRows['priority'].length) {
          this.filterHeader['priority'].selected = true
        } else if (!event.checked) this.filterHeader['priority'].selected = false
        break
      }
      case 'recommendations.status': {
        if (event.checked && statusSelectedCount == this.filterRows['status'].length) {
          this.filterHeader['status'].selected = true
        } else if (!event.checked) this.filterHeader['status'].selected = false
        break
      }
    }
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Recommendation): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row['position'] + 1
      }`;
  }

  /**
   * Bulk update status
   */
  bulkStatusUpdate() {
    this.selection.selected.forEach((row) => {
      row.status = this.statusUpdateValue
    })
    this.statusUpdateValue = ''
    this.selection.clear()
    this.showSaveBtn = true
    this.toast.show('Filters Applied', 'Filters applied successfully for selected API Products.', 'info')
  }

  /**
   * To fetch next batch of rows from database to be displayed on mat table.
   */
  private inDebounce: number;
  private scrollEvent: number = 0;
  getNextBatch(event: number): void {
    if (this.scrollEvent <= event) {
      clearTimeout(this.inDebounce)
      this.inDebounce = window.setTimeout(() => {
        if (event > 0) {
          this.virtualScroll.skip += this.virtualScroll.limit;
          if (this.recommendationCount > this.virtualScroll.skip) {
            this.getApiProductsRecommendationData(true, this.filtersArray);
          }
        }
      }, 500);
    }
    this.scrollEvent = event;
  }

  onChangeTableData(data: string) {
    // const recommendationsLength = this.selectedRecommendations.length;
    this.showSaveBtn = true;
  }

  getImageSrc({ comment }: Recommendation) {
    const icon = comment !== undefined && comment !== '' ? 'Comment.png' : 'No+comment.png';
    return `assets/images/icons/comments/${icon}`;
  }

  autoSaveOnTimeInterval() {
    if (this.showSaveBtn) {
      this.statusAndCommentState();
      this.apiProductsService.updateRecommendation(this.apiProductsId, { recommendations: this.selectedRecommendations})
        .subscribe( res => {
          this.updatedResponse = res;
          this.toast.show('Success', 'Recommendations are successfully auto saved', 'success');
      }, err =>{
        this.toast.show('Failed', 'Recommendations auto save failed', 'danger');
      } );
    } else {
      console.log('form invalid, Cannot autoSave form ');
    }
  }
}
