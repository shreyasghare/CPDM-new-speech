import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import AccessibilityData, { AccessibilityResData, AdrTabState } from '@cpdm-model/general-compliances/accessibility/identify-adrs/accessibilityData.model';
import { AdrItem } from '@cpdm-model/general-compliances/accessibility/identify-adrs/adrItems/adrItems.model';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { NavigationTabsComponent } from '@cpdm-shared/components/navigation-tabs/navigation-tabs.component';
import { StatusInfoDialogComponent } from '@cpdm-shared/components/status-info-dialog/status-info-dialog.component';
import { getNestedKeyValue, autoSaveInterval } from '@cpdm-shared/utils/utils';
import { Subscription, interval } from 'rxjs';
import { ImportAdrChecklistDialogComponent } from '../../identify-adrs/import-adr-checklist-dialog/import-adr-checklist-dialog.component';
import AdrMemo from './adrMemo';
import AdrUpdate from './AdrUpdate.model';
import { ApproveRejectComponent } from './approve-reject/approve-reject.component';
import { IdentifyAdrsConfirmationComponent } from './identify-adrs-confirmation/identify-adrs-confirmation.component';
import NavigationTab from './navigationTab.model';
import { environment } from 'src/environments/environment';

const adrTypes = ['web', 'software', 'documentation', 'hardware'];
const showCompleteList = ['showCompleteList'];

const toastInitialOptions = {
  show: 'Import In Progress',
  success: 'Import Completed',
  failed: 'Import Failed'
};

const adrTemplate = {
  name: 'cpdm_central_accessibility_adr_template_v2.0.xlsx',
  downloadPath: 'accessibility/adr-checklist/template'
};

