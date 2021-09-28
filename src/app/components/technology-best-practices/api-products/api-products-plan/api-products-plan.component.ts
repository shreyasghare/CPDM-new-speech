import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { TableModalComponent } from './table-modal/table-modal.component';
import { ApiProductsService } from '@cpdm-service/technology-best-practices/api-products/api-products.service';

@Component({
  selector: 'app-api-products-plan',
  templateUrl: './api-products-plan.component.html',
  styleUrls: ['./api-products-plan.component.scss']
})
export class ApiProductsPlanComponent implements OnInit {
  version: string = null;
  apiProductsId: string;
  recommendationBtnName = 'Begin';
  apiProductsDataSubscription: Subscription;
  isRecommendationsReadOnly: boolean;
  showRecommendationStatus = false;

  apiProductsStatus: {icon: string, status: string, message: string} = {
    icon: 'language',
    status: 'What are API Products?',
    message:`“API Products” recommendations are applicable to all styles of APIs (REST/Web APIs, Network Devices APIs…), and cover several dimensions to help deliver great API products and user experience for developers:
    <ul>
    <li>API Program Management</li>
    <li>Developer Experience</li>
    <li>Designing APIs</li>
    <li>Versioning APIs</li>
    <li>Documenting APIs</li>
    <li>Supporting APIs</li>
    <li>Security</li>
    </ul>`
  };

  recommendationsStatus: {icon: string, status: string} = {
    icon: 'submit',
    status: `API Products Recommendations`
  };

  constructor(public dialog: MatDialog, private service: ApiProductsService) { }

  ngOnInit() { 
    this.apiProductsDataSubscription = this.service.getApiProductsDataSub.subscribe(res => {
      if (res != null) {
        const { recommendationStatus = null, version: { name }, workflow: { next = null, timestamp = null } } = res;
        this.version = name;
        this.recommendationsStatus.status = `API Products Recommendations ${this.version}`;
        this.isRecommendationsReadOnly = getNestedKeyValue(timestamp, 'plan') !== null;
        if (recommendationStatus === 'saved' && timestamp === null) { this.recommendationBtnName = 'View / Edit'; }
        if (recommendationStatus === 'saved' && timestamp !== null && timestamp.hasOwnProperty('plan')) { this.recommendationBtnName = 'View'; } 
        next === 'plan' && recommendationStatus === 'saved' ?
        this.showRecommendationStatus = true : this.showRecommendationStatus = false;
      }
    });
    this.apiProductsId = this.service.apiProductsId;
  }

  onBegin(): void {
    const config = {
      data: { version: this.version, apiProductsId: this.apiProductsId, isReadOnly: this.isRecommendationsReadOnly },
      height: '100vh',
      width: '100vw',
      panelClass: 'full-screen-modal',
      disableClose: true,
    };
    const dialogRef = this.dialog.open(TableModalComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      const {success, data} = result;
      if (success) {
        this.service.updateApiProductsData(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.apiProductsDataSubscription) {
      this.apiProductsDataSubscription.unsubscribe();
    }
  }


}
