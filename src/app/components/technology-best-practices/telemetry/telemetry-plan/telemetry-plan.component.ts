import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { TelemetryService } from '@cpdm-service/technology-best-practices/telemetry/telemetry.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { TelemetryTableModalComponent } from './telemetry-table-modal/telemetry-table-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan',
  templateUrl: './telemetry-plan.component.html',
  styleUrls: ['./telemetry-plan.component.scss']
})
export class TelemetryPlanComponent implements OnInit, OnDestroy {
  version: string = null;
  telemetryId: string;
  recommendationBtnName = 'Begin';
  telemetryDataSubscription: Subscription;
  isRecommendationsReadOnly: boolean;
  showRecommendationStatus = false;

  telemetryStatus: {icon: string, status: string, message: string} = {
    icon: 'language',
    status: 'What is Telemetry?',
    message: `<span class="whatIsTelemetry">Automatic measurement and transmission of measurement
    data from remote nodes (devices/applications/SaaS) to receiving equipment or applications for monitoring,
    analytics, or other management functions. The telemetry data may be used for operational purposes such as
    understanding system health or performance or business purpose
    such as software license renewal. The goal of the recommendations is to bring about telemetry
    consistency across Cisco’s product portfolio.</br></br>
    The steps associated are: </span>
    <ul>
      <li>Plan your telemetry journey</li>
      <ul>
        <li>Identify the recommendations applicable for your project/product. Based on the type of product 
        (embedded/application), solution offering (on/off prem) and type of telemetry (business/operational)</li>
        <li>Plan the recommendation you would want to address right now (part of current release),
        maybe sometime in future (part of future release) or already adopted</li>
      </ul>
      <li>Implement – Have all the planned recommendations you want to address right away pushed to your backlog system of 
      choice (Rally/Jira or export to excel) with links to implementation guidance and existing practices</li>
      <li>Complete – Kudos once you have implemented the planned recommendations</li>
    </ul>
    <p>For additional Information please refer to:
        <a  target='_blank'
        href='https://cisco.sharepoint.com/sites/cpdm/TBP/SitePages/Telemetry.aspx'>Telemetry</a>
    </p>`
  };

  recommendationsStatus: {icon: string, status: string} = {
    icon: 'submit',
    status: `Telemetry Recommendations`
  };

  constructor(public dialog: MatDialog, private telemetryService: TelemetryService, private router: Router) { }
  ngOnInit() {
    this.telemetryDataSubscription = this.telemetryService.getTelemetryDataSub.subscribe(res => {
      if (res != null) {
        const { recommendationStatus = null, version: { name }, workflow: { next = null, timestamp = null } } = res;
        this.version = name;
        this.recommendationsStatus.status = `Telemetry Recommendations ${this.version}`;
        this.isRecommendationsReadOnly = getNestedKeyValue(timestamp, 'plan') !== null;
        if (recommendationStatus === 'saved' && timestamp === null) { this.recommendationBtnName = 'View / Edit'; }
        if (recommendationStatus === 'saved' && timestamp !== null && timestamp.hasOwnProperty('plan'))
        { this.recommendationBtnName = 'View'; }
        next === 'plan' && recommendationStatus === 'saved' ?
        this.showRecommendationStatus = true : this.showRecommendationStatus = false;

      }
    }, (error) => {
      this.router.navigate([`/**`]);
    });
    this.telemetryId = this.telemetryService.telemetryId;
  }

  ngOnDestroy() {
    if (this.telemetryDataSubscription) {
      this.telemetryDataSubscription.unsubscribe();
    }
  }

  onBegin(): void {
    const config = {
      data: { version: this.version, telemetryId: this.telemetryId, isReadOnly: this.isRecommendationsReadOnly },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(TelemetryTableModalComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      const {success, data} = result;
      if (success) {
        this.telemetryService.updateTelemetryData(data);
      }
    });
  }
}
