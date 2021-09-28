import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { AdrItemsDialogComponent } from '../shared/adr-items-dialog/adr-items-dialog.component';
import { adrItemIdentified, adrItemsIdentified, identifyingAdr, listOfAdrItems, customTabs } from '../shared/constants';

@Component({
  selector: 'app-identify-adrs',
  templateUrl: './identify-adrs.component.html',
  styleUrls: ['./identify-adrs.component.scss']
})
export class IdentifyADRsComponent implements OnInit {

  @Input() isPmScreen: boolean;

  listOfAdrItems = listOfAdrItems;
  adrItemIdentified = adrItemIdentified;
  identifyingAdr = identifyingAdr;
  adrItemsIdentified = adrItemsIdentified;
  projectId: string;
  accessibilityData: any;

  constructor(private dialog: MatDialog,
              private route: ActivatedRoute,
              private accessibilityService: AccessibilityProcessService,
              private userDetais: UserDetailsService) {
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.params.id;
    this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(res => {
      const [data] = res;
      this.accessibilityData = data;
    });
  }

  openDialog() {
    const adrStatus = this.accessibilityData.adrStatus;
    const tabState = this.accessibilityData.adrTabState;
    const isReadOnly = adrStatus !== 'started' && !!getNestedKeyValue(this.accessibilityData, 'workflowTimestamp', 'identifiAdr');
    const username = this.userDetais.getLoggedInCecId();
    let actionType = null;

    switch (adrStatus) {
      case 'started':
      case 'saved':
        actionType = 'identified';
        break;
    }

    let modifiedCustomTabs = null;

    if (this.isPmScreen) {
      modifiedCustomTabs = customTabs.map(item => ({...item, isDisabled: tabState[item.tabName.toLowerCase()]}));
    } else {
      modifiedCustomTabs = customTabs;
    }

    const config = {
      data: { projectId: this.projectId, isPmScreen: this.isPmScreen,
              isReadOnly, showSeperateAdrs: isReadOnly, customTabs: modifiedCustomTabs,
              username, actionType },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(AdrItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.accessibilityData = result;
        if (result.adrStatus === 'identified') {
          this.accessibilityService.enableNextSidebarItem('adrListApproval');
          await this.accessibilityService.updateProgressScore(this.projectId, { progressScore: 10 }, 'identifyADRs').toPromise();
        }
      }
    });
  }

}

function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function capFirstChar(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

