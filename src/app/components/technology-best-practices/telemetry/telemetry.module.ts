import { NgModule } from '@angular/core';
import { TechnologyBestPracticesModule } from '../technology-best-practices.module';
import { TelemetryRoutesModule } from './telemetry-routes.module';
import { MatMenuModule } from '@angular/material/menu';
/**
 * Components
 */
import { TelemetryComponent } from './telemetry.component';
import { TelemetryPlanComponent } from './telemetry-plan/telemetry-plan.component';
import { TelemetryTableModalComponent } from './telemetry-plan/telemetry-table-modal/telemetry-table-modal.component';
import { TelemetryImplementComponent } from './telemetry-implement/telemetry-implement.component';
import { TelemetryCompleteComponent } from './telemetry-complete/telemetry-complete.component';

/**
 * Services
 */
import { TelemetryService } from '@cpdm-service/technology-best-practices/telemetry/telemetry.service';

@NgModule({
    declarations: [TelemetryComponent, TelemetryPlanComponent, TelemetryTableModalComponent,
        TelemetryImplementComponent, TelemetryCompleteComponent],
    entryComponents: [TelemetryTableModalComponent],
    imports: [TelemetryRoutesModule, TechnologyBestPracticesModule, MatMenuModule],
    providers: [TelemetryService]
})
export class TelemetryModule {}