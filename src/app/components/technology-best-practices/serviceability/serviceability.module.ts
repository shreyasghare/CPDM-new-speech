/**
 * Modules
 */
import { NgModule } from '@angular/core';
import { ServiceabilityRoutesModule } from './serviceability-routes.module';
import { TechnologyBestPracticesModule } from '../technology-best-practices.module';
import { MatMenuModule } from '@angular/material/menu';

/**
 * Components
 */
import { ServiceabilityCompleteComponent } from './serviceability-complete/serviceability-complete.component';
import { ServiceabilityImplementComponent } from './serviceability-implement/serviceability-implement.component';
import { ServiceabilityPlanComponent } from './serviceability-plan/serviceability-plan.component';
import { ServiceabilityComponent } from './serviceability.component';

/**
 * Services
 */
import { ServiceabilityService } from '@cpdm-service/technology-best-practices/serviceability/serviceability.service';
import { ServiceabilityTableModalComponent } from './serviceability-plan/serviceability-table-modal/serviceability-table-modal.component';


@NgModule({
    declarations: [ServiceabilityComponent, ServiceabilityPlanComponent,
        ServiceabilityImplementComponent, ServiceabilityCompleteComponent, ServiceabilityTableModalComponent],
    imports: [ServiceabilityRoutesModule, TechnologyBestPracticesModule, MatMenuModule],
    providers: [ServiceabilityService],
    entryComponents: [ServiceabilityTableModalComponent],
})

export class ServiceabilityModule {}