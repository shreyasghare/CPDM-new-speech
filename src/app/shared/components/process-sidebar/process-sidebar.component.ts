import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';

@Component({
  selector: 'process-sidebar',
  templateUrl: './process-sidebar.component.html',
  styleUrls: ['./process-sidebar.component.scss'],
})
export class ProcessSidebarComponent {
  @Input() sidebarData = [] as SidebarDataModel[];
  @Output() onSidebarSwitch = new EventEmitter();
  @Output() onInfoClick = new EventEmitter();

  disableNextBtn: boolean;
  disablePreviousBtn: boolean;
  private currentTabName: string = null;
  private currentTabNumber: any;

  constructor() {}

  ngOnInit() {}

  switchSidebarTab(step: string) {
    let indexOfObj: number;
    if (this.sidebarData.length > 0) {
      this.sidebarData.forEach((element, index) => {
        if (element.alias === step && element.isEnabled) {
          element.isActive = true;
          this.currentTabName = element.alias;
          this.currentTabNumber = index;
          indexOfObj = index;
        } else {
          element.isActive = false;
        }
      });

      this.disableNextBtn =
        this.sidebarData[indexOfObj + 1] &&
        this.sidebarData[indexOfObj + 1].isEnabled
          ? false
          : true;
      this.disablePreviousBtn = indexOfObj === 0;
      this.onSidebarSwitch.emit({
        sidebarData: this.sidebarData,
        currentTab: { name: this.currentTabName, number: this.currentTabNumber },
        disableNextBtn: this.disableNextBtn,
        disablePreviousBtn: this.disablePreviousBtn,
      });
    } else {
      throw new Error('Sidebar data not availabe');
    }

  }

  showModal(sidebarData: SidebarDataModel) {
    switch (sidebarData.title) {
      case 'Identify ADRs':
      case 'ADR List Approval':
        this.onInfoClick.emit({ size: 'large', name: sidebarData.title, alias: sidebarData.alias });
        break;

      case 'Policy Testing':
      case 'Prepare VPAT':
      case 'Plan':
      case 'Implement':
      case 'Complete':
      case 'Re-Initiate':
        this.onInfoClick.emit({ size: 'normal', name: sidebarData.title, alias: sidebarData.alias });
        break;

      default:
        this.onInfoClick.emit({ name: sidebarData.title, alias: sidebarData.alias });
        break;
    }
  }

  isInfoIconVisible(i: number) {
    return this.sidebarData[i].showInfoIcon;
  }

  enableSideBarItems(sidebarItem: string): void {
    let disableNextTabs = false;
    this.sidebarData.forEach((element) => {
      element.isEnabled = !disableNextTabs;
      if (element.alias === sidebarItem) {
        disableNextTabs = true;
      }
    });
  }

  // to be used to enable all the steps before integration
  enableAllSideBarItems(): void {
    this.sidebarData.forEach((element) => {
      element.isEnabled = true;
    });
  }
  
  onPreviousClick() {
    this.sidebarData.some((element, index) => {
      if (element.isActive && element.isEnabled) {
        this.switchSidebarTab(this.sidebarData[index - 1].alias);
        return true;
      }
    });
  }

  onNextClick() {
    this.sidebarData.some((element, index) => {
      if (element.isActive && element.isEnabled && this.sidebarData[index + 1]) {
        this.switchSidebarTab(this.sidebarData[index + 1].alias);
        return true;
      }
    });
  }

  get currentTab(): string {
    return this.currentTabName;
  }

  updateWorkflowTimestamp(workflowTimestamp: any) {
    if (workflowTimestamp == null || workflowTimestamp === undefined) {
      this.sidebarData.forEach((element) => (element.isCompleted = false));
    } else {
      const workFlowTimeStampKeys = Object.keys(workflowTimestamp);
      const workFlowTimeStampvalues = Object.values(workflowTimestamp);
      for (const value of this.sidebarData) {
        for (let i = 0; i < workFlowTimeStampKeys.length; i++) {
          if (workFlowTimeStampKeys[i] === value.alias) {
            value.isCompleted = true;
            value.completedOn = workFlowTimeStampvalues[i] as string;
          } 
          else {
            if (workFlowTimeStampKeys && !workFlowTimeStampKeys.includes(value.alias)) {
              value.isCompleted = false;
              value.completedOn = null;
            }
          }
        }
      }
    }
  }

  getStepName(condition: 'next' | 'previous') {
    for (let i = 0; i < this.sidebarData.length; i++) {
      if (this.sidebarData[i].isActive) {
        if (condition === 'next') {
          if (this.sidebarData.length - 1 !== i) {
            return this.sidebarData[i + 1].title;
          }
        } else {
          if (i > 0) {
            return this.sidebarData[i - 1].title;
          }
        }
        return this.sidebarData[i].title;
      }
    }
  }

  resetTimestamp() {
    this.sidebarData.forEach(element => { 
      element.completedOn = null;
      element.isCompleted = false;
      element.isActive = false;
    });
  }
}
