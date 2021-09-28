import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

const homeRoutes: Routes = [
    {path: '', component: LandingPageComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(homeRoutes)
    ]
})

export class HomeRoutingModule {}
