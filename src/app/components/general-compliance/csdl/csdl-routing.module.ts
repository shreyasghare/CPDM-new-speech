import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsdlCompleteComponent } from './csdl-complete/csdl-complete.component';
import { CsdlCreateComponent } from './csdl-create/csdl-create.component';
import { CsdlPlanExecuteComponent } from './csdl-plan-execute/csdl-plan-execute.component';
import { CsdlComponent } from './csdl.component';

const csdlChildRoutes: Routes = [{
    path: ':id',
    component: CsdlComponent,
    children: [
        { path: 'create', component: CsdlCreateComponent },
        { path: 'plan_execute', component: CsdlPlanExecuteComponent },
        { path: 'complete', component: CsdlCompleteComponent }
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(csdlChildRoutes)]
})

export class CsdlRoutesModule { }