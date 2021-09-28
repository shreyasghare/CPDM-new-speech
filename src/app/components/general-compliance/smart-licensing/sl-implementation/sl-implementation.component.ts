import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Role } from '@cpdm-model/role';
import { SmartLicensingModel } from '../models/SmartLicensingModel';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
    selector: 'app-sl-implementation',
    templateUrl: './sl-implementation.component.html',
    styleUrls: ['./sl-implementation.component.scss']
})
export class SlImplementationComponent implements OnInit {
    role = Role;

    smartLicensingId = '';
    selectedImplMethod = 'pushToRepo';

    isStepInitiated: boolean;
    isManualTaskComplete = false;
    enableAdditionalFields = true;
    infoIconData = [];

    slImplementation_status: { icon: string; status: string } = {
        icon: 'chevron',
        status: 'Implementation is not applicable'
    };
    implementationStatus: string;
    confirmationDialogRef: any;
    smartLicensingDetails: SmartLicensingModel;

    templates: Array<{ name: string, value: string }> = [
        { name: 'Rally Template', value: 'Rally' },
        { name: 'Jira Template', value: 'Jira' },
        { name: 'PRD Template', value: 'PRD' }
    ];
    repositories: Array<{ name: string, value: string }> = [
        { name: 'Rally', value: 'Rally' },
        { name: 'Jira', value: 'Jira' }
    ];

    populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean } = {
        isPopulating: false,
        isBacklogPopulated: false
    };
    disableImplementationMethod: { manual: boolean, pushToRepo: boolean } = {
        manual: false,
        pushToRepo: false
    };
    confirmationObj: { confirmationText: string } = {
        confirmationText: 'Are you sure you want to complete implementation task?'
    };

    constructor(private activatedRoute: ActivatedRoute,
        private smartLicensingService: SmartLicensingService,
        private utilsService: UtilsService,
        private spinnerService: SpinnerService,
        public dialog: MatDialog,
        private projectsDataService: ProjectsDataService) { }

    ngOnInit() {
        this.isStepInitiated = false;
        this.smartLicensingId = this.activatedRoute.snapshot.params.id;
        this.getSmartLicensingDetails();
        this.getimplementationStatus();
        this.projectsDataService.getItemDesc('tooltip').subscribe(res => {
            this.infoIconData = res;
        });
    }

    /**
     * Get tooltip data
     */
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
     * Get smart licensing details
     */
    private getSmartLicensingDetails() {
        this.smartLicensingService.getBacklogDetails(this.smartLicensingId).subscribe((res: { success: boolean, data: SmartLicensingModel }) => {
            const { success, data } = res;
            if (success) {
                this.smartLicensingDetails = data;
                this.checkAndDisableImplementationMethod();
                this.loadManualImplementationFormData();
                this.loadPushToRepoFormData();
                this.isStepInitiated = true;
            }
        });

    }

    getimplementationStatus() {
        this.spinnerService.show();
        this.smartLicensingService.getSmartLicensingData(this.smartLicensingId).subscribe(res => {
            const { success, data } = res;
            if (success) {
                if (data && data.status && data.status.hasOwnProperty('implementation')) {
                    this.implementationStatus = getNestedKeyValue(data, 'status', 'implementation');
                }
                else {
                    this.implementationStatus = '';
                }
                this.spinnerService.hide();
            }
        }, err => {
            this.spinnerService.show();
            console.error(err);
        });
    }

    /**
     * On step completion, disables implementation method which is not completed
     */
    private checkAndDisableImplementationMethod() {
        if (this.smartLicensingDetails.workflowTimestamp && this.smartLicensingDetails.workflowTimestamp.implementation) {
            if (this.smartLicensingDetails.implementation &&
                this.smartLicensingDetails.implementation.isManualImplementation &&
                !this.smartLicensingDetails.implementation.populateBacklog) {
                // Disables pushToRepo method as no backlog data found
                this.disableImplementationMethod.pushToRepo = true;
            } else if (this.smartLicensingDetails.implementation &&
                this.smartLicensingDetails.implementation.populateBacklog &&
                !this.smartLicensingDetails.implementation.isManualImplementation) {
                // Disables manual method as it is not finished
                this.disableImplementationMethod.manual = true;
            }
        }
    }

    /**
     * Load data into push to repo step
     */
    loadPushToRepoFormData() {
        if (this.smartLicensingDetails.implementation && this.smartLicensingDetails.implementation.populateBacklog) {
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = true;
        }
    }

    /**
     * Load data in manual implementation step
     */
    loadManualImplementationFormData() {
        if (this.smartLicensingDetails.implementation && this.smartLicensingDetails.implementation.isManualImplementation) {
            this.isManualTaskComplete = true;
            if (!this.smartLicensingDetails.implementation.populateBacklog) {
                this.selectedImplMethod = 'manual';
            }
        }
    }

    /**
     * Downloads Smart Licensing template CSV file
     */
    async onDownloadTemplate(event: { selectedTemplate: string, selectedLanguage: string }) {
        try {
            this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}SL/${event.selectedLanguage}/${this.smartLicensingDetails.projectId}`, `${event.selectedTemplate}SLImportTemplate.csv`);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Once PM finishes with manual process
     */
    onCompleteManualImplTask(event: { target: { checked: boolean } }) {
        this.isManualTaskComplete = event.target.checked;
        if (this.selectedImplMethod === 'manual' && this.isManualTaskComplete) {
            this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
                { data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });
            this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
                const featureObj = {
                    smartLicensingId: this.smartLicensingId
                };
                this.smartLicensingService.registerManualImplementation(featureObj).subscribe(res => {
                    if (res.success) {
                        this.smartLicensingDetails = res.data;
                        this.loadManualImplementationFormData();
                        this.checkAndDisableImplementationMethod();
                        this.smartLicensingService.enableNextSidebarItem('demoToElo');
                    }
                    this.confirmationDialogRef.close(res);
                }, err => {
                    console.log(err);
                });
            });

            this.confirmationDialogRef.afterClosed().subscribe((result: { success: boolean }) => {
                const { success } = result;
                if (success) {
                    this.isManualTaskComplete = true;
                } else {
                    this.isManualTaskComplete = false;
                }
            });
        }
    }

    /**
     * Populate backlog for Jira & Rally
     * @param event 'event';
     */
    populateBacklog(event: { selectedRepo: string, userId: string, _id: string, projectId: string, workspacePath: string }) {
        this.smartLicensingService.populateBacklog(event).subscribe((res: { data: SmartLicensingModel }) => {
            this.smartLicensingDetails = res.data;
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = true;
            this.smartLicensingService.enableNextSidebarItem('demoToElo');
        }, err => {
            this.dialog.open(GenericErrorComponent, {
                data: {
                    errorMsg: `Feature in ${event.selectedRepo === 'rally' ? 'RALLY' : 'JIRA'}`
                },
                width: '35vw', height: 'auto', disableClose: true
            });
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = false;
        });
    }
}
