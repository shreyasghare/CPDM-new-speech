import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation-tabs',
  templateUrl: './navigation-tabs.component.html',
  styleUrls: ['./navigation-tabs.component.scss']
})
export class NavigationTabsComponent implements OnInit {
  private disableNextBtn = false;
  private disablePreviousBtn = true;

  @Output() tabChanged: EventEmitter<any> = new EventEmitter();

  constructor() { }

  @Input() customTabs = [];

  // Switch between horizontal tabs in forward direction
  nextTab() {
    for (const [index, value] of this.customTabs.entries()) {
      if (value.active === true && index < this.customTabs.length - 1) {
        if (this.customTabs[index + 1].isEnabled || this.customTabs[index + 1].isEnabled === undefined) {
        this.customTabs[index].active = false;
        this.customTabs[index + 1].active = true;
        this.disableNextBtn = value.tabNumber === this.customTabs.length - 1 ? true : false;
        this.disablePreviousBtn = value.tabNumber > 0 ? false : true;
        this.tabChanged.emit({currentTab: this.customTabs[index + 1].tabName,
          previousTabName: this.customTabs[index].tabName,
          currentTabNumber: this.customTabs[index + 1].tabNumber,
          disableNextBtn: this.disableNextBtn,
          disablePreviousBtn: this.disablePreviousBtn});
        break;
        } else {
          return false;
        }
      }
    }
  }

  // Switch between horizontal tabs in backward direction
  previousTab() {
    for (let i = this.customTabs.length - 1; i > 0; i--) {
      if (this.customTabs[i].active === true && i > 0) {
        if (this.customTabs[i - 1].isEnabled || this.customTabs[i - 1].isEnabled === undefined) {
          this.customTabs[i].active = false;
          this.customTabs[i - 1].active = true;
          this.disableNextBtn = this.customTabs[i - 1].tabNumber < this.customTabs.length ? false : true;
          this.disablePreviousBtn = this.customTabs[i].tabNumber === 2 ? true : false;
          this.tabChanged.emit({currentTab: this.customTabs[i - 1].tabName,
            previousTabName: this.customTabs[i].tabName,
            currentTabNumber: this.customTabs[i - 1].tabNumber,
            disableNextBtn: this.disableNextBtn,
            disablePreviousBtn: this.disablePreviousBtn});
          break;
        } else {
          return false;
        }
      }
    }
  }

  ngOnInit() {
    this.tabChanged.emit({currentTab: this.customTabs[0].tabName,
      currentTabNumber: this.customTabs[0].tabNumber, disableNextBtn: this.disableNextBtn,
      disablePreviousBtn: this.disablePreviousBtn});
  }

  onCustomTabChange(item) {
    let previousTabName;
    if (item.isEnabled || item.isEnabled === undefined) {
      this.customTabs.forEach((element) => {
        if (element.active) {
          previousTabName = element.tabName;
        }
        if (element.tabNumber === item.tabNumber) {
          element.active = true;
        } else {
        element.active = false;
        }
       });
      this.disablePreviousBtn = item.tabNumber === 1 ? true : false;
      this.disableNextBtn = item.tabNumber === this.customTabs.length ? true : false;
      this.tabChanged.emit({currentTab: item.tabName,
        currentTabNumber: item.tabNumber,
        disableNextBtn: this.disableNextBtn,
        disablePreviousBtn: this.disablePreviousBtn,
        previousTabName});
    } else {
      return false;
    }


}

}
