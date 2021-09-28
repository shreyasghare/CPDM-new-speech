import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { AccessibilityProcessService } from '@cpdm-service/general-compliance/accessibility/accessibility-process.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { WebApiModel } from '@cpdm-model/technology-best-practices/web-api/webApiModel.model';
import { ForbiddenErrorComponent } from '@cpdm-shared/components/forbidden-error/forbidden-error.component';
import { InfoHelperComponent } from '@cpdm-component/general-compliance/revenue-recognition/shared/info-helper/info-helper.component';


@Component({
    selector: 'app-push-to-repository',
    templateUrl: './push-to-repository.component.html',
    styleUrls: ['./push-to-repository.component.scss']
})
export class PushToRepositoryComponent implements OnInit {
    @Input() enableAdditionalFields: boolean;
    @Input() repositories: { name: string, value: string };
    @Input() populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean };
    @Input() implementationDetails: WebApiModel;
    @Output() populate = new EventEmitter();
    @ViewChild('rallyWorkspaceTemplate', { static: false }) rallyWorkspaceTemplate: TemplateRef<any>;
    @ViewChild('jiraProjectTemplate', { static: false }) jiraProjectTemplate: TemplateRef<any>;

    serverList = [];
    rallyWorkspaceList = [];
    jiraProjectList = [];
    selectedWorkspaceProjectList = [];
    jiraIssueTypeList = [];
    infoIconData = [];
    infoHelperData: any;
    selectedWorkspaceObject: { ObjectID: string, _ref: string, _refObjectName: string };
    selectedWorkspaceProjectObject: { ObjectID: string, _refObjectName: string };
    SelectedJiraProjectObject: { id: string, key: string, projectTypeKey: string, name: string };
    implementationDialog;

    selectedLanguage = '';
    selectedRepository = '';
    selectedJiraServer = '';
    selectedWorkspaceId = '';
    selectedWorkspaceProjectId = '';
    selectedJiraProjectId = '';
    selectedIssueType = '';
    workspacePath = '';
    otherDetails = '';

    isTokenPresent = false;
    canLogin = false;
    canChoose = false;
    isBtnReady = false;
    isWorkspacesPopulateDone = true;
    isProjectsPopulateDone = true;
    isIssueTypePopulatedDone = true;

    constructor(private accessibilityService: AccessibilityProcessService,
        public cuiModalService: CuiModalService,
        private dialog: MatDialog,
        private projectsDataService: ProjectsDataService,
        private userDetails: UserDetailsService) { }

    ngOnInit() {
        if (this.enableAdditionalFields) {
            this.selectedLanguage = 'java'
        }
        if (this.implementationDetails) {
            if (this.implementationDetails.implementation && this.implementationDetails.implementation.repository) {
                if (this.implementationDetails.implementation.repository.source) {
                    const source = this.implementationDetails.implementation.repository.source;
                    this.selectedRepository = source.charAt(0).toUpperCase() + source.slice(1);
                }
                this.getJiraServerList();
                this.selectedJiraServer = this.implementationDetails.implementation.repository.jiraServer;
                if (this.implementationDetails.implementation.repository.workspacePath) {
                    this.workspacePath = this.implementationDetails.implementation.repository.workspacePath;
                }
                if (this.implementationDetails.implementation.repository.productLanguage) {
                    this.selectedLanguage = this.implementationDetails.implementation.repository.productLanguage;
                }
                if (this.implementationDetails.implementation.repository.otherDetails) {
                    this.otherDetails = this.implementationDetails.implementation.repository.otherDetails;
                }
                this.isBtnReady = true;
            }
        }
        this.projectsDataService.getItemDesc('tooltip').subscribe(res => {
            this.infoIconData = res;
        });
    }

    getTooltipDesc(name: string) {
        let desc: string;
        if (this.infoIconData.length > 0) {
            for (const iterator of this.infoIconData) {
                if (name.toLowerCase() === iterator.name.toLowerCase()) {
                    desc = iterator.description;
                    break;
                }
            }
            return desc;
        }
    }

    /**
     * Executes on selection of repository
     */
    onRepositorySelection() {
        if (this.selectedRepository === 'Jira') {
            this.clearRallySelections();
            this.canChoose = false;
            // Get Jira server list if already not loaded
            if (this.serverList.length === 0) {
                this.isBtnReady = false;
                this.getJiraServerList();
            }
        } else if (this.selectedRepository === 'Rally') {
            this.clearJiraSelections();
            this.isBtnReady = false;
            this.getTokenStatus('rally', null);
        } else {
            this.clearRallySelections();
            this.selectedJiraServer = '';
            this.canLogin = false;
        }
    }

    /**
     * Clears Rally form data
     */
    private clearRallySelections() {
        this.workspacePath = '';
        this.selectedWorkspaceProjectId = '';
        this.selectedWorkspaceId = '';
    }

    /**
     * Clears Jira form data
     */
    private clearJiraSelections() {
        this.workspacePath = '';
        this.selectedJiraServer = '';
        this.selectedJiraProjectId = '';
        this.selectedIssueType = '';
    }

    /**
     * Executes on selection of Jira server
     */
    onServerSelection() {
        if (this.selectedJiraServer) {
            this.isBtnReady = false;
            this.getTokenStatus('jira', this.selectedJiraServer);
        }
    }

    /**
     * Get application token
     */
    private getTokenStatus(app: string, url: string) {
        this.accessibilityService.isTokenPresent(app, url).subscribe(res => {
            this.isTokenPresent = res;
            this.canLogin = !res;
            this.canChoose = res;
            this.isBtnReady = true;
        }, err => {
            this.dialog.open(ForbiddenErrorComponent, { width: '35vw', height: 'auto', disableClose: true });
        });
    }

    /**
     * Login to Jira/Rally
     */
    loginToRepository() {
        if (this.selectedRepository === 'Jira') {
            this.accessibilityService.connectJira(this.selectedJiraServer).subscribe(res => {
                window.open(`${res.url}`, 'OAouth JIRA', `directories=no,titlebar="CPDM Ng : OAouth JIRA",
                toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=450`);
            }, err => {
                this.dialog.open(ForbiddenErrorComponent, { width: '35vw', height: 'auto', disableClose: true });
                this.canLogin = true;
                this.canChoose = false;
            });
        } else {
            this.accessibilityService.connectRally().subscribe(res => {
                window.open(`${res.url}`, 'OAouth RALLY', `directories=no,titlebar="CPDM Ng : OAouth RALLY",
                toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=450`);
                this.canLogin = false;
                this.canChoose = true;
            }, err => {
                this.canLogin = true;
                this.canChoose = false;
            });
        }
    }

    /**
     * Get Jira servers
     */
    private getJiraServerList() {
        this.accessibilityService.getJiraServerList().subscribe(res => {
            this.serverList = res.map(item => {
                const server = Object.assign({}, item);
                server.jiraNameURL = `${item.serverName} - ${item.serverURL}`;
                return server;
            });
            this.isBtnReady = true;
        });
    }

    /**
     * Choose action for Rally and Jira
     */
    choose() {
        if (this.selectedRepository === 'Rally') {
            this.chooseRallyWorkspace();
        } else if (this.selectedRepository === 'Jira') {
            this.chooseJiraProject();
        }
    }

    /**
     * Selects rally workspace
     */
    private chooseRallyWorkspace() {
        if (this.rallyWorkspaceList.length === 0) {
            this.isWorkspacesPopulateDone = false;
            this.getWorkspaceData();
        }
        this.openDialog();
    }

    /**
     * Selects jira project
     */
    private chooseJiraProject() {
        if (this.jiraProjectList.length === 0) {
            this.isProjectsPopulateDone = false;
            this.getProjectData();
        }
        this.openDialog();
    }

    /**
     * Get rally workspace list
     */
    private getWorkspaceData() {
        this.accessibilityService.getWorkspaces().subscribe(res => {
            this.rallyWorkspaceList = res.QueryResult.Results;
            this.isWorkspacesPopulateDone = true;
        });
    }

    /**
     * Get jira project list
     */
    private getProjectData() {
        this.accessibilityService.getJiraPorjects(this.selectedJiraServer).subscribe(res => {
            if (res.error === '') {
                this.jiraProjectList = res.data;
                this.isProjectsPopulateDone = true;
            }
        });
    }

    /**
     * Opens rally workspace template to select workspace and project
     */
    private openDialog() {
        if (this.selectedRepository === 'Rally') {
            this.implementationDialog = this.dialog.open(this.rallyWorkspaceTemplate, {
                width: '50rem',
                height: '28rem'
            });
        } else if (this.selectedRepository === 'Jira') {
            this.implementationDialog = this.dialog.open(this.jiraProjectTemplate, {
                width: '50rem',
                height: '28rem'
            });
        }
    }

    /**
     * Select workspace
     */
    onWorkspaceSelection() {
        this.isProjectsPopulateDone = false;
        this.selectedWorkspaceProjectId = '';
        this.workspacePath = '';

        this.selectedWorkspaceObject = {
            ...(this.rallyWorkspaceList.filter(i => {
                return i.ObjectID === this.selectedWorkspaceId;
            }))[0]
        };

        this.accessibilityService.getRallyPorjects(this.selectedWorkspaceObject._ref).subscribe(res => {
            if (res.QueryResult.Results.length > 0) {
                this.selectedWorkspaceProjectList = res.QueryResult.Results;
            }
            this.isProjectsPopulateDone = true;
        });
    }

    /**
     * Select project from workspace
     */
    onWorkspaceProjectSelection() {
        this.selectedWorkspaceProjectObject = {
            ...(this.selectedWorkspaceProjectList.filter(i => {
                return i._refObjectUUID === this.selectedWorkspaceProjectId;
            }))[0]
        };

        this.workspacePath = this.selectedWorkspaceProjectObject._refObjectName && this.selectedWorkspaceObject._refObjectName ? ` ${this.selectedWorkspaceObject._refObjectName} / ${this.selectedWorkspaceProjectObject._refObjectName}` : '';
        this.getTokenStatus('rally', null);
    }

    /**
     * Select Jira project
     */
    onJiraProjectSelection() {
        this.isIssueTypePopulatedDone = false;
        this.workspacePath = '';
        this.selectedIssueType = '';
        if (this.jiraProjectList.length > 0) {
            this.SelectedJiraProjectObject = this.jiraProjectList.find(project => project.key === this.selectedJiraProjectId);
            this.accessibilityService.getJiraIssueTypeMeta(this.selectedJiraServer, this.selectedJiraProjectId).subscribe(res => {
                this.jiraIssueTypeList = res.filter(item => item.name !== 'Epic');
                this.isIssueTypePopulatedDone = true;
            }, err => {
                console.log(err);
                this.isIssueTypePopulatedDone = true;
            });
        }
    }

    /**
     * Select issue type
     */
    onIssueTypeSelection() {
        if (this.selectedIssueType) {
            this.workspacePath = `${this.SelectedJiraProjectObject.projectTypeKey} / ${this.SelectedJiraProjectObject.name}`;
        }
    }

    populateBacklog() {
        this.populateBacklogStatus.isPopulating = true;
        this.populateBacklogStatus.isBacklogPopulated = false;
        let featureObj;
        if (this.selectedRepository === 'Rally') {
            featureObj = {
                selectedRepo: this.selectedRepository.toLowerCase(),
                userId: this.userDetails.getLoggedInCecId(),
                rallyProjectId: this.selectedWorkspaceProjectObject.ObjectID,
                _id: this.implementationDetails._id,
                selectedWS: this.selectedWorkspaceObject._ref,
                workspaceId: this.selectedWorkspaceObject.ObjectID,
                projectId: this.implementationDetails.projectId,
                workspacePath: this.workspacePath
            };
        } else if (this.selectedRepository === 'Jira') {
            featureObj = {
                selectedRepo: this.selectedRepository.toLowerCase(),
                userId: this.userDetails.getLoggedInCecId(),
                jiraProjectId: this.SelectedJiraProjectObject.id,
                _id: this.implementationDetails._id,
                jiraProjectKey: this.SelectedJiraProjectObject.key,
                jiraIssueTypeName: this.selectedIssueType,
                jiraUrl: this.selectedJiraServer,
                projectId: this.implementationDetails.projectId,
                workspacePath: this.workspacePath
            };
        }
        if (this.selectedLanguage) {
            featureObj["language"] = this.selectedLanguage;
            featureObj["otherDetails"] = this.otherDetails;
        }
        this.populate.emit(featureObj);
    }

    /**
     * View populated Backlog
     */
    onViewBacklog() {
        let parentUrl: string;
        if (this.implementationDetails.implementation && this.implementationDetails.implementation.repository) {
            if (this.selectedRepository === 'Rally') {
                parentUrl = `https://rally1.rallydev.com/#/${this.implementationDetails.implementation.repository.rallyProjectId}ud/portfolioitemstreegrid?detail=/portfolioitem/feature/${this.implementationDetails.implementation.repository.rallyParentId}`;
            } else if (this.selectedRepository === 'Jira') {
                parentUrl = `${this.implementationDetails.implementation.repository.jiraServer}/browse/${this.implementationDetails.implementation.repository.jiraParent}`;
            }
            const w = window.open(`${parentUrl}`, '_blank');
            w.opener = null;
            w.focus();
        }
    }
    showInfoModal(event): void {
        event.name = `${event.name}`;
        this.infoHelperData = event;
        this.openDialogForInfoIcon();
    }

    openDialogForInfoIcon(): void {
        const dialogRef = this.dialog.open(InfoHelperComponent, {
            width: '30vw', height: 'auto',
            data: { complianceName: 'Smart Licensing', stepName: this.infoHelperData.name }
        });
    }
}
