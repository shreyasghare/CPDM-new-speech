import { NgModule } from '@angular/core';
import { AccessProcessRootComponent } from './access-process-root/access-process-root.component';
import { IdentifyADRsComponent } from './identify-adrs/identify-adrs.component';
import { ImplementationComponent } from './implementation/implementation.component';
import { AccessibilityOverviewComponent } from './accessibility-overview/accessibility-overview.component';
import { AdrCommentComponent } from './adr-comment/adr-comment.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AdrListApprovalComponent } from './adr-list-approval/adr-list-approval.component';
import { AdrNotAvailableComponent } from './shared/adr-not-available/adr-not-available.component';
import { PolicyTestingComponent } from './policy-testing/policy-testing.component';
import { ReleaseVpatComponent } from './release-vpat/release-vpat.component';
import { OauthCallbackComponent } from './oauth-callback/oauth-callback.component';
import { PrepareVpatComponent } from './prepare-vpat/prepare-vpat.component';
import { AdrNoStatusComponent } from './shared/adr-no-status/adr-no-status.component';
import { AccessibilityRoutingModule } from './accessibility-process-routing.module';
import { GeneralComplianceModule } from '../general-compliance.module';
import { ImportAdrChecklistDialogComponent } from './identify-adrs/import-adr-checklist-dialog/import-adr-checklist-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { AdrItemsDialogComponent } from './shared/adr-items-dialog/adr-items-dialog.component';
import { ApproveRejectComponent } from './shared/adr-items-dialog/approve-reject/approve-reject.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IdentifyAdrsConfirmationComponent } from './shared/adr-items-dialog/identify-adrs-confirmation/identify-adrs-confirmation.component';

@NgModule({
  declarations: [
    AccessProcessRootComponent,
    IdentifyADRsComponent,
    ImplementationComponent,
    AccessibilityOverviewComponent,
    AdrListApprovalComponent,
    AdrCommentComponent,
    AdrNotAvailableComponent,
    PolicyTestingComponent,
    ReleaseVpatComponent,
    OauthCallbackComponent,
    PrepareVpatComponent,
    AdrNoStatusComponent,
    ImportAdrChecklistDialogComponent,
    AdrItemsDialogComponent,
    ApproveRejectComponent,
    IdentifyAdrsConfirmationComponent
  ],
  imports: [
    AccessibilityRoutingModule,
    ModalModule.forRoot(),
    GeneralComplianceModule,
    MatTableModule,
    MatCheckboxModule
  ],
  exports: [  ],
  entryComponents: [
    AdrCommentComponent,
    AdrNotAvailableComponent,
    AdrNoStatusComponent,
    ImportAdrChecklistDialogComponent,
    AdrItemsDialogComponent,
    AccessibilityOverviewComponent,
    ApproveRejectComponent,
    IdentifyAdrsConfirmationComponent
  ]
})
export class AccessibilityProcessModule { }
