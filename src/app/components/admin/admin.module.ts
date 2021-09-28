import { NgModule } from '@angular/core';
/**
 * Components
 */
import { EditDetailsAdminComponent } from './edit-details-admin/edit-details-admin.component';
import { ImageContentEditComponent } from './edit-details-admin/image-content-edit/image-content-edit.component';
import { ReccomendationEditTableComponent } from './edit-details-admin/image-content-edit/reccomendation-edit-table/reccomendation-edit-table.component';

/**
 * Modules
 */
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedComDirModule } from 'src/app/shared/shared-com-dir.module';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

/**
 * Services
 */
import { EditDetailsAdminService } from '@cpdm-service/admin/edit-details-admin.service';
@NgModule({
    declarations: [
        EditDetailsAdminComponent,
        ImageContentEditComponent,
        ReccomendationEditTableComponent
    ],
    imports: [
        AdminRoutingModule,
        SharedComDirModule,
        MatTableModule,
        CommonModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot()
    ],
    providers: [EditDetailsAdminService],
    entryComponents: [ReccomendationEditTableComponent]
})

export class AdminModule {}