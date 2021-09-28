import { Component, OnInit, TemplateRef, ViewChild, Inject } from '@angular/core';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { Subscription } from 'rxjs';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ComplianceItemsObject } from '@cpdm-model/complianceItemsObject';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CuiModalService } from '@cisco-ngx/cui-components';
//[DE3162](https://rally1.rallydev.com/#/300796297852ud/iterationstatus?detail=%2Fdefect%2F496785033300&fdp=true?fdp=true): Demo_An empty browser screen other than the CPDM Central icon in the tab is only shown when application is accessed on higher chrome versions(87+)
import { DeviceInfo } from 'ngx-device-detector';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { MatomoTracker } from 'ngx-matomo';


@Component({
  selector: 'app-manage-compliance-item',
  templateUrl: './manage-compliance-item.component.html',
  styleUrls: ['./manage-compliance-item.component.scss']
})
export class ManageComplianceItemComponent implements OnInit {

  complianceItems: any[] = [];
  manageComplianceItems: any[] = [];
  onClose: any;
  device: DeviceInfo;
  isMacOs: boolean;

  getAllComplianceItemsSubscription: Subscription;
  addItemFlag = false;
  selection: string;
  newComplianceItem: ComplianceItemsObject = new ComplianceItemsObject();
  allComplianceItems: any[] = [];
  tooltipHelperData: any[] = [];
  tooltipObject: any = {};
  apiRequest = true;
  projectId: string;
  complianceTypeHeading: string;
  complianceTableHeading: string;
  infoIconDesc: [];
  constructor(
    private dialogRef: MatDialogRef<ManageComplianceItemComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userDetailsService: UserDetailsService,
    private projectDetails: ProjectsDetailService,
    private projectsDataService: ProjectsDataService, private dialog: MatDialog,
    private matomoTracker: MatomoTracker
  ) { }

  ngOnInit() {
    this.device = this.userDetailsService.getUserDeviceInfo();
    this.isMacOs = this.device.os.toLocaleLowerCase() === 'mac';//DE3162
    this.manageComplianceItems = JSON.parse(JSON.stringify(this.data.complianceItems));
    this.projectId = this.data.projectId;
    this.getComplianceItems();
    const complianceType = this.manageComplianceItems.map(a => a.complianceType);
    complianceType[0] === 'technicalStandard' ? this.complianceTableHeading = '' : this.complianceTableHeading = 'compliance';
    complianceType[0] === 'technicalStandard' ? this.complianceTableHeading = "Best Practices" : this.complianceTableHeading = "Compliance items";
  }

  onSave() {
    this.apiRequest = false;
    const obj = {
      complianceItems: [],
      additionalRequirements: [],
      technicalStandardItems: [],
      projectId: this.projectId
    };
    this.manageComplianceItems.forEach(element => {
      if (element.complianceType === 'general') {
        delete element.complianceType;
        obj.complianceItems.push(element);
      } else if (element.complianceType == 'additional') {
        delete element.complianceType;
        obj.additionalRequirements.push(element);
      } else if (element.complianceType == 'technicalStandard') {
        delete element.complianceType;
        obj.technicalStandardItems.push(element);
      } else {

      }
    });

    if (obj && obj.complianceItems && obj.complianceItems.length) {
      let modifiedExportCompliance = obj.complianceItems.filter(x => x.name == "Export Compliance")[0];
      let unmodifiedExportCompliance = this.data.complianceItems.filter(x => x.name == "Export Compliance")[0];

      if (modifiedExportCompliance && unmodifiedExportCompliance && unmodifiedExportCompliance.selected && !modifiedExportCompliance.selected) {
        obj["sendEmail"] = true;
      }
      else {
        obj["sendEmail"] = false;
      }
    }
    if (obj && obj.technicalStandardItems && obj.technicalStandardItems.length) {
      const currentServicability = obj.technicalStandardItems.filter(x => x.name === "Serviceability")[0];
      const prevServicability = this.data.complianceItems.filter(x => x.name === "Serviceability" && x.complianceType ==="technicalStandard")[0];

      if (currentServicability && prevServicability && prevServicability.selected && !currentServicability.selected) {
        obj["servicabilityNotApplicableEmailFlag"] = true;
      }
      else {
        obj["servicabilityNotApplicableEmailFlag"] = false;
      }
    }

    this.projectDetails.manageCompliance(obj).subscribe(
      res => {
        this.apiRequest = !this.apiRequest;
        this.projectDetails.setProjectDetails(res);
        this.dialogRef.close(res);
      },
      err => {
        console.error(err);
      }
    );

    this.matomoTracker.trackEvent('ProjectDetailsPage', 'ManageWorkflow', "Update Applicability");
  }

  closeManagePopup() {
    this.dialogRef.close();
  }

  async getComplianceItems() {
    this.getAllComplianceItemsSubscription = await this.projectDetails.getAllComplianceItem().subscribe(res => {
      this.allComplianceItems = res;
    }, err => {
      console.error(err);
    });
  }

  manageCompilanceItemSelection() {
    const ids = new Set(this.manageComplianceItems.map(({ name }) => name));
    this.allComplianceItems = this.allComplianceItems.filter(({ name }) => !ids.has(name));
  }

  addItemMenu() {
    this.manageCompilanceItemSelection();
    this.addItemFlag = true;
  }

  onSelection() {
    // Do Nothing
  }

  addItem() {
    if (this.newComplianceItem.name) {
      const newComplianceObj = this.allComplianceItems.find(x => x.name === this.newComplianceItem.name);
      this.newComplianceItem.refId = newComplianceObj._id;
      this.newComplianceItem.complianceType = newComplianceObj.complianceType;
      this.manageComplianceItems.push(this.newComplianceItem);
      this.manageCompilanceItemSelection();
      this.newComplianceItem = new ComplianceItemsObject();
    }
  }

  ignoreItem() {
    this.newComplianceItem = new ComplianceItemsObject();
    this.addItemFlag = false;
  }

  openTooltipModal(labelName) {
    const reusableIconInfoHelperGeneralCompliance = ['Accessibility', 'Revenue Recognition', 'Smart Licensing',
      'Product Security, Privacy and Trust (CSDL)', 'Third Party Software Compliance & Risk Management (TPSCRM)', 'Export Compliance'];
    const reusableIconInfoHelperTechnologyBest = ['API Products', 'Telemetry', 'IPv6', 'Serviceability'];
    const reusableIconInfoHelperAdditionalRequirements = ['Communications Regulatory Compliance', 'Globalization'];
    let mainCategory = null;
    if (reusableIconInfoHelperGeneralCompliance.includes(labelName)) { mainCategory = 'applicableRequirements'; }
    if (reusableIconInfoHelperTechnologyBest.includes(labelName)) { mainCategory = 'technologyBestPractices'; }
    if (reusableIconInfoHelperAdditionalRequirements.includes(labelName)) {
      mainCategory = 'additionalRequirements';
    }
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: '67vw',
      data: {
        workflowName: 'projectDashboard', stepName: mainCategory,
        title: labelName
      }
    });
    accInfoHelper.afterClosed().subscribe(result => {
    });
  }
}