@Component({
  selector: 'app-adr-items-dialog',
  templateUrl: './adr-items-dialog.component.html',
  styleUrls: ['./adr-items-dialog.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdrItemsDialogComponent implements OnInit, OnDestroy {
  @ViewChild(NavigationTabsComponent, { static: false }) tabs: NavigationTabsComponent;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  autoSave : Subscription;
  columnsToDisplay = ['id', 'description', this.data.showApprovalScreen ? 'status' : 'applicability', 'comments'];
  isAdrApproved = false;
  selectionAdrItems = new SelectionModel<AdrItem>(true, []);
  showAdrTooltip = true;
  apiResponseReady = false;
  currentTab;
  adrItems = new MatTableDataSource<AdrItem>();
  disableSaveBtn = true;
  disableSubmitBtn = true;
  adrMemo = new AdrMemo();
  savedResponse: AccessibilityData;
  notSelectedAdrItems: AdrItem [];
  showCompleteList = {};
  selectedAdrItems: AdrItem [];
  selectedStatusForBulkUpdate: string;
  statusArray: string [] = [];
  defaultAdrStatus: string;
  disableChache = false;
  onApprove = new EventEmitter();
  navButtonState: { disablePreviousBtn: boolean; disableNextBtn: boolean; };
  isCommentRemoved = false;
  nonSelectedAdrsCount: { web: number, software: number, documentation: number, hardware: number }
                      = { web: 0, software: 0, documentation: 0, hardware: 0 };
  isSubmitForApprovalByPm = false;
  subscription: Subscription;
  isWebImported = false;
  isSwImported = false;
  isDocumentationImported = false;
  isHwImported = false;

  constructor( public dialogRef: MatDialogRef<AdrItemsDialogComponent>,
               @Inject(MAT_DIALOG_DATA) public data: {
                 projectId: string, isPmScreen: boolean, isReadOnly: boolean,
                 showApprovalScreen: boolean, customTabs: any [], showSeperateAdrs: boolean,
                 showSubmitConfirmation: boolean, username: string, actionType: string
               },
               private dialog: MatDialog,
               private accessibilityService: AccessibilityProcessService,
               private toastService: ToastService,
               private utils: UtilsService
             ) {
              // this.setTimeout();
              // this.userInactive.subscribe(() => {

              //   if (!this.data.isReadOnly && !this.disableSaveBtn) {
              //     this.onSave(false, 'saved');
              //   }

              //   console.log(`User has been inactive for ${autoSaveInterval.minutes.toString()} Minutes`);
              // });
            }

  // userActivity;

  // userInactive: Subject<boolean> = new Subject();

  // setTimeout() {
  //   this.userActivity = setTimeout(() => this.userInactive.next(true), autoSaveInterval.milliseconds());
  // }

  // @HostListener('window:mousemove')
  // @HostListener('window:keypress') refreshUserState() {
  //   clearTimeout(this.userActivity);
  //   this.setTimeout();
  // }

  ngOnDestroy() {
    // if (this.userActivity) {
    //   clearTimeout(this.userActivity);
    // }
    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
  }

  async ngOnInit() {
    if (this.data.showApprovalScreen) {
      this.columnsToDisplay.unshift('select');
    }

    this.showAdrTooltip = !this.data.isReadOnly && !this.data.showApprovalScreen;
    const [currentTabName] = adrTypes;
    await this.setAdrItems(currentTabName);
    this.getNavigationTabCount();
    this.getAdrStatus();
    // [DE3049] Accessibility_Auto-Save    
    if (!this.data.isReadOnly) {
      this.autoSave = interval(environment.autoSaveTimeInterval).subscribe(val => {
        if ( !this.disableSaveBtn) {
          this.onSave(false, 'saved');
        }
      });
    }
    //
  }

  private async getAdrStatus() {
    const { success, data } =  await this.accessibilityService.getAdrStatus().toPromise();
    if (success) {
      this.statusArray = data.adrStatuses;
      this.defaultAdrStatus = data.defaultAdrStatus;
      this.mapDefaultAdrStaus(this.adrItems.data);
      this.mapDefaultAdrStaus(this.selectedAdrItems);
      this.mapDefaultAdrStaus(this.notSelectedAdrItems);
    }
  }

  private mapDefaultAdrStaus(adrItems: AdrItem []) {
    if (adrItems) {
      adrItems.map(item => {
        if (!item.status && typeof item !== 'string') {
          item.status = this.defaultAdrStatus;
        }
        return item;
      });
    }
  }

  async onTabChanged(event: NavigationTab) {
    const {disablePreviousBtn, disableNextBtn, currentTab, currentTabNumber } = event;
    this.navButtonState = { disablePreviousBtn, disableNextBtn };
    this.currentTab = event;
    this.currentTab.currentTabName = `‘${this.data.customTabs[currentTabNumber - 1].tabName}’`;
    if (this.data.customTabs[currentTabNumber]) {
      this.currentTab.nextTabName = `‘${this.data.customTabs[currentTabNumber].tabName}’`;
    }

    event.currentTab = currentTab.toLowerCase();

    const currentTabName = event.currentTab;
    const previousTabName = event.previousTabName && event.previousTabName.toLowerCase();

    this.disableSubmitBtn = !disableNextBtn;

    if (previousTabName) {
      this.enableNextTab(event.currentTabNumber, currentTabName);
    }

    const [firstTab] = adrTypes;

    if (this.adrItems && previousTabName) {
        this.resetSort();
        if (this.data.showSeperateAdrs) {
          const newSelectedAdrItems = [...this.selectedAdrItems, ...this.notSelectedAdrItems.filter(item => item.applicable)]
          const notSelectedAdrItems = this.notSelectedAdrItems.filter(item => !item.applicable);
          if (this.showCompleteList[previousTabName]) {
            this.adrMemo.setItem(previousTabName, newSelectedAdrItems.concat(showCompleteList as any, notSelectedAdrItems));
          } else {
            this.adrMemo.setItem(previousTabName, newSelectedAdrItems.concat(showCompleteList as any));
          }
          this.adrMemo.setSelectedItem(previousTabName, newSelectedAdrItems);
          this.adrMemo.setNotSelectedItem(previousTabName, notSelectedAdrItems);
          this.setNavigationTabCount(newSelectedAdrItems.length, previousTabName);
        } else {
          this.adrMemo.setItem(previousTabName, this.adrItems.data);
        }

        // if (!this.data.isReadOnly && !this.disableSaveBtn) { // previous approach
        if (!this.data.isReadOnly && !(this.isWebImported || this.isSwImported || this.isDocumentationImported || this.isHwImported)) {
          this.onSave(false, 'saved', false, true);
        }
        switch (currentTabName) {
          case 'web':
            this.isWebImported = true;
            break;
          case 'software':
            this.isSwImported = true;
            break;
          case 'documentation':
            this.isDocumentationImported = true;
            break;
          case 'hardware':
            this.isHwImported = true;
            break;
        }
    }

    if (firstTab !== currentTabName || previousTabName) {
      await this.setAdrItems(currentTabName);

      if (this.data.showApprovalScreen) {
        this.mapDefaultAdrStaus(this.adrItems.data);
        this.mapDefaultAdrStaus(this.selectedAdrItems);
        this.mapDefaultAdrStaus(this.notSelectedAdrItems);
      }
    }

  }

  private setIsTabTraversed(tabName: string) {
    let tabTraveredCount = 0;

    this.data.customTabs = this.data.customTabs.map(tab => {
      if (tabName === tab.tabName.toLowerCase()) {
        tab.isTraversed = true;
      }

      if (tab.isTraversed) {
        tabTraveredCount++;
      }

      return tab;
    });

    return this.data.customTabs.length === tabTraveredCount;
  }

  private enableNextTab(tabIndex: number, currentTabName: string) {
    const currentTabNameFromTypes = adrTypes[tabIndex - 1];

    if (currentTabName === currentTabNameFromTypes
       && tabIndex < this.data.customTabs.length) {
      this.data.customTabs[tabIndex].isDisabled = false;
    }
  }

  private async getNavigationTabCount() {
    const { success, data } = await this.accessibilityService.getAccessibilityCountById(this.data.projectId).toPromise();

    if (success) {
      const { allAdrItems, selectedAdrItems } = data;
      this.data.customTabs = this.data.customTabs.map(tab => ({...tab,
        selectedAdr: selectedAdrItems[tab.tabName.toLowerCase()],
        totalAdr: allAdrItems[tab.tabName.toLowerCase()]}));
    }
  }

  private setAdrItems = async (tabName: string) => {
    this.apiResponseReady = false;
    if (this.adrMemo.getItems(tabName).length === 0 || this.disableChache) {
      const {success, data} = await this.accessibilityService.getTableData(tabName, this.data.projectId,
            this.data.showSeperateAdrs).toPromise();

      this.resetSort();

      if (success) {
       const selectedAdrItem = this.data.showSeperateAdrs ? data.selectedAdrItems : data.adrItems;
       const notSelectedAdrItems = this.data.showSeperateAdrs ? data.notSelectedAdrItems : [];
       const adrItems = this.data.showSeperateAdrs ? selectedAdrItem.concat(showCompleteList as any) : selectedAdrItem;
       this.allocateItemsToTable(adrItems);
       this.selectedAdrItems = selectedAdrItem;
       this.notSelectedAdrItems = notSelectedAdrItems;
       this.nonSelectedAdrsCount[tabName] = this.notSelectedAdrItems ? this.notSelectedAdrItems.length : 0;
       this.adrMemo.setItem(tabName, this.adrItems.data);
       this.adrMemo.setNotSelectedItem(tabName, notSelectedAdrItems);
       this.adrMemo.setSelectedItem(tabName, selectedAdrItem);
       this.apiResponseReady = true;
      }
    } else {
      this.resetSort();
      this.getAdrMemo(tabName);
      this.apiResponseReady = true;
    }
    return true;
  }

  private resetSort(): void {
  const defaultSort: MatSortable = {
      id: 'defColumnName',
      start: 'asc',
      disableClear: true
  };

  this.sort.sort(defaultSort);
  this.sort.direction = 'asc';
  this.selectionAdrItems.clear();
  this.selectedStatusForBulkUpdate = this.defaultAdrStatus;
  }

  private allocateItemsToTable(adrItems: AdrItem []): void {
    this.adrItems = new MatTableDataSource<AdrItem>([...adrItems]);
    this.adrItems.sortingDataAccessor = (item: AdrItem, property) => {
     switch (property) {
       case 'applicability' : return item.applicable;
       case 'id' : return item.priority;
       default: return item[property];
     }
   };
    this.adrItems.sort = this.sort;
  }

  private getAdrMemo(tabName: string) {
    const adrItems = this.adrMemo.getItems(tabName);
    this.allocateItemsToTable(adrItems);
    this.notSelectedAdrItems = this.adrMemo.getNotSelectedItems(tabName);
    this.selectedAdrItems = this.adrMemo.getSelectedItems(tabName);
  }

  toggleAdrTooltip(): void {
    this.showAdrTooltip = false;
  }

  showNotSelectedAdrs(): void {
    const currentTab = this.currentTab.currentTab;

    if (this.showCompleteList[currentTab]) {
      this.showCompleteList[currentTab] = !this.showCompleteList[currentTab];
    } else {
      this.showCompleteList[currentTab] = true;
    }

    if (this.showCompleteList[currentTab]) {
      this.adrItems = new MatTableDataSource(this.adrItems.data.concat(this.notSelectedAdrItems));
    } else {
      this.adrItems = new MatTableDataSource(this.selectedAdrItems.concat(showCompleteList as any));
    }
  }

  onImportAdrChecklist(): void {
    this.toggleAdrTooltip();
    const dialogRef = this.dialog.open(ImportAdrChecklistDialogComponent, {
      width: '35%', disableClose: true, data: {...adrTemplate}
    });

    dialogRef.afterClosed().subscribe(async (file) => {
      if (file) {
        this.parseAdrXlsx(file);
      }
    });
  }

  getAdrHeading() {
    let message =  `${this.data.showApprovalScreen ?  'Set status and provide comment (if any)'
    : 'Select applicable ADR items' }
    from the ${getNestedKeyValue(this.currentTab, 'currentTabName') ? 
    getNestedKeyValue(this.currentTab, 'currentTabName') : '‘web’'} tab`;

    if (getNestedKeyValue(this.currentTab, 'nextTabName')) {
      message = `${message} and move to the ${getNestedKeyValue(this.currentTab, 'currentTabName') ?
      getNestedKeyValue(this.currentTab, 'nextTabName') : '‘Software’'}  tab`;
    }

    return message;
  }

  private async parseAdrXlsx(file: File) {
    try {
      this.apiResponseReady = false;
      const formData = { adrTypes: JSON.stringify(adrTypes), returnAdrType: this.currentTab.currentTab };
      const url = `accessibility/adr-checklist/parse/${this.data.projectId}`;
      const updatedAdrs: AdrItem [] = await this.utils.uploadFileToNode(url, file, toastInitialOptions, formData);
      this.adrItems = new MatTableDataSource(this.mapAdrItems(updatedAdrs, this.adrItems.data.slice()));
      this.adrItems.sort = this.sort;
      this.adrMemo.setItem(this.currentTab.currentTab, this.adrItems.data);
      await this.getNavigationTabCount();

      // for (let i=0; i<adrTypes.length; i++) {
      //   await this.setAdrItems(adrTypes[i]);
      //   this.isWebImported = true;
      //   this.isSwImported = true;
      //   this.isDocumentationImported = true;
      //   this.isHwImported = true;
      // }
      
      this.apiResponseReady = true;
      this.disableChache = true;
    } catch (error) {
      console.log('error:', error);
    }
  }

  private mapAdrItems(adrItems: AdrItem[], masterAdrItems: AdrItem[], removeExistingItems = true) {
    const frequencyCounter = {};
    let frequencyCounterHasAdrs = false;

    if (Array.isArray(adrItems)) {
      for (const item of adrItems) {
        if (item) {
          frequencyCounterHasAdrs = true;
          const { adrId } = item;
          frequencyCounter[adrId] = item;
        }
      }
    }

    const returnItems: AdrItem [] = [];

    for (const [index, item] of masterAdrItems.entries()) {
      const { adrId } = item;

      if (frequencyCounter[adrId]) {
        returnItems.push(frequencyCounter[adrId]);
      } else {
        const clonedObject = {...masterAdrItems[index]};

        if (removeExistingItems) {
          clonedObject.comments = [];
          clonedObject.applicable = false;
          clonedObject.newComment = false;
        }

        returnItems.push(clonedObject);
      }
    }

    return returnItems;
  }

  onNavNext(): void {
    this.tabs.nextTab();
  }

  onNavPrev(): void {
    this.tabs.previousTab();
  }

  getImageSrc(newComment) {
    let icon = newComment && newComment.length && newComment[newComment.length - 1].comment !== '' ? 'Comment.png' : 'No+comment.png';
    if (this.isCommentRemoved) {
      icon = 'No+comment.png';
    }
    this.isCommentRemoved = false;
    return `assets/images/icons/comments/${icon}`;
  }

  onCancel() {
    if (!this.disableSaveBtn) {
      const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
        {
          data: { header: 'Warning!',
          confirmationText: 'All your unsaved changes will be lost. Do you want to proceed?'
          },
          width: '35vw', height: 'auto', disableClose: true
        });

      confirmationDialogRef.componentInstance.onConfirmAction.subscribe(async () => {
        confirmationDialogRef.close();
        this.dialogRef.close();
      });
    } else {
      this.dialogRef.close(this.savedResponse);
    }
  }

  onSubmit(): void {
    if (this.data.showSubmitConfirmation) {
      const confirmationDialogRef = this.dialog.open(ApproveRejectComponent,
        {
          data: { isPmScreen: this.data.isPmScreen },
          width: '35vw', height: 'auto', disableClose: true
        });

      confirmationDialogRef.componentInstance.onAction.subscribe(async ({type, comment}: {type: string, comment: string}) => {
        const data = await this.onSave(true, type, true, false, comment);

        if (type === 'approved') {
          this.disableSubmitBtn = true;
          this.onApprove.emit(data);
        }

        confirmationDialogRef.close();
        this.dialogRef.close(data);
      });
    } else {
      let adrsPresent = true;
      let showApprovalScreen = true;

      this.data.actionType === 'pendingApproval' ? this.isSubmitForApprovalByPm = true : this.isSubmitForApprovalByPm = false;

      if (this.data.actionType === 'identified') {
        for (const adr of adrTypes) {
          adrsPresent = this.adrMemo.getItems(adr).filter(item => item.applicable).length > 0;
          if (adrsPresent) {
            break;
          }
        }
        showApprovalScreen = false;
      }

      const data = { adrsPresent, showApprovalScreen };

      const confirmationDialogRef = this.dialog.open(IdentifyAdrsConfirmationComponent,
        {
          data,
          width: '35vw', height: 'auto', disableClose: true
        });

      confirmationDialogRef.afterClosed().subscribe(async (afterClosedRes) => {
        if (afterClosedRes) {
          for (let i=0; i<adrTypes.length; i++) {
            await this.setAdrItems(adrTypes[i]);
          }
          const retunredData = await this.onSave();
          return this.dialogRef.close(retunredData);
        }
        confirmationDialogRef.close();
      });
    }
  }

  async onSave(submitAction = true, actionType = null, showToast = true, autoSave = false, comment?: string):
  Promise<AccessibilityResData> {
    const updateBody: AdrUpdate = { updateQuery: {
      $set: {
        lastUser: this.data.isPmScreen ? 'pm' : 'po'
      },
      $push: {}
      }
    };

    updateBody.updateQuery.$set.adrStatus = actionType ? actionType : this.data.actionType;

    if (this.data.showApprovalScreen && !autoSave) {
      this.adrMemo.setItem(this.currentTab.currentTab, this.adrItems.data);
    }

    if (submitAction) {
      if (this.data.showApprovalScreen && !this.data.isPmScreen || !this.data.showApprovalScreen) {
        const workflowTimestamp = 'workflowTimestamp.'.concat(this.data.showApprovalScreen ? 'approveAdr' : 'identifiAdr');
        updateBody.updateQuery.$set[workflowTimestamp] = new Date();
      }
    }

    if (actionType === 'approved' || actionType === 'rejected') {
      updateBody.updateQuery.$push.adrComment = {
          comment,
          timestamp : new Date(),
          userId : this.data.username,
          isApproved : actionType === 'approved'
      };
    }

    if (this.data.actionType === 'identified') {
      const adrTabState = { } as AdrTabState;
      this.data.customTabs.forEach(tab => {
        const tabName = tab.tabName.toLowerCase();
        adrTabState[tabName] = tab.isDisabled;
      });
      updateBody.updateQuery.$set.adrTabState = adrTabState;
    }

    const [showDiff] = showCompleteList;
    for (const adr of adrTypes) {
      let adrData = [...this.adrMemo.getItems(adr), ...this.adrMemo.getNotSelectedItems(adr)];
      // if (this.isSubmitForApprovalByPm) { adrData = [...this.adrMemo.getItems(adr), ...this.adrMemo.getNotSelectedItems(adr)]; }
      // else { adrData = this.adrMemo.getItems(adr); }

      if (adrData) { adrData.sort((a, b) => (a.criteria > b.criteria) ? 1 : -1); }
      let items = adrData.filter(item => {
        let isUserComment = false;

        if (Array.isArray(item.comments) && item.comments.length > 0) {
          const [{userId}] = item.comments;
          isUserComment = userId !== 'admin';
        }

        const result = item.applicable || item.default || isUserComment
        || item.status !== undefined && item.status !== this.defaultAdrStatus
        && item !== showDiff;

        if (item !== showDiff) {
          item.name = item.adrId;
        }
        return result;
      });
      items = [...new Map(items.map(item => [item.adrId, item])).values()];
      items.sort((a, b) => (a.criteria > b.criteria) ? 1 : -1);
      if (items.length > 0 || this.adrMemo.getItems(adr).length > 0) {
        updateBody.updateQuery.$set[`adrDetails.${adr}`] = items;
      }
    }

    const { success, data } = await this.accessibilityService.updateAdrItems(this.data.projectId, updateBody).toPromise();

    if (success) {
      if (showToast) {
        this.toastService.show('Success', `ADR items are ${submitAction ? 'submitted' : 'saved'} successfully`, 'success');
      }
      this.disableSaveBtn = true;
      this.savedResponse = data;

      if (submitAction) {
        this.disableSubmitBtn = true;
      }

      return data;
    }
  }

  onChangeTableData(item?: AdrItem): void {
    if (item) {
      item.applicable = item.status !== this.defaultAdrStatus;
    }

    this.disableSaveBtn = false;
  }

  onCommentChanged(element: AdrItem, event): void {
    const comment = [
      {
        comment: event.target.value,
        timestamp: new Date(),
        userId: this.data.username
      }
    ];

    if (element.comments && element.comments.length) {
      const [item] = element.comments;

      if (item.userId === this.data.username) {
        item.comment = event.target.value;
        item.timestamp = new Date();
        item.userId = this.data.username;

        element.comments = [item];
      } else {
        const comments = element.comments.concat(comment);

        element.comments = comments;
      }
    } else {
      element.comments = [
        {
          comment: event.target.value,
          timestamp: new Date(),
          userId: this.data.username
        }
      ];
    }
    element.newComment = true;
    event.target.value === '' ? this.isCommentRemoved = true : this.isCommentRemoved = false;

    this.onChangeTableData();
  }

  bulkEdit(): void {
    const callbackFn = item => {
      if (typeof item !== 'string') { item.status = this.selectedStatusForBulkUpdate;
        item.applicable = item.status !== this.defaultAdrStatus;
      }
    };

    if (this.selectionAdrItems.selected.length > 0) {
      this.selectionAdrItems.selected.forEach(callbackFn);
    } else {
      this.adrItems.data.forEach(callbackFn);
    }

    this.onChangeTableData();
  }

  onChangeCheckbox(): void {
    const count = this.adrItems.data.filter((item: AdrItem) =>  {
      if (!item.applicable && item.status) { item.status = this.defaultAdrStatus; }
      return item.applicable
    }).length;
    this.setNavigationTabCount(count);

    this.disableSaveBtn = false;
  }

  private setNavigationTabCount(count: number, currentTabName = this.currentTab.currentTab): void {
    this.data.customTabs.forEach(item => {
      if (item.tabName.toLowerCase() === currentTabName) {
        item.selectedAdr = count;
      }
    });

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selectionAdrItems.selected.length;
    const numRows = this.adrItems ? this.adrItems.data.length : 0;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
        this.selectionAdrItems.clear() :
        this.adrItems.data.forEach((row) => this.selectionAdrItems.select(row));
  }

  toggleAdrApplicable(checked: boolean): void {
    this.adrItems.data.map((item) => item.applicable = checked);
    const selectedItemsLength = checked ? this.adrItems.data.length : 0;
    this.setNavigationTabCount(selectedItemsLength);
    this.onChangeTableData();
  }

  isAdrHasApplicableItems(): boolean {
    let applicableItemsCount = 0;

    if (!this.adrItems) {
      return false;
    }

    for (const adr of this.adrItems.data) {
      if (adr.applicable) {
        applicableItemsCount++;
      }
    }

    return this.adrItems.data.length !== applicableItemsCount && applicableItemsCount !== 0;
  }

  isAllAdrApplicable(): boolean {
    if (!this.adrItems) {
      return false;
    }

    const data = this.adrItems.data.reduce((adrItemState, adrItem: AdrItem) => {
      adrItem.applicable ? adrItemState.applicableItems++ : null;
      return adrItemState;
    }, {applicableItems: 0});

    return data.applicableItems === this.adrItems.data.length;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AdrItem): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAdrItems.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showStatusInfoDialog(): void {
    this.dialog.open(StatusInfoDialogComponent, { width: '60%', height: 'auto' });
  }

  getCommentValue(element: AdrItem, returnType = ''): string {
    const comments = element.comments;
    const lastItem = comments && comments.length > 0 ? comments.length - 1 : null;

    return comments && lastItem !== null ? comments[lastItem].comment : returnType;
  }

}