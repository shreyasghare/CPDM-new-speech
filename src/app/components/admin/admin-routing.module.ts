import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditDetailsAdminComponent } from './edit-details-admin/edit-details-admin.component';


const adminRoutes: Routes = [
    { path: 'edit-modals-info-icons', component: EditDetailsAdminComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(adminRoutes)
    ]
})

export class AdminRoutingModule {}
