import { NgModule } from '@angular/core';
import { ProjectRoutingModule } from './project-routing.module';
import { ApplicabilityHelperComponent } from './create-project/applicability-helper/applicability-helper.component';
import { CreateProjectFormComponent } from './create-project/create-project-form/create-project-form.component';
import { EditProjectComponent } from './create-project/edit-project/edit-project.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { CommentPopupComponent } from './project-details/comment-popup/comment-popup.component';
import { ComplianceItemsTableComponent } from './project-details/compliance-items-table/compliance-items-table.component';
import { CreateCommitComponent } from './project-details/create-commit/create-commit.component';
import { EditAcceptorOwnerComponent } from './project-details/edit-acceptor-owner/edit-acceptor-owner.component';
import { EditAcceptorOwnerPopUpComponent } from './project-details/edit-acceptor-owner-pop-up/edit-acceptor-owner-pop-up.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ManageComplianceItemComponent } from './project-details/manage-compliance-item/manage-compliance-item.component';
import { TechnologyItemsTableComponent } from './project-details/technology-items-table/technology-items-table.component';
import { CommonModule } from '@angular/common';
import { CuiSelectModule } from '@cisco-ngx/cui-components';
import {
  MatDatepickerModule,
  MatFormFieldModule,
  MatNativeDateModule,
  MatInputModule
} from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { SharedComDirModule } from 'src/app/shared/shared-com-dir.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AddRemoveMemberComponent } from 'src/app/shared/components/add-remove-member/add-remove-member.component';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    ApplicabilityHelperComponent,
    CreateProjectFormComponent,
    EditProjectComponent,
    CreateProjectComponent,
    CommentPopupComponent,
    ComplianceItemsTableComponent,
    CreateCommitComponent,
    EditAcceptorOwnerComponent,
    EditAcceptorOwnerPopUpComponent,
    ManageComplianceItemComponent,
    TechnologyItemsTableComponent,
    ProjectDetailsComponent,
    AddRemoveMemberComponent
  ],

  imports: [
    CommonModule,
    ProjectRoutingModule,
    CuiSelectModule,
    MatTooltipModule,
    SharedComDirModule,
    MatSelectModule,
    ModalModule.forRoot(),
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatDatepickerModule
  ],
  entryComponents: [
    ManageComplianceItemComponent,
    EditAcceptorOwnerComponent,
    EditAcceptorOwnerPopUpComponent,
    CommentPopupComponent
  ]
})

export class ProjectModule {}
