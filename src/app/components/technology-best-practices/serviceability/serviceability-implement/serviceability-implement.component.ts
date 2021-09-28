import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ServiceabilityModel } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { ServiceabilityService } from '@cpdm-service/technology-best-practices/serviceability/serviceability.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
@Component({
  selector: 'app-serviceability-implement',
  templateUrl: './serviceability-implement.component.html',
  styleUrls: ['./serviceability-implement.component.scss']
})
export class ServiceabilityImplementComponent implements OnInit {
  isStepInitiated = false;
  isImplementRequired = true;
  isManualTaskComplete = false;
  infoIconData = [];
  serviceabilityId: string;
  selectedImplMethod = 'pushToRepo';

  serviceabilityDetails: ServiceabilityModel;
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
    private serviceabilityService: ServiceabilityService,
    private toastService: ToastService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private projectsDataService: ProjectsDataService) { }

  ngOnInit() {
    this.serviceabilityId = this.activatedRoute.snapshot.parent.params.id;
    this.getServiceabilityDetails();
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

  getServiceabilityDetails(){
    this.serviceabilityService.getServiceabilityData(this.serviceabilityId).subscribe((res: { success: boolean, data: ServiceabilityModel }) => {
      const { success, data } = res;
      if (success) {
        this.serviceabilityDetails = data;
        // Need workflow update if implement is not required
        if (!this.serviceabilityDetails.isImplementRequired) {
          this.isImplementRequired = this.serviceabilityDetails.isImplementRequired;
          // check active and next step to update workflow only once and not on every visit of the step
          if (this.serviceabilityDetails.workflow.active === 'implement' && this.serviceabilityDetails.workflow.next === 'implement') {
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
      this.toastService.show('Error in data fetching', 'Error fetching the serviceability details', 'danger');
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
    this.serviceabilityService.updateServiceabilityObject(this.serviceabilityId, updateObj).subscribe(res => {
      this.serviceabilityService.updateServiceabilityData(res.data);
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
    if (this.serviceabilityDetails.workflow.timestamp && this.serviceabilityDetails.workflow.timestamp.implement) {
      if (this.serviceabilityDetails.implementation && this.serviceabilityDetails.implementation.isManualImplementation && !this.serviceabilityDetails.implementation.populateBacklog) {
        // Disables pushToRepo method as no backlog data found
        this.disableImplementationMethod.pushToRepo = true;
      } else if (this.serviceabilityDetails.implementation && this.serviceabilityDetails.implementation.populateBacklog && !this.serviceabilityDetails.implementation.isManualImplementation) {
        // Disables manual method as it is not finished
        this.disableImplementationMethod.manual = true;
      }
    }
  }

  /**
   * Load data in manual implementation step
   */
  loadManualImplementationFormData() {
    if (this.serviceabilityDetails.implementation && this.serviceabilityDetails.implementation.isManualImplementation) {
      this.isManualTaskComplete = true;
      if (!this.serviceabilityDetails.implementation.populateBacklog) {
        this.selectedImplMethod = 'manual';
      }
    }
  }

  loadPushToRepoFormData() {
    if (this.serviceabilityDetails.implementation && this.serviceabilityDetails.implementation.populateBacklog) {
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
    }
  }

  /**
   * Downloads template CSV file
   * @param event 
   */
  async onDownloadTemplate(event: { selectedTemplate: string }) {
    try {
      this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}serviceability/${this.serviceabilityId}`, `${event.selectedTemplate}_Serviceability_Requirements.csv`);
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
          serviceabilityId: this.serviceabilityId
        };
        this.serviceabilityService.registerManualImplementation(featureObj).subscribe(res => {
          if (res.success) {
            res.data.isImplementRequired = this.serviceabilityDetails.isImplementRequired;
            this.serviceabilityDetails = res.data;
            this.loadManualImplementationFormData();
            this.serviceabilityService.updateServiceabilityData(res.data);
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
    this.serviceabilityService.populateBacklog(event).subscribe((res: { data: ServiceabilityModel }) => {
      res.data.isImplementRequired = this.serviceabilityDetails.isImplementRequired;
      this.serviceabilityDetails = res.data;
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
      this.serviceabilityService.updateServiceabilityData(res.data);
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
