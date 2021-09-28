import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { IPv6Model } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
import { Subscription } from 'rxjs';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { IPv6Service } from '@cpdm-service/technology-best-practices/ipv6/ipv6.service';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';

@Component({
  selector: 'app-ipv6-implement',
  templateUrl: './ipv6-implement.component.html',
  styleUrls: ['./ipv6-implement.component.scss']
})

export class Ipv6ImplementComponent implements OnInit, OnDestroy {
  ipv6Id: string;
  ipv6Details: IPv6Model;
  infoIconData = [];
  implementationStatus: { icon: string; status: string; message: string } = {
    icon: 'chevron',
    status: 'Implementation not required',
    message: `None of the UID items have a status set as: 'Current Release'. 
    Hence, this step is not required.`
  };
  disableImplementation: { manual: boolean; pushToRepo: boolean } =
  { manual: false, pushToRepo: false };
  populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean } =
  { isPopulating: false, isBacklogPopulated: false };
  manualTemplates: Array<{ name: string; value: string }> = [
    { name: 'Rally Template', value: 'Rally' },

    { name: 'Jira Template', value: 'Jira' },
    { name: 'PRD Template', value: 'PRD' }
  ];
  backlogRepositories: Array<{ name: string; value: string }> = [
    { name: 'Rally', value: 'Rally' },
    { name: 'Jira', value: 'Jira' }
  ];
  confirmationObject: { confirmationText: string } = {
    confirmationText: 'Are you sure you want to complete implementation task?'
  };
  confirmationDialogRef: MatDialogRef<any>;

  isStepInitiated: boolean;
  isImplementRequired = true;
  isManualTaskCompleted: boolean;
  selectedImplMethod = 'pushToRepo';

  ipv6DataSubscription: Subscription;
  updateObjectSubscription: Subscription;
  confirmationDialogRefSubscription: Subscription;
  manualImplSubscription: Subscription;
  populateBacklogSubscription: Subscription;
 

  constructor(
    private activatedRoute: ActivatedRoute,
    private ipv6Service: IPv6Service,
    private dialog: MatDialog,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private projectsDataService: ProjectsDataService
  ) { }

  ngOnInit() {
    this.ipv6Id = this.activatedRoute.snapshot.parent.params.id;
    this.getIpv6Data();
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

  getIpv6Data(): void {
    this.ipv6DataSubscription = this.ipv6Service.getIPv6Details(this.ipv6Id).subscribe((res: { success: Boolean, data: IPv6Model }) => {
      const { success, data } = res;
      if (success) {
        this.ipv6Details = data;
        if (!this.ipv6Details.isImplementRequired) {
          this.isImplementRequired = this.ipv6Details.isImplementRequired;
          this.ipv6Details.workflow.active === 'implement'
            && this.ipv6Details.workflow.next === 'implement'
            ?  this.updateWorkflow() : this.isStepInitiated = true;
        } else {
          this.checkAndDisableImplementationMethod();
          this.loadManualImplementationFormData();
          this.loadPushToRepoFormData();
          this.isStepInitiated = true;
        }
      }
    }, err => {
      this.toastService.show('Error in data fetching', 'Error fetching the IPv6 details', 'danger');
      this.isStepInitiated = true;
    });
  }

  // Update workflow
  private async updateWorkflow() {
    const updateObj = {
      'workflow.next': 'complete',
      progressScore: 90,
      stepName: 'Implement'
    };

    try {
      const result = await this.ipv6Service.update(this.ipv6Id, updateObj).toPromise();
      const { success, data } = result;
      if (success) {
        this.ipv6Service.updateIPv6DetailsSubject(data);
      }
    } catch (error) {
      this.toastService.show('Error in data updating', 'Error while updating workflow details', 'danger');
    }
    this.isStepInitiated = true;
  }

  private checkAndDisableImplementationMethod(): void {
    if (this.ipv6Details.workflow.timestamp.implement) {
      if (this.ipv6Details.implementation.isManualImplementation ||
          this.ipv6Details.implementation.populateBacklog) {
        this.disableImplementation.pushToRepo = true;
      }
    }
  }

  private loadManualImplementationFormData(): void {
    if (getNestedKeyValue(this.ipv6Details, 'implementation', 'isManualImplementation')) {
      this.isManualTaskCompleted = true;
      if (!getNestedKeyValue(this.ipv6Details, 'implementation', 'populateBacklog')) {
        this.selectedImplMethod = 'manual';
      }
    }
  }

  private loadPushToRepoFormData(): void {
    if (getNestedKeyValue(this.ipv6Details, 'implementation', 'populateBacklog')) {
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
    }
  }

  // Download template csv file
  async onDownloadTemplate(event: { selectedTemplate: string }) {
    try {
      this.utilsService.downloadFileFromNode
      (`generateCSV/${event.selectedTemplate.toLowerCase()}IPv6/${this.ipv6Id}`,
      `${event.selectedTemplate}IPv6Template.csv`);
    } catch (error) {
      this.toastService.show('Error in download', 'Error while downloading template file', 'danger');
    }
  }

  onManualImplTaskCompletion(event: { target: { checked: boolean } }): void {
    this.isManualTaskCompleted = event.target.checked;
    if (this.selectedImplMethod === 'manual' && this.isManualTaskCompleted) {
      this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
        { data: this.confirmationObject, width: '35vw', height: 'auto', disableClose: true });
      this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {
        const featureObject = { ipv6Id: this.ipv6Id };
        this.manualImplSubscription = this.ipv6Service.registerManualImplementation(featureObject).subscribe(res => {
          const { success, data } = res;
          if (success) {
            data.isImplementRequired = this.ipv6Details.isImplementRequired;
            this.ipv6Details = data;
            this.loadManualImplementationFormData();
            this.ipv6Service.updateIPv6DetailsSubject(data);
          }
          this.confirmationDialogRef.close(res);
        }, err => {
          this.toastService.show('Error in saving', 'Error in saving manual implementation', 'danger');
        });
      });

      this.confirmationDialogRefSubscription = this.confirmationDialogRef.afterClosed().subscribe((result: { success: boolean }) => {
        const { success } = result;
        success ? this.isManualTaskCompleted = true : this.isManualTaskCompleted = false;
      });
    }
  }

  populateBacklog(event: { selectedRepo: string,
    userId: string, rallyProjectId: string, _id: string,
     selectedWS: string, projectId: string }): void {
    this.populateBacklogSubscription = this.ipv6Service.populateBacklog(event).subscribe((res: { data: IPv6Model }) => {
      const { data } = res;
      data.isImplementRequired = this.ipv6Details.isImplementRequired;
      this.ipv6Details = data;
      this.populateBacklogStatus.isPopulating = false;
      this.populateBacklogStatus.isBacklogPopulated = true;
      this.ipv6Service.updateIPv6DetailsSubject(data);
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

  ngOnDestroy(): void {
    if (this.ipv6DataSubscription) { this.ipv6DataSubscription.unsubscribe(); }
    if (this.updateObjectSubscription) { this.updateObjectSubscription.unsubscribe(); }
    if (this.confirmationDialogRefSubscription) { this.confirmationDialogRefSubscription.unsubscribe(); }
    if (this.manualImplSubscription) { this.manualImplSubscription.unsubscribe(); }
    if (this.populateBacklogSubscription) { this.populateBacklogSubscription.unsubscribe(); }
  }
}
