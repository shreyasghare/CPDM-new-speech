import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TelemetryModel } from '@cpdm-model/technology-best-practices/telemetry/telemetry.model';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { TelemetryService } from '@cpdm-service/technology-best-practices/telemetry/telemetry.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-telemetry-implement',
  templateUrl: './telemetry-implement.component.html',
  styleUrls: ['./telemetry-implement.component.scss']
})
export class TelemetryImplementComponent implements OnInit {
  isStepInitiated = false;
  isImplementRequired = true;
  isManualTaskComplete = false;
  infoIconData = [];
  telemetryId: string;
  selectedImplMethod = 'pushToRepo';

  telemetryDetails: TelemetryModel;
  confirmationDialogRef: any;
  implementationStatus: { icon: string, status: string, message: string } = {
    icon: 'chevron',
    status: 'Implementation not required',
    message: 'None of the UID items have a status set as: \'Current Release\'. Hence, This step is not required.'
  };
  disableImplementationMethod: { manual: boolean, pushToRepo: boolean } = {
    manual: false,
    pushToRepo: false
  };
  populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean } = {
    isPopulating: false,
    isBacklogPopulated: false
  };
  templates: Array<{ name: string, value: string }> = [
    { name: 'Rally Template', value: 'Rally' },
    { name: 'Jira Template', value: 'Jira' },
    { name: 'PRD Template', value: 'PRD' }
  ];
  repositories: Array<{ name: string, value: string }> = [
    { name: 'Rally', value: 'Rally' },
    { name: 'Jira', value: 'Jira' }
  ];
  confirmationObj: { confirmationText: string } = {
    confirmationText: 'Are you sure you want to complete implementation task?'
  };

  constructor(private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private utilsService: UtilsService,
    private telemetryService: TelemetryService,
    private toastService: ToastService,
    private projectsDataService: ProjectsDataService) { }

  ngOnInit() {
    this.telemetryId = this.activatedRoute.snapshot.parent.params.id;
    this.getTelemetryDetails();
    this.projectsDataService.getItemDesc('tooltip').subscribe(res => {
      this.infoIconData = res;
  });
  }

   /**
   * Get toltip data
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
   * Get telemetry details
   */
  getTelemetryDetails() {
    this.telemetryService.getTelemetryData(this.telemetryId).subscribe((res: { success: boolean, data: TelemetryModel }) => {
      const { success, data } = res;
      if (success) {
        this.telemetryDetails = data;
        // Need workflow update if implement is not required
        if (!this.telemetryDetails.isImplementRequired) {
          this.isImplementRequired = this.telemetryDetails.isImplementRequired;
          // check active and next step to update workflow only once and not on every visit of the step
          if (this.telemetryDetails.workflow.active === 'implement' && this.telemetryDetails.workflow.next === 'implement') {
            this.updateWorkflow();
          } else {
            this.isStepInitiated = true;
          }
        } else {
          this.checkAndDisableImplementationMethod();
          this.loadManualImplementationFormData();
          this.loadPushToRepoFormData();
          this.isStepInitiated = true;
        }
      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error fetching the telemetry details', 'danger');
      this.isStepInitiated = true;
    });
  }

  /**
   * Update workflow when implement not required
   */
  private async updateWorkflow() {
    const updateObj = {
      'workflow.next': 'complete',
      progressScore: 90,
      stepName: 'Implement'
    };
    this.telemetryService.updateTelemetryObject(this.telemetryId, updateObj).subscribe(res => {
      this.telemetryService.updateTelemetryData(res.data);
      this.isStepInitiated = true;
    }, err => {
      this.toastService.show('Error in data updating', 'Error while updating workflow details', 'danger');
      this.isStepInitiated = true;
    });
  }

  /**
   * On step completion, disables implementation method which is not completed
   */
  private checkAndDisableImplementationMethod() {
    if (this.telemetryDetails.workflow.timestamp && this.telemetryDetails.workflow.timestamp.implement) {
      if (this.telemetryDetails.implementation && this.telemetryDetails.implementation.isManualImplementation && !this.telemetryDetails.implementation.populateBacklog) {
        // Disables pushToRepo method as no backlog data found
        this.disableImplementationMethod.pushToRepo = true;
      } else if (this.telemetryDetails.implementation && this.telemetryDetails.implementation.populateBacklog && !this.telemetryDetails.implementation.isManualImplementation) {
        // Disables manual method as it is not finished
        this.disableImplementationMethod.manual = true;
      }
    }
  }

  /**
   * Load data into push to repo step
   */
  loadPushToRepoFormData() {
    if (this.telemetryDetails.implementation && this.telemetryDetails.implementation.populateBacklog) {
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
    }
  }

  /**
   * Load data in manual implementation step
   */
  loadManualImplementationFormData() {
    if (this.telemetryDetails.implementation && this.telemetryDetails.implementation.isManualImplementation) {
      this.isManualTaskComplete = true;
      if (!this.telemetryDetails.implementation.populateBacklog) {
        this.selectedImplMethod = 'manual';
      }
    }
  }

  /**
   * Downloads template CSV file
   * @param event 
   */
  async onDownloadTemplate(event: { selectedTemplate: string }) {
    try {
      this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}telemetry/${this.telemetryId}`, `${event.selectedTemplate}TelemetryTemplate.csv`);
    } catch (error) {
      this.toastService.show('Error in download', 'Error while downloading template file', 'danger');
    }
  }

  /**
   * Once PM finishes with manual process
   * @param event 
   */
  onCompleteManualImplTask(event: { target: { checked: boolean } }) {
    this.isManualTaskComplete = event.target.checked;
    if (this.selectedImplMethod === 'manual' && this.isManualTaskComplete) {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, { data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });
      this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
        const featureObj = {
          telemetryId: this.telemetryId
        };
        this.telemetryService.registerManualImplementation(featureObj).subscribe(res => {
          if (res.success) {
            res.data.isImplementRequired = this.telemetryDetails.isImplementRequired;
            this.telemetryDetails = res.data;
            this.loadManualImplementationFormData();
            this.telemetryService.updateTelemetryData(res.data);
          }
          this.confirmationDialogRef.close(res);
        }, err => {
          this.toastService.show('Error in saving', 'Error in saving manual implementation', 'danger');
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
   * @param event 
   */
  populateBacklog(event: { selectedRepo: string, userId: string, rallyProjectId: string, _id: string, selectedWS: string, projectId: string }) {
    this.telemetryService.populateBacklog(event).subscribe((res: { data: TelemetryModel }) => {
      res.data.isImplementRequired = this.telemetryDetails.isImplementRequired;
      this.telemetryDetails = res.data;
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
      this.telemetryService.updateTelemetryData(res.data);
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
