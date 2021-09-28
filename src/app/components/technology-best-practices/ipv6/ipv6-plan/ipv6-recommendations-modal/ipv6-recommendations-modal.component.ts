import { Component, OnInit, OnDestroy, Inject, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { IPv6Service } from '@cpdm-service/technology-best-practices/ipv6/ipv6.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { SelectionModel } from '@angular/cdk/collections';
import { IPv6Model, Recommendation, SavedFilters } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { environment } from 'src/environments/environment';

const animationOptions = [
    trigger('detailExpand', [
        state('collapsed, void', style({height: '0px', minHeight: '0', display: 'none'})),
        state('expanded', style({height: '*'})),
        transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
];

const defaultStatus = 'No Selection';

@Component({
    selector: 'app-ipv6-recommendations-modal',
    templateUrl: './ipv6-recommendations-modal.component.html',
    styleUrls: ['./ipv6-recommendations-modal.component.scss', '../../../../../../sass/components/_techBestPractices.scss'],
    animations: animationOptions,
})
export class Ipv6RecommendationsModalComponent implements OnInit, OnDestroy {
    @ViewChild('filterTableBtn', { static: true }) filterTableBtn: ElementRef;
    @ViewChild('filterTableDiv', { static: true }) filterTableDiv: ElementRef;
    @ViewChild('filterTableActionsDiv', { static: true }) filterTableActionsDiv: ElementRef;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    IPv6Id: string;
    IPv6Details: IPv6Model;
    version: string;
    tooltipSubscription: Subscription;
    filterTableDataSubscription: Subscription;
    IPv6RecommendationsSubscription: Subscription;
    filterTableHeader: ['Product Type', 'Priority', 'Status'];
    filterTableRows = [];
    previousFilterTableRowsState = [];
    recommendationsDataSource;
    previousRecommendationsState: Recommendation[];
    isRecommendationsLoaded = false;
    isFiltersApplied = false;
    filtersChanged = false;
    displayedColumns: string[] = [
        'select',
        'position',
        'uniqueIdentifier',
        'description',
        'productTypes',
        'priority',
        'status',
        'comments'
    ];
    selection = new SelectionModel<Recommendation>(true, []);
    selectedStatusForBulkUpdate: string;
    statusArray: string[];
    priority: { [key: string]: {name: 'High', value: number} | { name: 'Medium' , value: number} | {name: 'Low' , value: number} } = {};
    showFilterTable = false;
    savedFilters: SavedFilters = {
        productType: [],
        priority: [],
        status: []
    };
    selectedFilters = {
        productType: [],
        priority: [],
        status: []
    };
    tempSelectedFilters = {
        productType: [],
        priority: [],
        status: []
    };
    recommendationsToUpdate = {
        recommendations: <Recommendation[]>[]
    };
    updatedRecommendations: {
        data: {
            recommendationStatus: string;
            recommendations: Recommendation[]
        },
        success: boolean
    };
    enableSavebtn: boolean;
    resForInfoIcon = {
        IPv6_RecommendationType: '',
        IPv6_ProductTypes: '',
        IPv6_Priority: '',
        IPv6_Status: ''
    };
    tempSelectedFiltersCount = 0;
    isFiltersAvailable = false;
    isReadOnly = false;
    autoSave: Subscription;
    @HostListener('document:click', ['$event']) toggleActive(event: Event) {
        //if (!this.isReadOnly) {
            const clickedOutsideOfButton = !this.filterTableBtn.nativeElement.contains(event.target);
            const clickedOutsideOfTable = !this.filterTableDiv.nativeElement.contains(event.target);
            const clickedOutsideOfActionsDiv = !this.filterTableActionsDiv.nativeElement.contains(event.target);
            if (clickedOutsideOfButton && clickedOutsideOfTable && clickedOutsideOfActionsDiv) {
                if (this.showFilterTable) {
                    this.showFilterTable = false;
                    this.filtersChanged = false;
                }
            }
        //}
    }

    constructor(private dialogRef: MatDialogRef<Ipv6RecommendationsModalComponent>,
                private ipv6Service: IPv6Service,
                private toastService: ToastService,
                private dialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) private data: { version: string, IPv6Id: string, isReadOnly: boolean },
                private dataService: ProjectsDataService) { }

    ngOnInit() {
        this.IPv6Id = this.data.IPv6Id;
        this.isReadOnly = this.data.isReadOnly;
        this.getTooltipDescription();
        this.getIPv6DetailsSubject();
        this.getIPv6Recommendations();

        const autoSaveInterval = interval(environment.autoSaveTimeInterval);
        if(!this.isReadOnly){
            this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
        }
    }

    /**
     * @description Get descriptions for tooltip
     */
    private getTooltipDescription() {
        this.tooltipSubscription = this.dataService.getItemDesc('tooltip').subscribe(res => {
            res.forEach(element => {
                if (element.name === 'IPv6_RecommendationType' ||
                    element.name === 'IPv6_ProductTypes' ||
                    element.name === 'IPv6_Priority' ||
                    element.name === 'IPv6_Status') {
                        this.resForInfoIcon[element.name] =
                        element.name === 'IPv6_ProductTypes' ? element.description.join('\n\n') : element.description.join('\n');
                }
            });
        });
    }

    /**
     * @description Get IPv6 details from local storage
     */
    getIPv6DetailsSubject() {
        this.ipv6Service.getIPv6DetailsSubject.subscribe(res => {
            if (res != null) {
                this.IPv6Details = res;
                this.version = res.version.name;
            }
        });
    }

    /**
     * @description Get IPv6 recommendations
     */
    private getIPv6Recommendations() {
        this.IPv6RecommendationsSubscription = this.ipv6Service.getIPv6Recommendations(this.IPv6Id).subscribe(data => {
            const { success, data: IPv6recommendations } = data;
            if (success) {
                this.previousRecommendationsState = JSON.parse(JSON.stringify([...IPv6recommendations.recommendations]));
                this.recommendationsDataSource = new MatTableDataSource<Recommendation>([...IPv6recommendations.recommendations]);
                this.recommendationsDataSource.sortingDataAccessor = (item, property) => {
                    switch (property) {
                      case 'priority' : return this.priority[item.uniqueIdentifier].value;
                      default: return item[property];
                    }
                  };
                this.recommendationsDataSource.sort = this.sort;
                this.setPriorityColumnData(IPv6recommendations.recommendations);
                this.statusArray = IPv6recommendations.status;
                
                this.getRecommendationFilters();
                this.isRecommendationsLoaded = true;
            }
        }, () => {
            this.toastService.show('Error in data fetching', 'Error fetching the IPv6 recommendations', 'danger');
        });
    }

    /**
     * @description Get filters for IPv6
     */
    private getRecommendationFilters() {
        this.filterTableDataSubscription = this.ipv6Service.getIPv6FilterTableData(this.IPv6Id).subscribe((data) => {
            const { success, data: filterTableData } = data;
            if (success) {
                this.filterTableHeader = filterTableData.header;
                this.filterTableRows = filterTableData.rows;
                this.previousFilterTableRowsState = JSON.parse(JSON.stringify([...filterTableData.rows]));
                this.setSelectedFilters();
                this.setSavedFilters();
                this.filterRecommendationTable();
            }
        }, () => {
            this.toastService.show('Error in data fetching', 'Error fetching the IPv6 recommendation filters', 'danger');
        });
    }

    /**
     * @description Sets priority High/Medium based on product type priority
     * @param recommendations is a list of recommendations
     */
    private setPriorityColumnData(recommendations: Recommendation[]) {
        recommendations.forEach(recommendation => {
            const foundMandatory = recommendation.productTypes.find(type => {
                return (!this.selectedFilters.productType.length || this.selectedFilters.productType.includes(type.name)) &&
                type.priority === 'mandatory';
            });
            const foundOptional = recommendation.productTypes.find(type => {
                return (!this.selectedFilters.productType.length || this.selectedFilters.productType.includes(type.name)) &&
                type.priority === 'optional';
            });
            if (!foundMandatory && !foundOptional) {
                this.priority[recommendation.uniqueIdentifier] = {name: 'Low', value: 0};
            } else {
                this.priority[recommendation.uniqueIdentifier] = foundMandatory ? {name: 'High', value: 2} : {name: 'Medium', value: 1};
            }
        });
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
            this.recommendationsDataSource.data.forEach((row) => {
                this.selection.select(row);
            });
    }

    /**
     * @description Updates status to all the selected recommendations
     */
    updateBulkStatus() {
        this.selection.selected.forEach((row) => {
            row.status = this.selectedStatusForBulkUpdate;
        });
        this.selectedStatusForBulkUpdate = '';
        this.createUpdatedRecommendationsData();
        this.selection.clear();
        this.enableSavebtn = true;
        this.toastService.show('Status updated', 'Status applied for selected recommendations.', 'success');
    }

    /**
     * @description Creates array with updated recommendations to save
     */
    createUpdatedRecommendationsData() {
        this.selection.selected.forEach((row) => {
            this.removeExistingEntryFromList(row.position);
            this.updateRecommendationsToUpdate(row);
        });
    }

    private updateRecommendationsToUpdate(row: Recommendation): void {
        const { position, uniqueIdentifier, status, comment } = row;
        const recommendations = { uniqueIdentifier, position, status, comment };
        this.recommendationsToUpdate.recommendations.push(recommendations);
    }

    /**
     * @description Triggers on change of status change
     * @param data is a updated row from list of recommendations
     */
    onChangeTableData(data: Recommendation): void {
        this.removeExistingEntryFromList(data.position);
        this.updateRecommendationsToUpdate(data);
        this.enableSavebtn = true;
    }

    /**
     * @description Removes existing recommendation from list when reupdated
     * @param position is the unique number for recommendation
     */
    private removeExistingEntryFromList(position: number) {
        const { recommendations } = this.recommendationsToUpdate;
        this.recommendationsToUpdate.recommendations =
            recommendations.filter(e => e.position !== position);
    }

    /**
     * @description Saves updated recommendations
     */
    saveIPv6Recommendations() {
        const recommendations = this.mapRecommendationsLogic();
        this.ipv6Service.update(this.IPv6Id, recommendations).subscribe((res) => {
            this.updatedRecommendations = res;
            this.recommendationsToUpdate.recommendations = [];
            this.toastService.show('Success', 'Recommendations are saved successfully', 'success');
            this.enableSavebtn = false;
        });
    }

    private mapRecommendationsLogic(): { recommendations: Recommendation[], recommendationStatus: string, 'workflow.next': string } {
        let isStatusOtherThanNoSelection = false;
        const recommendationFrequencyCounter = {};
        const callbackFilter = (recommendation: Recommendation) => {
            const { comment, status, uniqueIdentifier } = recommendation;
            if (comment !== '' || status !== defaultStatus) {
                recommendationFrequencyCounter[uniqueIdentifier] = recommendation;
                isStatusOtherThanNoSelection = true;
            }
        };
        this.previousRecommendationsState.forEach(callbackFilter);
        const callbackPrevFilter = (recommendation: Recommendation) => {
            const existingRecommendation =
            recommendationFrequencyCounter[recommendation.uniqueIdentifier];
            if (existingRecommendation) {
                delete recommendationFrequencyCounter[recommendation.uniqueIdentifier];
                isStatusOtherThanNoSelection = false;
            }

            if (recommendation.status !== defaultStatus) {
                 isStatusOtherThanNoSelection = true;
                }

            return recommendation.status !== defaultStatus || recommendation.comment !== '';
        };
        const newRecommendations: Recommendation[] = this.recommendationsToUpdate.recommendations.filter(callbackPrevFilter);

        const oldRecommendations: Recommendation[] = Object.values(recommendationFrequencyCounter);
        const mergedRecommendations: Recommendation[] = [...oldRecommendations, ...newRecommendations];
        const nextWorkflow = isStatusOtherThanNoSelection ? 'implement' : 'plan';
        return { recommendations: mergedRecommendations, recommendationStatus: 'saved', 'workflow.next': nextWorkflow };
    }

    /**
     * @description It toggles filter dialog
     */
    toggleFilterDialog() {
        this.showFilterTable = !this.showFilterTable;
        this.filterTableRows = JSON.parse(JSON.stringify([...this.previousFilterTableRowsState]));
        if (this.showFilterTable) {
            this.setTempSelectedFilters(true);
        } else {
            this.filtersChanged = false;
        }
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
        this.setTempSelectedFilters();
    }

    /**
     * @description Separated tempSelectedFilters from selectedFilters to sync only on apply filters but not immediately on change
     */
    setTempSelectedFilters(onFilterOpen?) {
        this.tempSelectedFiltersCount = 0;
        this.filtersChanged = onFilterOpen ? false : true;
        this.tempSelectedFilters = {
            productType: [],
            priority: [],
            status: []
        };

        this.filterTableRows.forEach(item => {
            if (item.productType.selected) {
                this.tempSelectedFiltersCount++;
                this.tempSelectedFilters.productType.push(item.productType.name);
            }
            if (item.priority.selected) {
                this.tempSelectedFiltersCount++;
                this.tempSelectedFilters.priority.push(item.priority.name);
            }
            if (item.status.selected) {
                this.tempSelectedFiltersCount++;
                this.tempSelectedFilters.status.push(item.status.name);
            }
        });
    }

    /**
     * @description It sets selected filters in each category
     */
    setSelectedFilters() {
        this.selectedFilters = {
            productType: [],
            priority: [],
            status: []
        };

        this.filterTableRows.forEach(item => {
            if (item.productType.selected) {
                this.selectedFilters.productType.push(item.productType.name);
            }
            if (item.priority.selected) {
                this.selectedFilters.priority.push(item.priority.name);
            }
            if (item.status.selected) {
                this.selectedFilters.status.push(item.status.name);
            }
        });

        this.checkFiltersAvailable();
    }

    /**
     * @description To check if all/none of the filters are applied
     */
    private checkFiltersAvailable() {
        if (this.selectedFilters.productType.length ||
            this.selectedFilters.priority.length ||
            this.selectedFilters.status.length) {
                this.isFiltersAvailable = true;
        } else {
                this.isFiltersAvailable = false;
        }
    }

    /**
     * @description Set saved filters
     */
    setSavedFilters(): void {
        this.savedFilters = {
            productType: [],
            priority: [],
            status: []
        };

        this.filterTableRows.forEach(item => {
            if (Object.keys(item.productType).length) {
                this.savedFilters.productType.push(item);
            }
            if (Object.keys(item.priority).length) {
                this.savedFilters.priority.push(item);
            }
            if (Object.keys(item.status).length) {
                this.savedFilters.status.push(item);
            }
        });
    }

    /**
     * @description Clear all applied filters
     */
    clearFilters(outsideAction?) {
        if (outsideAction) {
            this.isRecommendationsLoaded = false;
        }
        this.filterTableRows.forEach(item => {
            if (item.productType.selected) {
                item.productType.selected = false;
            }
            if (item.priority.selected) {
                item.priority.selected = false;
            }
            if (item.status.selected) {
                item.status.selected = false;
            }
        });
        this.setTempSelectedFilters();
    }

    /**
     * @description Updates selected filters to IPv6 collection
     */
    async applyFilters() {
        this.isFiltersApplied = false;
        const filterObj = {
            productType: [],
            priority: [],
            status: []
        };

        this.filterTableRows.forEach(item => {
            if (Object.keys(item.productType).length) {
                filterObj.productType.push(item.productType);
            }
            if (Object.keys(item.priority).length) {
                filterObj.priority.push(item.priority);
            }
            if (Object.keys(item.status).length) {
                filterObj.status.push(item.status);
            }
        });

        this.ipv6Service.updateSavedFiltersData(this.IPv6Id, { savedFilters: filterObj }).subscribe(res => {
            this.savedFilters = res.data;
            this.previousFilterTableRowsState = JSON.parse(JSON.stringify([...this.filterTableRows]));
            this.selectedFilters = JSON.parse(JSON.stringify({...this.tempSelectedFilters}));
            this.checkFiltersAvailable();
            this.filterRecommendationTable();
            this.showFilterTable = false;
        });
    }

    /**
     * @description Filters recommendation data by applied product type, priority and status
     */
    filterRecommendationTable() {
        this.recommendationsDataSource.data = [...this.previousRecommendationsState.filter(item => {
            if ((!this.selectedFilters.productType.length || this.validateProductTypeFilter(item)) &&
                (!this.selectedFilters.priority.length || this.selectedFilters.priority.includes(this.priority[item.uniqueIdentifier].name)) &&
                (!this.selectedFilters.status.length || this.selectedFilters.status.includes(item.status))) {
                    return item;
            }
        })];

        // Reset priority column data if no filters applied
        if (!this.isFiltersAvailable) {
            this.setPriorityColumnData(this.recommendationsDataSource.data);
        }

        // Exclude row with low priority (with all products types notApplicable)
        this.recommendationsDataSource.data = [...this.recommendationsDataSource.data.filter(item => {
            if (this.priority[item.uniqueIdentifier].name !== 'Low') {
                return item;
            }
        })];

        this.isFiltersApplied = true;
        this.isRecommendationsLoaded = true;
    }

    /**
     * @description validates data against applied filters
     * @param item is a single recommendation element which contains list of product types
     */
    validateProductTypeFilter(item) {
        const valid = item.productTypes.find(productType => (this.selectedFilters.productType.includes(productType.name)) && (productType.priority === 'mandatory' || productType.priority === 'optional'));
        this.setPriorityColumnData([item]);
        return valid;
    }

    /**
     * @description Closes recommendations modal with updated response
     */
    closeModal() {
        let response = {};
        if (getNestedKeyValue(this.updatedRecommendations, 'success')) {
            response = this.updatedRecommendations;
        } else {
            response = { success: false, data: null };
        }

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
        } else {
            this.dialogRef.close(response);
        }
    }

    /**
     * @description Release resources
     */
    ngOnDestroy() {
        if (this.filterTableDataSubscription) {
            this.filterTableDataSubscription.unsubscribe();
        }
        if (this.IPv6RecommendationsSubscription) {
            this.IPv6RecommendationsSubscription.unsubscribe();
        }
        if (this.tooltipSubscription) {
            this.tooltipSubscription.unsubscribe();
        }
        if (this.autoSave) {
            this.autoSave.unsubscribe();
        }
    }

    getImageSrc({ comment }: Recommendation) {
        const icon = comment !== '' ? 'Comment.png' : 'No+comment.png';
        return `assets/images/icons/comments/${icon}`;
    }

    autoSaveOnTimeInterval() {
        if (this.enableSavebtn) { //flag based on save button
            const recommendations = this.mapRecommendationsLogic();
            this.ipv6Service.update(this.IPv6Id, recommendations).subscribe( res => {
                this.updatedRecommendations = res;
                this.recommendationsToUpdate.recommendations = [];
                this.toastService.show('Success', 'Recommendations are successfully auto saved', 'success');
                this.enableSavebtn = false;
            }, err => {
                this.toastService.show('Failed', 'Recommendations auto save failed', 'danger');
            });
        } else {
          console.log('form invalid, Cannot autoSave form ');
        }
    }
}
