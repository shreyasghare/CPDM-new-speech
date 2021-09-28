import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EcCompleteComponent } from './ec-complete/ec-complete.component';
import { EcLinkGenerateComponent } from './ec-link-generate/ec-link-generate.component';
import { EcSubmitAssignClassifyComponent } from './ec-submit-assign-classify/ec-submit-assign-classify.component';
import { ExportComplianceComponent } from './export-compliance.component';


const exportComplianceChildRoutes: Routes = [{
    path: ':id',
    component: ExportComplianceComponent,
    children: [
        { path: 'link_generate', component: EcLinkGenerateComponent },
        { path: 'submit_assign_classify', component: EcSubmitAssignClassifyComponent },
        { path: 'complete', component: EcCompleteComponent }
    ]
}];
@NgModule({
    imports: [RouterModule.forChild(exportComplianceChildRoutes)]
})

export class ExportComplianceRoutesModule { }