import { Component, OnInit } from '@angular/core';
import { Role } from '@cpdm-model/role';
import { ApiProductsModel } from '@cpdm-model/technology-best-practices/api-products/apiProducts.model';
import { ActivatedRoute } from '@angular/router';
import { ApiProductsService } from '@cpdm-service/technology-best-practices/api-products/api-products.service';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-api-products-implement',
  templateUrl: './api-products-implement.component.html',
  styleUrls: ['./api-products-implement.component.scss']
})
export class ApiProductsImplementComponent implements OnInit {
  role = Role;
  isStepInitiated: boolean;
  apiProductsId = '';
  isImplementRequired = true;
  infoIconData = [];
  implementationStatus: { icon: string, status: string, message: string } = {
      icon: 'chevron',
      status: 'Implementation not required',
      message: 'None of the UID items have a status set as: \'Current release\'. Hence, This step is not required.'
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
  populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean } = {
      isPopulating: false,
      isBacklogPopulated: false
  };
  selectedImplMethod = 'pushToRepo';
  isManualTaskComplete = false;
  disableImplementationMethod: { manual: boolean, pushToRepo: boolean } = {
      manual: false,
      pushToRepo: false
  };
  confirmationDialogRef: any;
  confirmationObj: { confirmationText: string } = {
      confirmationText: 'Are you sure you want to complete implementation task?'
  };
  apiProductsDetails: ApiProductsModel;


  constructor(
    private activatedRoute: ActivatedRoute,
        private apiProductsService: ApiProductsService,
        private utilsService: UtilsService,
        public dialog: MatDialog,
        private toastService: ToastService,
        private projectsDataService: ProjectsDataService
  ) { }

  ngOnInit() {
    this.isStepInitiated = false;
    this.apiProductsId = this.activatedRoute.snapshot.parent.params.id;
    this.getApiProductsDetails();
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
   * Get api-products details
   */
  private getApiProductsDetails() {
    this.apiProductsService.getApiProductsData(this.apiProductsId).subscribe((res: { success: boolean, data: ApiProductsModel }) => {
        const { success, data } = res;
        if (success) {
          this.apiProductsDetails = data;
          // Need workflow update if implement is not required
          if (!this.apiProductsDetails.isImplementRequired) {
              this.isImplementRequired = this.apiProductsDetails.isImplementRequired;
              // check active and next step to update workflow only once and not on every visit of the step
              if (this.apiProductsDetails.workflow.active === 'implement' && this.apiProductsDetails.workflow.next === 'implement') {
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
    }, err => {
        this.toastService.show('Error in data fetching', 'Error fetching API Products details', 'danger');
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
        stepName: 'implement'
    };
    this.apiProductsService.updateApiProductsObject(this.apiProductsId, updateObj).subscribe(res => {
        this.apiProductsService.updateApiProductsData(res.data);
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
    if (this.apiProductsDetails.workflow.timestamp && this.apiProductsDetails.workflow.timestamp.implement) {
        if (this.apiProductsDetails.implementation &&
            this.apiProductsDetails.implementation.isManualImplementation &&
            !this.apiProductsDetails.implementation.populateBacklog) {
            // Disables pushToRepo method as no backlog data found
            this.disableImplementationMethod.pushToRepo = true;
        } else if (this.apiProductsDetails.implementation &&
            this.apiProductsDetails.implementation.populateBacklog &&
            !this.apiProductsDetails.implementation.isManualImplementation) {
            // Disables manual method as it is not finished
            this.disableImplementationMethod.manual = true;
        }
    }
  }

  /**
   * Load data into push to repo step
   */
  loadPushToRepoFormData() {
    if (this.apiProductsDetails.implementation && this.apiProductsDetails.implementation.populateBacklog) {
        this.populateBacklogStatus.isPopulating = false;
        this.populateBacklogStatus.isBacklogPopulated = true;
    }
  }

  /**
   * Load data in manual implementation step
   */
  loadManualImplementationFormData() {
    if (this.apiProductsDetails.implementation && this.apiProductsDetails.implementation.isManualImplementation) {
        this.isManualTaskComplete = true;
        if (!this.apiProductsDetails.implementation.populateBacklog) {
            this.selectedImplMethod = 'manual';
        }
    }
  }

  /**
   * To download API Products template CSV file
   */
  async onDownloadTemplate(event) {
    try {
        this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}ApiProducts/${this.apiProductsDetails._id}`, `${event.selectedTemplate}APIProductsTemplate.csv`);
    } catch (error) {
        this.toastService.show('Error in download', 'Error while downloading template file', 'danger');
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
              apiProductsId: this.apiProductsId
          };
          this.apiProductsService.registerManualImplementation(featureObj).subscribe(res => {
              if (res.success) {
                  res.data.isImplementRequired = this.apiProductsDetails.isImplementRequired;
                  this.apiProductsDetails = res.data;
                  this.loadManualImplementationFormData();
                  this.apiProductsService.updateApiProductsData(res.data);
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
   * @param event 'event';
   */
  populateBacklog(event: { selectedRepo: string, userId: string, rallyProjectId: string, apiProductsId: string, selectedWS: string, projectId: string }) {
    this.apiProductsService.populateBacklog(event).subscribe((res: { data: ApiProductsModel }) => {
        res.data.isImplementRequired = this.apiProductsDetails.isImplementRequired;
        this.apiProductsDetails = res.data;
        this.populateBacklogStatus.isPopulating = false;
        this.populateBacklogStatus.isBacklogPopulated = true;
        this.apiProductsService.updateApiProductsData(res.data);
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

