import { NgModule } from '@angular/core';
import { ApiProductsPlanComponent } from './api-products-plan/api-products-plan.component';
import { ApiProductsImplementComponent } from './api-products-implement/api-products-implement.component';
import { ApiProductsCompleteComponent } from './api-products-complete/api-products-complete.component';
import { ApiProductsComponent } from './api-products.component';
import { TechnologyBestPracticesModule } from '../technology-best-practices.module';
import { ApiProductsRoutesModule } from './api-products-routes.module';
import { TableModalComponent } from './api-products-plan/table-modal/table-modal.component';
import { ApiProductsService } from '@cpdm-service/technology-best-practices/api-products/api-products.service';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    ApiProductsComponent,
    ApiProductsPlanComponent,  
    ApiProductsImplementComponent,
    ApiProductsCompleteComponent,
    TableModalComponent
  ], 
  imports: [
    TechnologyBestPracticesModule,
    ApiProductsRoutesModule,
    MatMenuModule
  ],
  entryComponents: [
    TableModalComponent
  ],
  providers: [
    ApiProductsService
  ]
})
export class ApiProductsModule { }
