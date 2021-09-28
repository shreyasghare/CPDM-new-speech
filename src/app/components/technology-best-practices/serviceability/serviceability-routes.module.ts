import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceabilityCompleteComponent } from './serviceability-complete/serviceability-complete.component';
import { ServiceabilityImplementComponent } from './serviceability-implement/serviceability-implement.component';
import { ServiceabilityPlanComponent } from './serviceability-plan/serviceability-plan.component';
import { ServiceabilityComponent } from './serviceability.component';


const serviceabilityChildRoutes: Routes = [{
    path: ':id',
    component: ServiceabilityComponent,
    children: [
        { path: 'plan', component: ServiceabilityPlanComponent },
        { path: 'implement', component: ServiceabilityImplementComponent },
        { path: 'complete', component: ServiceabilityCompleteComponent }
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(serviceabilityChildRoutes)]
})

export class ServiceabilityRoutesModule { 


}