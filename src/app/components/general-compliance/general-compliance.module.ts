import { NgModule } from '@angular/core';
import { SharedComDirModule } from '@cpdm-shared/shared-com-dir.module';
import { CuiModalModule, CuiSelectModule, CuiTabsModule } from '@cisco-ngx/cui-components';
import { CommonModule } from '@angular/common';
import { SingleReviewListComponent } from '@cpdm-shared/components/single-review-list/single-review-list.component';

@NgModule({
    declarations: [
        SingleReviewListComponent
    ],

    imports: [
        CommonModule,
        SharedComDirModule,
        CuiModalModule,
        CuiSelectModule,
        CuiTabsModule
    ],
    exports: [
        SharedComDirModule,
        CuiModalModule,
        CuiSelectModule,
        CuiTabsModule,
        CommonModule,
        SingleReviewListComponent
    ]
})

export class GeneralComplianceModule {}
