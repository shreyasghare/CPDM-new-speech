import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * Components
 */
import { IPv6Component } from './ipv6.component';
import { IPv6PlanComponent } from './ipv6-plan/ipv6-plan.component';
import { Ipv6ImplementComponent } from './ipv6-implement/ipv6-implement.component';
import { Ipv6CompleteComponent } from './ipv6-complete/ipv6-complete.component';

const IPv6ChildRoutes: Routes = [{
    path: ':id',
    component: IPv6Component,
    children: [
        { path: 'plan', component: IPv6PlanComponent },
        { path: 'implement', component: Ipv6ImplementComponent },
        { path: 'complete', component: Ipv6CompleteComponent },
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(IPv6ChildRoutes)]
})
export class IPv6RoutesModule { }
