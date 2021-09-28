import { ViewEncapsulation, Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageComplianceItemComponent } from '../manage-compliance-item/manage-compliance-item.component';
import { CommentPopupComponent } from '../comment-popup/comment-popup.component';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
//[DE3162](https://rally1.rallydev.com/#/300796297852ud/iterationstatus?detail=%2Fdefect%2F496785033300&fdp=true?fdp=true): Demo_An empty browser screen other than the CPDM Central icon in the tab is only shown when application is accessed on higher chrome versions(87+)
import { DeviceInfo } from 'ngx-device-detector';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ProjectDetailsTable } from '@cpdm-model/ProjectDetailsTable';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { MatDialog } from '@angular/material';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { Subscription } from 'rxjs/Subscription';
import { MatomoTracker } from 'ngx-matomo';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { LoaderService } from '@cpdm-service/shared/loader.service';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { navigateTo } from '@cpdm-shared/constants/viewBtnNavigation';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';

@Component({
  selector: 'app-compliance-items-table',
  templateUrl: './compliance-items-table.component.html',
  styleUrls: ['.././project-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComplianceItemsTableComponent implements OnInit {

  @Input() complianceItems: ProjectDetailsTable[];
  @Input() complianceItemsSortedData: any[];
  @Input() selectedTemplate: any;
  hideme = [];
  projectId = '';

  device: DeviceInfo;
  isMacOs: boolean;
  isStarting = false;
  revRecComplianceId: any;
  private subscription: Subscription;
  selectedTabIndex: number;
  resForInfoIcon = [];
  tooltipObject = {};
  infoIconDesc = [];
  constructor(
    private route: ActivatedRoute,
    private projectsDetailService: ProjectsDetailService,
    private accessibilityService: AccessibilityProcessService,
    private router: Router,
    private userDetailsService: UserDetailsService,
    private revRecService: RevenueRecognitionService,
    private slService: SmartLicensingService,
    private projectDataService: ProjectsDataService,
    public dialog: MatDialog,
    private matomoTracker: MatomoTracker,
    private toastService: ToastService,
    private loader: LoaderService
  ) { }

  sortData(sort: Sort) {
    const data = this.complianceItems.slice();
    if (!sort.active || sort.direction === '') {
      this.sortComplianceItemsOnInit();
      return;
    }

    this.complianceItemsSortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'progressScore': return this.compare(a.progressScore, b.progressScore, isAsc);
        default: return 0;
      }
    });
  }

  ngOnInit() {
    this.projectDataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });
    this.projectId = this.route.snapshot.params.id;
    this.device = this.userDetailsService.getUserDeviceInfo();
    //this.isMacOs = this.device.displayName.toLocaleLowerCase() === 'mac os x';
    this.isMacOs = this.device.os.toLocaleLowerCase() === 'mac';//DE3162
    if (this.projectsDetailService.selectedTabValue && this.projectsDetailService.selectedTabValue.tabIndex) {
      this.selectedTabIndex = this.projectsDetailService.selectedTabValue.tabIndex;
    }

    this.subscription = this.projectsDetailService.notifyCompliancetabIndex.subscribe(res => {
      this.complianceItemsSortedData = [];
      this.selectedTabIndex = res.selectedTabIndex;
      if (res.selectedTabIndex == 0) {
        this.complianceItemsSortedData = [...this.projectsDetailService.getProjectDetails.complianceItems, ...this.projectsDetailService.getProjectDetails.additionalRequirements];
      } else {
        this.complianceItemsSortedData = this.projectsDetailService.getProjectDetails.technicalStandardItems;
      }
      this.sortComplianceItemsOnInit();
    });
    this.sortComplianceItemsOnInit();
    this.revRecComplianceId = this.revRecService.getRevRecComplianceId;
  }

  ngAfterViewInit() {
    if (this.selectedTabIndex && this.complianceItemsSortedData) {
      this.sortComplianceItemsOnInit();
    }
  }

  sortComplianceItemsOnInit() {
    switch (this.selectedTabIndex) {
      case 1:
        const additionalRequiremnetsData = this.complianceItemsSortedData.filter(element => element.complianceType.toLocaleLowerCase() === 'additional');
        this.complianceItemsSortedData = this.combineCompilanceItems(additionalRequiremnetsData);
        break;
      case 2:
        const technicalStandardData = this.complianceItemsSortedData.filter(element => element.complianceType.toLocaleLowerCase() === 'technicalstandard');
        this.complianceItemsSortedData = this.combineCompilanceItems(technicalStandardData);
        break;
      default:
        const generalCompilanceData = this.complianceItemsSortedData.filter(element => element.complianceType.toLocaleLowerCase() === 'general');
        this.complianceItemsSortedData = this.combineCompilanceItems(generalCompilanceData);
        break;
    }
  }

  async startProcess(compliance, index) {
    this.loader.show();
    switch (compliance.name.toLowerCase()) {
      case 'accessibility': {
        await this.patchStart(compliance, index);

        const projecIdObj = {
          projectId: this.projectId,
          betaFlag: compliance.betaFlag
        };
        const logginUserObj = { userObj: this.userDetailsService.currentUserValue };
        const headers = {
          adrProcess: 'initiateProcess',
          user: logginUserObj
        };
        this.accessibilityService.startAccessibilityProcess(projecIdObj, headers).subscribe(res => {
          this.onViewComplianceItem(this.projectId, this.complianceItemsSortedData[index].name.toLowerCase());
          this.loader.hide();
        });
        break;
      }
      case 'revenue recognition': {
        await this.patchStart(compliance, index);
        this.revRecService.startRevRecProcess(this.projectId, this.revRecComplianceId, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/revenue-recognition/${res.id}`]);
          this.loader.hide();
        });
        break;
      }
      case 'smart licensing': {
        await this.patchStart(compliance, index);
        this.slService.start({ projectId: this.projectId, complianceId: compliance._id, betaFlag: compliance.betaFlag }).subscribe(slRes => {
            const { success, data } = slRes;
            if (success) {
              this.router.navigate([`/smart-licensing/${data._id}`]);
              this.loader.hide();
            }
          });
        break;
      }
      case 'product security, privacy and trust (csdl)': {
        this.projectsDetailService.startCSDLProcess(this.projectId, compliance._id, compliance.betaFlag).subscribe(res => {
            const { success, data } = res;
            if (success) {
              this.router.navigate([`/csdl/${res.data.csdlID}`]);
              this.loader.hide();
            }
          }, (error) => {
            this.toastService.show('Error in starting process', 'Error in starting CSDL process', 'danger');
          });
        break;
      }
      case 'third party software compliance & risk management (tpscrm)': {
        this.projectsDetailService.startTpsdProcess(this.projectId, compliance._id, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/tpsd/${res.data.tpsdId}`]);
          this.loader.hide();
        }, (error) => {
          this.toastService.show('Error in starting process', 'Error in starting TPSCRM process', 'danger');
        });
        break;
      }
      case 'export compliance': {
        this.projectsDetailService.startExportComplianceProcess(this.projectId, compliance._id, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/export-compliance/${getNestedKeyValue(res, 'data', 'ecId')}`]);
          this.loader.hide();
        }, () => {
          this.toastService.show('Error in starting process', 'Error in starting export compliance process', 'danger');
        });
        break;
      }
      case 'communications regulatory compliance': {
        this.projectsDetailService.startCRCProcess(this.projectId, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/communications-regulatory/${getNestedKeyValue(res, 'data', 'crcId')}`]);
          this.loader.hide();
        }, () => {
          this.toastService.show('Error in starting process', 'Error in starting communications regulatory process', 'danger');
        });
        break;
      }
      case 'globalization': {
        await this.patchStart(compliance, index);
        this.projectsDetailService.startGlobalizationProcess(this.projectId, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/globalization/${getNestedKeyValue(res, 'dbResponse', '_id')}`]);
          this.loader.hide();
        }, () => {
          this.toastService.show('Error in starting process', 'Error in starting globalization process', 'danger');
        });
        break;
      }
      case 'api products': {
        this.projectsDetailService.startApiProductsProcess(this.projectId, compliance._id,compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/api-products/${res.data.apiProductsId}`]);
          this.loader.hide();
        });
        break;
      }
      case 'telemetry': {
        this.projectsDetailService.startTelemetryWorkflow(this.projectId, compliance._id,compliance.betaFlag).subscribe(res => {
          if (res.success) {
            this.router.navigate([`/telemetry/${res.data.telemetryId}`]);
            this.loader.hide();
          }
        }, (error) => {
          this.toastService.show('Error in starting process', 'Error in starting Telemetry process', 'danger');
        });
        break;
      }
      case 'ipv6': {
        this.projectsDetailService.startIPv6Process(this.projectId,compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/ipv6/${res.data.IPv6Id}`]);
          this.loader.hide();
        }, () => {
          this.toastService.show('Error in starting process', 'Error in starting IPv6 process', 'danger');
        });
        break;
      }
      case 'serviceability': {
        this.projectsDetailService.startServiceabilityProcess(this.projectId, compliance.betaFlag).subscribe(res => {
          this.router.navigate([`/serviceability/${res.data.serviceabilityId}`]);
          this.loader.hide();
        }, (error) => {
          this.toastService.show('Error in starting process', 'Error in starting Serviceability process', 'danger');
        });
        break;
      }
    }
    this.matomoTracker.trackEvent('ProjectDetailsPage','WorkflowStart',`${compliance.name.toLowerCase()} Start` );
  }

  patchStart(compliance, index) {
    return new Promise<void>((resolve, reject) => {
      this.isStarting = true;
      this.hideme[index] = !this.hideme[index];

      const obj = {
        projectId: this.projectId,
        complianceItemId: compliance._id,
        progressStatus: 'Started',
        complianceType: compliance.complianceType
      };

      this.projectsDetailService.updateComplianceItemStatus(obj).subscribe(
        data => {
          this.hideme[index] = !this.hideme[index];
          this.projectsDetailService.setProjectDetails(data);
          // this.complianceItemsSortedData = this.combineCompilanceItems(data.complianceItems, data.additionalRequirements);
          
          switch (this.selectedTabIndex) {
            case 1:
              this.complianceItemsSortedData = this.combineCompilanceItems(data.additionalRequirements);
              break;
            case 2:
              this.complianceItemsSortedData = this.combineCompilanceItems(data.technicalStandardItems);
              break;
            default: 
              this.complianceItemsSortedData = this.combineCompilanceItems(data.complianceItems);
              break;
          }
          resolve();
        },
        err => {
          this.hideme[index] = !this.hideme[index];
          console.error('err', err);
        }
      );
    });
  }

  onViewComplianceItem(projectId: string, itemName: string) {
    if (itemName.toLowerCase() === 'accessibility') {
      this.router.navigate([`/accessibility-process/${projectId}`]);  
    } else {
      this.projectDataService.getComplianceIdByName(this.projectId, itemName, 'view', getNestedKeyValue(navigateTo[itemName.toLowerCase()], 'type'))
                                                .subscribe(complianceRes => {
        this.router.navigate([`/${getNestedKeyValue(navigateTo[itemName.toLowerCase()], 'route')}/${getNestedKeyValue(complianceRes, 'data', 'complianceItemId')}`]);
      }, () => {
        this.toastService.show('Error in data fetching', 'Error fetching the compliance item Id', 'danger');
      });
    }
  }

  manageComplianceItemPopup() {
    const initialState = {
      complianceItems: this.complianceItemsSortedData,
      projectId: this.route.snapshot.params.id
    };

    const manageComplianceDialog = this.dialog.open(ManageComplianceItemComponent, { data: initialState, width: '40vw', minHeight: '30vh', disableClose: true });
    manageComplianceDialog.afterClosed().subscribe(result => {
      if (result) {
        this.categorizeItems(result);
      }
    });
  }

  private categorizeItems(data): void {
    switch (this.selectedTabIndex) {
      case 1:
        this.complianceItemsSortedData = this.combineCompilanceItems(data.additionalRequirements);
        break;
      case 2:
        this.complianceItemsSortedData = this.combineCompilanceItems(data.technicalStandardItems);
        break;  
      default:
        this.complianceItemsSortedData = this.combineCompilanceItems(data.complianceItems);
        break;
    }
  }

  openCommentPopup(complianceItemName, userComment, complianceType, complianceItemId) {
    const initialState = {
      complianceName: complianceItemName,
      userComment,
      projectId: this.route.snapshot.params.id,
      complianceType,
      complianceItemId
    };

    const commentDialog = this.dialog.open(CommentPopupComponent, { data: initialState, width: '40vw', disableClose: true });
    commentDialog.afterClosed().subscribe(result => {
      const projectObject = this.projectsDetailService.getProjectDetails;
      this.categorizeItems(projectObject);
    });
  }

  updatecomplianceItemsSortedData(event) {
    this.complianceItemsSortedData = event;
    this.sortComplianceItemsOnInit();
    this.matomoTracker.trackEvent('ProjectDetailsPage','ManageWorkflow',"Update Acceptors/Owners");

  }

  combineCompilanceItems(complianceItems) {
    let applicableItems = [];
    let notApplicableItems = [];
    applicableItems = complianceItems.filter(element => element.selected);
    this.sortList(applicableItems, 'name');
    notApplicableItems = complianceItems.filter(element => !element.selected);
    this.sortList(notApplicableItems, 'name');
    return [...applicableItems, ...notApplicableItems];
  }

  sortList(list, property) {
    list.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTooltipDesc(name: string) {
    if (this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() == iterator.name.toLowerCase()) {
          return iterator.description;
        }
      }
    }
  }

  openTooltipModal(labelName) {
    const reusableIconInfoHelperGeneralCompliance = ['Accessibility', 'Revenue Recognition', 'Smart Licensing',
                                                     'Product Security, Privacy and Trust (CSDL)', 'Third Party Software Compliance & Risk Management (TPSCRM)', 'Export Compliance'];
    const reusableIconInfoHelperTechnologyBest = ['API Products', 'Telemetry', 'IPv6', 'Serviceability'];
    const reusableIconInfoHelperAdditionalRequirements = ['Communications Regulatory Compliance', 'Globalization'];
    let mainCategory = null;
    if (reusableIconInfoHelperGeneralCompliance.includes(labelName)) { mainCategory = 'applicableRequirements'; }
    if (reusableIconInfoHelperTechnologyBest.includes(labelName)) { mainCategory = 'technologyBestPractices'; }
    if (reusableIconInfoHelperAdditionalRequirements.includes(labelName)) { mainCategory = 'additionalRequirements'; }
    const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
      autoFocus: false,
      maxHeight: '96vh',
      width: '67vw',
      data: { workflowName: 'projectDashboard', stepName: mainCategory,
        title: labelName }
    });
    accInfoHelper.afterClosed().subscribe(result => {
    });
  }
}