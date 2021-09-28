import { NgModule } from '@angular/core';
import { SharedComDirModule } from '@cpdm-shared/shared-com-dir.module';
import { CuiModalModule, CuiSelectModule, CuiTabsModule } from '@cisco-ngx/cui-components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

@NgModule({
    imports: [
        SharedComDirModule,
        CuiModalModule,
        CuiSelectModule,
        CuiTabsModule,
        MatCheckboxModule,
        MatListModule
    ],
    exports: [
        SharedComDirModule,
        CuiModalModule,
        CuiSelectModule,
        CuiTabsModule,
        MatCheckboxModule,
        MatListModule
    ]
})

export class AdditionalRequirementsModule {}
