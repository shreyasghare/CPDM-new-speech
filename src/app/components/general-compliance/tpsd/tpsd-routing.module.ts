import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TpsdCompleteComponent } from './tpsd-complete/tpsd-complete.component';
import { TpsdCreateLinkComponent } from './tpsd-create-link/tpsd-create-link.component';
import { TpsdDiscoverRegisterExecuteComponent } from './tpsd-discover-register-execute/tpsd-discover-register-execute.component';
import { TpsdComponent } from './tpsd.component';

const tpsdChildRoutes: Routes = [{
    path: ':id',
    component: TpsdComponent,
    children: [
        { path: 'create_link', component: TpsdCreateLinkComponent },
        { path: 'discover_register_execute', component: TpsdDiscoverRegisterExecuteComponent },
        { path: 'complete', component: TpsdCompleteComponent }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(tpsdChildRoutes)]
})

export class TpsdRoutesModule { }