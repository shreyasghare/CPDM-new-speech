import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalizationComponent } from './globalization.component';
import { GzRequirementsComponent } from './gz-requirements/gz-requirements.component';
import { GzImplementationSignOffComponent } from './gz-implementation-sign-off/gz-implementation-sign-off.component';
import { GzCompleteComponent } from './gz-complete/gz-complete.component';

const globalizationChildRoutes: Routes = [{
    path: ':id',
    component: GlobalizationComponent,
    children: [
        { path: 'requirements', component: GzRequirementsComponent },
        { path: 'implementationSignoff', component: GzImplementationSignOffComponent },
        { path: 'complete', component: GzCompleteComponent }
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(globalizationChildRoutes)]
})

export class GlobalizationRoutesModule { }