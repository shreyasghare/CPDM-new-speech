import { NgModule } from '@angular/core';
import { TechnologyBestPracticesModule } from '../technology-best-practices.module';
import { IPv6RoutesModule } from './ipv6-routes.module';

/**
 * Components
 */
import { IPv6Component } from './ipv6.component';
import { IPv6PlanComponent } from './ipv6-plan/ipv6-plan.component';
import { Ipv6RecommendationsModalComponent } from './ipv6-plan/ipv6-recommendations-modal/ipv6-recommendations-modal.component';
import { Ipv6ImplementComponent } from './ipv6-implement/ipv6-implement.component';

@NgModule({
    declarations: [IPv6Component, IPv6PlanComponent, Ipv6RecommendationsModalComponent, Ipv6ImplementComponent],
    imports: [IPv6RoutesModule, TechnologyBestPracticesModule],
    entryComponents: [Ipv6RecommendationsModalComponent]
})
export class IPv6Module { }
