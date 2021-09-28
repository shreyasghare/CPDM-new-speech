import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { MatDialog } from '@angular/material';
import { ServiceabilityService } from '@cpdm-service/technology-best-practices/serviceability/serviceability.service';
import { Router } from '@angular/router';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ServiceabilityTableModalComponent } from './serviceability-table-modal/serviceability-table-modal.component';
import { ServiceabilityModel } from '@cpdm-model/technology-best-practices/serviceability/serviceability.model';

@Component({
  selector: 'app-serviceability-plan',
  templateUrl: './serviceability-plan.component.html',
  styleUrls: ['./serviceability-plan.component.scss']
})
export class ServiceabilityPlanComponent implements OnInit, OnDestroy {
  version: string = null;
  serviceabilityId: string;
  recommendationBtnName = 'Begin';
  serviceabilityDataSubscription: Subscription;
  isRecommendationsReadOnly: boolean;
  showRecommendationStatus = false;
  serviceabilityDetails: ServiceabilityModel;

  serviceabilityStatus: {icon: string, status: string, message: string} = {
    icon: 'language',
    status: 'What is Serviceability?',
    message: `Serviceability refers to the set of features and capabilities that support the ease and speed
    with which corrective maintenance and preventive maintenance can be conducted on a system. Corrective
    maintenance includes all the actions taken to repair a failed system and get it back into an operating
    or available state. The failure can be unexpected or expected, but it is usually an unplanned outage.
    Mean Time to Repair (MTTR), the measure used to quantify the time required to perform corrective maintenance,
    is also used in determining a system’s availability. Preventive maintenance includes all the actions taken to replace,
    service, upgrade, or patch a system to maintain its operational or available state and prevent system failures.`
  };

  recommendationsStatus: {icon: string, status: string} = {
    icon: 'submit',
    status: `Serviceability Recommendations`
  };

  constructor(public dialog: MatDialog,
              private serviceabilityService: ServiceabilityService,
              private router: Router,
              private toastService: ToastService) { }

  ngOnInit() {
    this.serviceabilityDataSubscription = this.serviceabilityService.getServiceabilityDataSub.subscribe(res => {
      if (res != null) {
        const { recommendationStatus = null, version: { name }, workflow: { next = null, timestamp = null } } = res;
        this.version = name;
        this.recommendationsStatus.status = `Serviceability Recommendations ${this.version}`;
        this.isRecommendationsReadOnly = getNestedKeyValue(timestamp, 'plan');
        if (recommendationStatus === 'saved' && timestamp === null) { this.recommendationBtnName = 'View / Edit'; }
        if (recommendationStatus === 'saved' && timestamp !== null && timestamp.hasOwnProperty('plan'))
        { this.recommendationBtnName = 'View'; }
        next === 'plan' && recommendationStatus === 'saved' ?
        this.showRecommendationStatus = true : this.showRecommendationStatus = false;

      }
    }, (error) => {
      this.toastService.show('Error in data fetching', 'Error in fetching serviceability-plan data', 'danger');
    });
    this.serviceabilityId = this.serviceabilityService.ServiceabilityId;
  }

  ngOnDestroy() {
    if (this.serviceabilityDataSubscription) {
      this.serviceabilityDataSubscription.unsubscribe();
    }
  }

  onBegin(): void {
    const config = {
      data: { version: this.version, serviceabilityId: this.serviceabilityId, isReadOnly: this.isRecommendationsReadOnly },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(ServiceabilityTableModalComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      const { success, data } = result;
      if (success) {
          this.serviceabilityDetails = data;
          this.serviceabilityService.updateServiceabilityData(this.serviceabilityDetails);
      }
    });
  }

}
