import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartLicensingComponent } from './smart-licensing.component';

const smartLicensingRoutes: Routes = [
    { path: ':id', component: SmartLicensingComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(smartLicensingRoutes)
    ]
})

export class SmartLicensingRoutingModule { }
