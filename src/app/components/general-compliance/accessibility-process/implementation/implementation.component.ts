import { Component, OnInit, ViewChild, Input, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { NavigationTabsComponent } from '@cpdm-shared/components/navigation-tabs/navigation-tabs.component';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { MatDialog } from '@angular/material';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { EpicErrorComponent } from '@cpdm-shared/components/epic-error/epic-error.component';
import { FeatureErrorComponent } from '@cpdm-shared/components/feature-error/feature-error.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { ForbiddenErrorComponent } from '@cpdm-shared/components/forbidden-error/forbidden-error.component';

@Component({
  selector: 'app-implementation',
  templateUrl: './implementation.component.html',
  styleUrls: ['./implementation.component.scss'],
})

export class ImplementationComponent implements OnInit {
  pOimplFlag = false;
  pmStatusFlag = false;
  implementationDetailsForm: FormGroup;
  repoLoginForm: FormGroup;
  featuresDetails = '';
  defectsDetails = '';
  navTab = true;
  projectList: FormGroup;
  populateDetails = false;
  sendImplDetails = false;
  hideBottomButtons = false;
  disablePreviousBtn = false;
  disableNextBtn = true;
  repoPath: any;
  apiToken: any;
  toChoose = false;
  selection: any = null;
  items: any[] = [{ name: 'Rally', value: 'Rally' }, { name: 'Jira', value: 'Jira' }];
  customTab = [
    { tabNumber: 1, tabName: 'Manual implement / Push to repository', active: true, isEnabled: true },
    { tabNumber: 2, tabName: 'Send implementation details', active: false, isEnabled: false }
  ];
  selectedWorkspace: string;
  showWorkspacePath = false;
  toLogin = false;
  toPopulate = false;
  projectId = '';
  @Input() isPMscreen: boolean;
  isPopulated = false;
  disableRepo = false;
  isPopulatedByPM = false;
  errorInPopulate = false;
  populateError = '';
  implProgress = false;
  viewSentDetails = false;
  isNextBtn = true;
  showLoaderforBtn = false;
  // Jira
  jiraProjects: any = null;
  jiraSelectedProject: any = null;
  jiraProjectDetails: any = null;
  isTokenPresent = false;
  isJiraSelected = false;
  jiraSelectedServer: any = '';
  jiraIssueTypes: any = '';
  jiraSelectedIType: any = null;
  isIssueType = true;
  jiraTktInfo: any = null;
  // Rally
  rallyProjects: any = [];
  rallySelectedWSId: any = null;
  rallySelectedWSObj: any = null;
  rallySelectedProjectId: any = null;
  rallySelectedProjectObj: any = null;
  rallyWorkspaces: any = [];
  projectName: string;
  accessibilityObj: any;
  isProVisible = true;
  isWSVisible = true;
  // added to show loader while getting response from api
  isStepChangeSpinner: boolean;
  // tooltip
  resForInfoIcon: any = [];
  implementationDialog: any;
  jiraWorkspaceDialog: any;
  selectedImplMethod = 'pushToRepo';
  isManualImplTaskComplete = false;
  templates: Array<{ name: string, value: string }> = [
    { name: 'Rally Template', value: 'Rally' },
    { name: 'Jira Template', value: 'Jira' },
    { name: 'PRD Template', value: 'PRD' }
  ];
  msg = `The implementation details have been sent to the Accessibility Team. The test template will be generated for the Accessibility Team to start policy testing.<span>For any queries, contact <a href="mailto:accessibility@cisco.com">accessibility@cisco.com</a>.</span>`;
  @ViewChild(NavigationTabsComponent, { static: false }) tabs: NavigationTabsComponent;
  @ViewChild('rallyWorkspace', { static: false }) rallyWorkspace: TemplateRef<any>;
  @ViewChild('listProjects', { static: false }) listProjects: TemplateRef<any>;
  serverList: any[] = [];

  constructor(private projectsDataService: ProjectsDataService,
    public modalService: BsModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public cuiModalService: CuiModalService,
    private formBuilder: FormBuilder,
    private dataService: ProjectsDataService,
    private accessibilityService: AccessibilityProcessService,
    private userDetailsService: UserDetailsService,
    private dialog: MatDialog,
    private utilsService: UtilsService) { }

  ngOnInit() {
    this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });

    this.isStepChangeSpinner = false;
    this.implProgress = true;
    this.projectId = this.activatedRoute.snapshot.params.id;
    this.accessibilityService.getUpdatedAccessibilityObj(this.projectId).subscribe(obj => {
      this.accessibilityObj = obj[0];
      if (this.accessibilityObj.implementation !== undefined || null) {
        if (this.accessibilityObj.implementation.repository !== undefined || null &&
          this.accessibilityObj.implementation.repository) {
            const repository = this.accessibilityObj.implementation.repository;
            this.selection = (repository.source === "jira" ) ? "Jira": "Rally";
            this.selectedWorkspace = repository.workspacePath;
            this.showWorkspacePath = repository.workspacePath;
            this.isPopulated = true;
            this.toChoose = false;
            this.customTab[1].isEnabled = true;
            this.disableNextBtn = false;
            this.disableRepo = true;
            if (repository.source === 'Jira' || repository.source === 'jira') {
              this.isJiraSelected = true;
              this.getJiraServerList();
            }
            this.jiraSelectedServer = repository.jiraUrl;
        }

        if (this.accessibilityObj.implementation.sendDetails !== undefined || null &&
          this.accessibilityObj.implementation.sendDetails) {
          if (this.isPMscreen) {
            this.navTab = false;
            this.hideBottomButtons = true;
            this.populateDetails = false;
            this.sendImplDetails = false;
            this.pmStatusFlag = true;
          }
        }

        if (this.accessibilityObj.implementation.isManualImplementation) {
          this.selectedImplMethod = 'manual';
          this.isManualImplTaskComplete = true;
          this.customTab[1].isEnabled = true;
          this.disableNextBtn = false;
          this.showLoaderforBtn = false;
          this.errorInPopulate = true;
        }
      }

      this.getPOImpl();
      this.implementationDetailsForm = this.formBuilder.group({
        features: [''],
        defects: ['']
      });
      this.repoLoginForm = this.formBuilder.group({
        repoPath: ['', [Validators.required, this.validateURL]],
        apiToken: ['', [Validators.required, this.validateToken]]
      });
      this.projectList = this.formBuilder.group({
        project: ['', Validators.required]
      });
      this.isStepChangeSpinner = true;
    });
  }

  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() === iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      return desc;
    }
  }

  validateURL(control: AbstractControl): { [key: string]: any } | null {
    if (control.value) {
      if (control.value !== '' && (!control.value.startsWith('https://rally1.rallydev.com/#/')
        || !control.value.includes('dashboard'))) {
        return { invalidUrl: true };
      }
    }
    return null;
  }

  validateToken(control: AbstractControl): { [key: string]: any } | null {
    if (control.value) {
      if (control.value !== '' && (!control.value.startsWith('_') || control.value.length !== 43)) {
        return { invalidToken: true };
      }
    }
    return null;
  }

  onSelection(): void {
    this.jiraSelectedServer = '';
    this.populateError = '';
    if (this.selection != null && this.selection !== 'none') {
      this.toLogin = false;
      this.toChoose = true;
      this.isJiraSelected = false;
      this.selectedWorkspace = '';

      if (this.selection === 'Jira') {
        this.isJiraSelected = true;
        this.toChoose = false;
        this.toPopulate = false;
        this.toLogin = false;
        this.getJiraServerList();
      }

      if (this.selection === 'Rally') {
        this.isJiraSelected = false;
        this.toChoose = false;
        this.toPopulate = false;
        this.toLogin = false;
        this.getTokenStatus('rally', null);
      }
    } else {
      this.isJiraSelected = false;
      this.toLogin = false;
      this.toChoose = true;
      this.toPopulate = false;
      this.isPopulated = false;
      this.customTab[1].isEnabled = false;
      this.disableNextBtn = true;
      this.errorInPopulate = false;
      this.showWorkspacePath = false;
    }
  }

  getJiraServerList() {
    this.accessibilityService.getJiraServerList().subscribe(res => {
      const result = res.map((el) => {
        const o = Object.assign({}, el);
        o.jiraNameURL = el.serverName + ' - ' + el.serverURL;
        return o;
      });
      this.serverList = result;
    });
  }

  onServerSelection() {
    this.toLogin = false;
    if (this.jiraSelectedServer) {
      this.getTokenStatus('jira', this.jiraSelectedServer);
      this.toChoose = false;
      this.selectedWorkspace = '';
      this.populateError = '';
    }
  }

  onProjectSelection(): void {
    this.getTokenStatus('jira', this.jiraSelectedServer);
    this.toLogin = !this.isTokenPresent;
    this.selectedWorkspace = '';
    this.jiraIssueTypes = [];
    this.jiraSelectedIType = '';
    this.populateError = '';

    if (this.jiraProjects) {
      this.jiraProjectDetails = this.jiraProjects.find(o => o.key === this.jiraSelectedProject);
    }
    if (this.jiraProjectDetails && this.jiraSelectedProject !== 'No Selection') {
      this.isIssueType = true;
      this.selectedWorkspace = this.jiraProjectDetails.projectTypeKey + ' / ' + this.jiraProjectDetails.name;

      this.accessibilityService.getJiraIssueTypeMeta(this.jiraSelectedServer, this.jiraSelectedProject).subscribe(res => {
        this.jiraIssueTypes = res;
        this.isIssueType = false;
      }, (err) => {
        this.errorInPopulate = true;
        this.isIssueType = false;
        this.dialog.open(ForbiddenErrorComponent, {
          width: '35vw',
          height: 'auto'
        });
      });
    } else {
      this.jiraSelectedIType = '';
    }
    this.toPopulate = (this.jiraSelectedIType !== '' && this.jiraSelectedProject !== '');
  }

  viewBacklog(content) {
    this.getBacklogDetails();
  }

  onITypeSelection(): void {
    this.jiraSelectedIType = (this.jiraSelectedIType === undefined || this.jiraSelectedIType === null) ? '' : this.jiraSelectedIType;
    this.toPopulate = (this.jiraSelectedIType !== '' && this.jiraSelectedIType !== 'No Selection' && this.jiraSelectedProject !== '');
  }

  viewDetails(content) {
    this.getBacklogDetails();
  }

  login(content) {
    this.toChoose = false;
    this.populateError = '';
    this.showLoaderforBtn = true;

    if (this.selection === 'Jira') {
      this.toLogin = false;
      this.accessibilityService.connectJira(this.jiraSelectedServer).subscribe(res => {
        window.open(`${res.url}`, 'OAouth JIRA', 'directories=no,titlebar="CPDM Ng : OAouth JIRA",toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=450');
        this.toLogin = false;
        this.toChoose = true;
        this.showLoaderforBtn = false;
      }, (err) => {
        this.errorInPopulate = true;
        this.dialog.open(ForbiddenErrorComponent, {
          width: '35vw',
          height: 'auto'
        });
        this.toLogin = true;
        this.showLoaderforBtn = false;
      });
    } else {
      // Rally oauth
      this.accessibilityService.connectRally().subscribe(res => {
        window.open(`${res.url}`, 'OAouth RALLY', 'directories=no,titlebar="CPDM Ng : OAouth RALLY",toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=450');
        this.toLogin = false;
        this.toChoose = true;
      }, (err) => {
        this.errorInPopulate = true;
        this.populateError = 'Please refresh the page';
        this.showLoaderforBtn = false;
      });
    }
    this.showLoaderforBtn = false;
  }

  // for jira
  chooseProject(content) {
    this.populateError = '';
    this.selectedWorkspace = '';
    this.jiraSelectedProject = null;
    this.jiraSelectedIType = '';
    this.isProVisible = true;
    this.isIssueType = true;
    this.jiraProjects = [];
    this.accessibilityService.getJiraPorjects(this.jiraSelectedServer).subscribe(res => {
      if (res.error && res.error.status === 401) {
        this.dialog.open(ForbiddenErrorComponent, {
          width: '35vw',
          height: 'auto'
        });
        return;
      }
      this.jiraProjects = res.data;
      this.showWorkspacePath = true;
      this.isIssueType = false;
      this.isProVisible = false;
      this.toLogin = false;
    }, (error) => {
      if (error.error.status === 401) {
        this.dialog.open(ForbiddenErrorComponent, {
          width: '35vw',
          height: 'auto'
        });
      }
    });
    this.openJiraDialog();
  }

  private openJiraDialog() {
    this.jiraWorkspaceDialog = this.dialog.open(this.listProjects, {
      width: '50rem',
      height: '28rem',
      disableClose: true
    });

    this.jiraWorkspaceDialog.afterClosed().subscribe(result => {
    });
  }

  // rally choose workspace
  chooseRallyWorkspace(content) {
    this.populateError = '';
    this.rallySelectedWSId = null;
    this.rallySelectedProjectId = null;
    this.isWSVisible = true;
    this.isProVisible = true;
    this.rallyWorkspaces = [];
    this.getWorkspaceData();
    this.showWorkspacePath = true;
    this.toPopulate = false;
    if (this.rallySelectedWSId && this.rallySelectedProjectId) {
      this.toPopulate = true;
    }
    this.openRally();
  }

  private openRally() {
    this.implementationDialog = this.dialog.open(this.rallyWorkspace, {
      width: '50rem',
      height: '28rem'
    });

    this.implementationDialog.afterClosed().subscribe(result => {
    });
  }

  populateBacklog() {
    this.projectsDataService.getProjectDetails(this.projectId).subscribe(result => {
      this.projectName = result.name;
      this.doPopulateBacklog();
    }, (err) => { console.error(err); });
  }

  /**
   * Radio button to switch between implementation methods
   */
  onImplMethodChange() {
    if (this.selectedImplMethod === 'pushToRepo' && this.accessibilityObj.implementation && this.accessibilityObj.implementation.populateBacklog) {
      this.disableNextBtn = false;
    } else if (this.selectedImplMethod === 'manual') {
      if (this.accessibilityObj.implementation && this.accessibilityObj.implementation.isManualImplementation) {
        this.isManualImplTaskComplete = true;
        this.disableNextBtn = false;
      } else if (this.isManualImplTaskComplete) {
        this.disableNextBtn = false;
      } else {
        this.disableNextBtn = true;
      }
    } else {
      this.disableNextBtn = true;
    }
  }

  /**
  * Downloads template CSV file
   */
  async onDownloadTemplate(event: { selectedTemplate: string }) {
    try {
      const filename = event.selectedTemplate == "PRD" ? `${event.selectedTemplate}_AccessibilityTemplate.csv` : `${event.selectedTemplate}_AccessibilityImportTemplate.csv`;
      this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}/${this.projectId}`, filename);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Once PM finishes with manual process
   */
  onCompleteManualImplTask(event: { target: { checked: boolean } }) {
    this.isManualImplTaskComplete = event.target.checked;
    this.disableNextBtn = this.isManualImplTaskComplete ? false : true;
  }

  previousTab() {
    this.tabs.previousTab();
    this.disableNextBtn = false;
    this.isNextBtn = true;
  }

  // rally choose project and workspace popup
  onRallyWSChange(): void {
    if (!this.rallySelectedWSId || !this.rallySelectedProjectId) {
      this.toPopulate = false;
    }
    this.isProVisible = true;
    this.selectedWorkspace = '';
    this.rallySelectedWSObj = {
      ...(this.rallyWorkspaces.filter((i) => {
        return i.ObjectID === this.rallySelectedWSId;
      }))[0]
    };

    this.rallyProjects = [];
    this.accessibilityService.getRallyPorjects(this.rallySelectedWSObj._ref).subscribe(res => {
      this.rallyProjects = [];
      this.rallySelectedProjectId = null;
      if (res.QueryResult.Results.length > 0) {
        this.rallyProjects = res.QueryResult.Results;
      }
      this.showWorkspacePath = true;
      this.toLogin = false;
      this.isProVisible = false;
    });
  }

  onRallyProjectSelection(): void {
    this.toPopulate = false;
    this.rallySelectedProjectObj = {
      ...(this.rallyProjects.filter((i) => {
        return i._refObjectUUID === this.rallySelectedProjectId;
      }))[0]
    };
    this.selectedWorkspace = (this.rallySelectedProjectObj._refObjectName && this.rallySelectedWSObj._refObjectName) ? `${this.rallySelectedWSObj._refObjectName} / ${this.rallySelectedProjectObj._refObjectName} ` : '';
    if (this.selectedWorkspace !== '') {
      this.toPopulate = true;
    }
    this.getTokenStatus('rally', null);
    this.toLogin = !this.isTokenPresent;
    this.isProVisible = false;
  }

  sendToPO() {
    if (this.isNextBtn) {
      if (this.selectedImplMethod === 'manual' && this.isManualImplTaskComplete) {
        if (this.accessibilityObj.implementation && this.accessibilityObj.implementation.isManualImplementation) {
          this.enableAndVisitNextTab();
        } else {
          const featureObj = {
            cecId: this.userDetailsService.getLoggedInCecId(),
            accessibilityProjectId: this.activatedRoute.snapshot.params.id
          };
          this.accessibilityService.sendManualImplObjectByPM(featureObj).subscribe(res => {
            this.enableAndVisitNextTab();
          }, (err) => { });
        }
      } else {
        this.isNextBtn = false;
        this.tabs.nextTab();
      }
    } else {
      this.updateImplStatus();
    }
  }

  enableAndVisitNextTab() {
    this.customTab[1].isEnabled = true;
    this.tabs.nextTab();
    this.disableNextBtn = false;
    this.showLoaderforBtn = false;
    this.errorInPopulate = true;
  }

  updateImplStatus() {
    this.navTab = false;
    this.hideBottomButtons = true;
    const commentsObj = {
      accessibilityProjectId: this.activatedRoute.snapshot.params.id,
      featureImplStatus: 'Complete',
      sendDetails: {
        featuresImpl: this.implementationDetailsForm.value.features,
        defectFixed: this.implementationDetailsForm.value.defects,
      }
    };

    const logginUserObj = { userObj: this.userDetailsService.currentUserValue };
    const headers = {
      adrProcess: 'adrImplement',
      user: logginUserObj
    };
    this.accessibilityService.sendImplStatusByPM(commentsObj, headers).subscribe((res) => {
      this.accessibilityService.enableNextSidebarItem('policyTesting');
      this.accessibilityService.updateProgressScore(this.activatedRoute.snapshot.params.id, { progressScore: 50 }, 'implementation').subscribe(() => {
        sessionStorage.removeItem('implementationStatus');
      });
    }, (err) => {
      console.error('error');
    });

    if (this.implementationDetailsForm.value.features === '' || null === this.implementationDetailsForm.value.features) {
      this.featuresDetails = 'No comments on features';
    } else {
      this.featuresDetails = this.implementationDetailsForm.value.features;
    }
    if (this.implementationDetailsForm.value.defects === '' || null === this.implementationDetailsForm.value.defects) {
      this.defectsDetails = 'No comments on defects';
    } else {
      this.defectsDetails = this.implementationDetailsForm.value.defects;
    }
    this.sendImplDetails = false;
    this.pmStatusFlag = true;
  }

  getPOImpl(): void {
    if (this.accessibilityObj.implementation) {
      if (this.accessibilityObj.implementation.populateBacklog) {
        this.isPopulatedByPM = true;
      }
      if (this.accessibilityObj.implementation.sendDetails) {
        if (getNestedKeyValue(this.accessibilityObj, 'workflowTimestamp', 'policyTesting') === undefined) {
          this.accessibilityService.enableNextSidebarItem('policyTesting');
        }
        this.implProgress = false;
        this.viewSentDetails = true;
        this.featuresDetails = this.accessibilityObj.implementation.sendDetails.featuresImpl;
        this.defectsDetails = this.accessibilityObj.implementation.sendDetails.defectFixed;
        this.featuresDetails = this.featuresDetails ? this.featuresDetails : 'No comments on features';
        this.defectsDetails = this.defectsDetails ? this.defectsDetails : 'No comments on defects';
      }
    }
  }

  onTabChanged(event) {
    this.disablePreviousBtn = event.disablePreviousBtn;
    this.disableNextBtn = true;

    for (const tab of this.customTab) {
      if (event.currentTabNumber === 1 && this.customTab[1].isEnabled) {
        this.disableNextBtn = false;
        this.isNextBtn = true;
        break;
      } else if (event.currentTabNumber === this.customTab.length) {
        this.disableNextBtn = false;
        this.isNextBtn = false;
        break;
      }
    }

    for (const tab of this.customTab) {
      if (tab.active && tab.isEnabled) {
        this.switchScreen(tab.tabNumber);
        break;
      }
    }
  }

  switchScreen(tabNumber: number) {
    switch (tabNumber) {
      case 1:
        this.populateDetails = true;
        this.sendImplDetails = false;
        break;
      case 2:
        this.populateDetails = false;
        this.sendImplDetails = true;
        break;
    }
  }

  getTokenStatus(app, jiraUrl) {
    this.accessibilityService.isTokenPresent(app, jiraUrl).subscribe(res => {
      this.isTokenPresent = res;
      this.toLogin = jiraUrl === 'No Selection' ? false : !res;
      if (this.isTokenPresent) {
        this.toChoose = true;
      }
    }, (error) => {
      this.dialog.open(ForbiddenErrorComponent, {
        width: '35vw',
        height: 'auto'
      });
    });
  }

  getWorkspaceData() {
    this.rallyWorkspaces = [];
    this.accessibilityService.getWorkspaces().subscribe(res => {
      this.rallyWorkspaces = res.QueryResult.Results;
      this.isWSVisible = false;
      this.isProVisible = false;
    });
  }

  doPopulateBacklog() {
    this.showLoaderforBtn = true;
    this.errorInPopulate = false;

    if (this.selection === 'Jira') {
      const issueData = {
        jiraProjectId: this.jiraProjectDetails.id,
        jiraProjectKey: this.jiraProjectDetails.key,
        jiraIssueName: this.projectName,
        accessibilityProjectId: this.activatedRoute.snapshot.params.id,
        jiraWorkspace: this.selectedWorkspace,
        jiraIssueTypeName: this.jiraSelectedIType,
        jiraUrl: this.jiraSelectedServer
      };

      this.accessibilityService.createJiraIssue(issueData).subscribe(res => {
        this.accessibilityObj = res.data.responseData;
        if (res.error === '') {
          this.isPopulatedByPM = true;
          this.isPopulated = true;
          this.customTab[1].isEnabled = true;
          this.disableNextBtn = false;
          this.toLogin = false;
          this.showLoaderforBtn = false;
          this.toPopulate = false;
          this.toChoose = false;
          this.disableRepo = true;
        } else {
          this.customTab[1].isEnabled = true;
          this.disableNextBtn = false;
          this.showLoaderforBtn = false;
        }
      }, (err) => {
        this.errorInPopulate = true;
        this.populateError = 'Please try again';
        this.showLoaderforBtn = false;
        if (err.status == 424) {
          this.dialog.open(EpicErrorComponent, {
            data: { errorMsg: err.error.error },
            width: '35vw',
            height: 'auto'
          });
        } else {
          this.dialog.open(GenericErrorComponent, {
            data: { errorMsg: 'Epic in JIRA' },
            width: '35vw',
            height: 'auto'
          });
        }
      });
      return;
    }
    const featureObj = {
      cecId: this.userDetailsService.getLoggedInCecId(),
      selectedWorkspace: this.selectedWorkspace,
      apiKey: 'nothing',
      featureName: this.projectName,
      projectId: this.rallySelectedProjectObj.ObjectID,
      accessibilityProjectId: this.activatedRoute.snapshot.params.id,
      state: '130199877184',
      workspaceRef: this.rallySelectedWSObj._ref
    };

    this.accessibilityService.sendFeatureObjectByPM(featureObj).subscribe(res => {
      this.accessibilityObj = res.data.responseData;
      if (res.error === '') {
        this.showLoaderforBtn = false;
        this.errorInPopulate = false;
        this.isPopulated = true;
        this.isPopulatedByPM = true;
        this.customTab[1].isEnabled = true;
        this.disableNextBtn = false;
        this.toLogin = false;
        this.toPopulate = false;
        this.toChoose = false;
        this.disableRepo = true;
      } else {
        this.customTab[1].isEnabled = true;
        this.disableNextBtn = false;
        this.showLoaderforBtn = false;
        this.errorInPopulate = true;
      }
    }, (err) => {
      this.populateError = 'Please try again';
      if (err.status == '424') {
        this.populateError = 'Feature not created';
        this.dialog.open(FeatureErrorComponent, {
          data: { errorMsg: err.error.error },
          width: '35vw',
          height: 'auto'
        });
      } else {
        this.dialog.open(GenericErrorComponent, {
          data: { errorMsg: 'Feature in RALLY' },
          width: '35vw',
          height: 'auto'
        });
      }
      this.showLoaderforBtn = false;
      this.errorInPopulate = true;
    });
  }

  getBacklogDetails() {
    this.accessibilityService.getBacklogDetails(this.projectId).subscribe(res => {

      if (res && res.implementation && res.implementation.repository) {
        let parentUrl = '';
        if (res.implementation.repository.details && res.implementation.repository.source === 'jira') {
          parentUrl = `${res.implementation.repository.jiraUrl}/browse/${res.implementation.repository.jiraParent}`;
        } else {
          parentUrl = `https://rally1.rallydev.com/#/${res.implementation.repository.rallyProjectId}d/detail/portfolioitem/feature/${res.implementation.repository.rallyParentId}`;
        }
        const w = window.open(`${parentUrl}`, '_blank');
        w.opener = null;
        w.focus();
      }
    });
  }
}
