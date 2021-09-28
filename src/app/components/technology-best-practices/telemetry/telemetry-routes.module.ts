import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Components
 */
import { TelemetryComponent } from './telemetry.component';
import { TelemetryPlanComponent } from './telemetry-plan/telemetry-plan.component';
import { TelemetryImplementComponent } from './telemetry-implement/telemetry-implement.component';
import { TelemetryCompleteComponent } from './telemetry-complete/telemetry-complete.component';

const telemetryChildRoutes: Routes = [{
    path: ':id',
    component: TelemetryComponent,
    children: [
        { path: 'plan', component: TelemetryPlanComponent },
        { path: 'implement', component: TelemetryImplementComponent },
        { path: 'complete', component: TelemetryCompleteComponent}
    ]
}]
@NgModule({
    imports: [RouterModule.forChild(telemetryChildRoutes)]
})
export class TelemetryRoutesModule { }