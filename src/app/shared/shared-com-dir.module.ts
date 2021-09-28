/**
 * Modules
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuiLoaderModule } from '@cisco-ngx/cui-components';
import { CuiSpinnerModule, CuiTabsModule } from '@cisco-ngx/cui-components';
import { MatTableModule, MatSortModule, MatTooltipModule, MatSelectModule, MatDialogModule
        , MatDatepickerModule, MatInputModule, MatNativeDateModule, MatFormFieldModule,
        MatAutocompleteModule, MatExpansionModule, MatRadioModule
      } from '@angular/material';

/**
 * Directives
 */
import { ActiveClassDirecive } from '@cpdm-shared/directives/add-class-directive';
import { DragDropDirective } from '@cpdm-shared/directives/drag-drop.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { HasRoleDirective } from './directives/has-role.directive';

/**
 * Components
 */
import { ShowOwnersCustomTooltipComponent } from './components/show-owners-custom-tooltip/show-owners-custom-tooltip.component';
import { CustomDropzoneComponent } from './components/custom-dropzone/custom-dropzone.component';
import { InfoHelperComponent } from '../components/general-compliance/revenue-recognition/shared/info-helper/info-helper.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ProcessSidebarComponent } from './components/process-sidebar/process-sidebar.component';
import { NavigationTabsComponent } from './components/navigation-tabs/navigation-tabs.component';
import { ManualImplementationComponent } from './components/manual-implementation/manual-implementation.component';
import { PushToRepositoryComponent } from './components/push-to-repository/push-to-repository.component';
import { HoldingStatusComponent } from '@cpdm-shared/components/holding-status/holding-status.component';
import { EpicErrorComponent } from './components/epic-error/epic-error.component';
import { GenericErrorComponent } from './components/generic-error/generic-error.component';
import { FeatureErrorComponent } from './components/feature-error/feature-error.component';
import { ForbiddenErrorComponent } from './components/forbidden-error/forbidden-error.component';
import { StatusInfoDialogComponent } from './components/status-info-dialog/status-info-dialog.component';
import { HelpOverlayComponent } from './components/help-overlay/help-overlay.component';
import { StackableMultilevelStepsSidebarComponent } from './components/stackable-multilevel-steps-sidebar/stackable-multilevel-steps-sidebar.component';
import { AccessibilityInfoHelperComponent } from '@cpdm-component/general-compliance/accessibility-process/accessibility-info-helper/accessibility-info-helper.component';
import { InfoHelperNewComponent } from './components/info-helper-new/info-helper-new.component';
import { CustomConfirmationDialogComponent } from './components/custom-confirmation-dialog/custom-confirmation-dialog.component';

@NgModule({
  declarations: [
    ActiveClassDirecive,
    ShowOwnersCustomTooltipComponent,
    DragDropDirective,
    CustomDropzoneComponent,
    AutofocusDirective,
    HasRoleDirective,
    ConfirmationDialogComponent,
    InfoHelperComponent,
    ProcessSidebarComponent,
    NavigationTabsComponent,
    ManualImplementationComponent,
    PushToRepositoryComponent,
    HoldingStatusComponent,
    EpicErrorComponent,
    GenericErrorComponent,
    FeatureErrorComponent,
    ForbiddenErrorComponent,
    StatusInfoDialogComponent,
    HelpOverlayComponent,
    StackableMultilevelStepsSidebarComponent,
    AccessibilityInfoHelperComponent,
    InfoHelperNewComponent,
    CustomConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    CuiLoaderModule,
    CuiSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatSortModule,
    MatTooltipModule,
    MatSelectModule ,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    CuiTabsModule,
    MatExpansionModule,
    MatRadioModule,
    MatTableModule
  ],
  exports: [
    ActiveClassDirecive,
    DragDropDirective,
    CustomDropzoneComponent,
    AutofocusDirective,
    HasRoleDirective,
    ShowOwnersCustomTooltipComponent,
    CommonModule,
    CuiLoaderModule,
    CuiSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ProcessSidebarComponent,
    NavigationTabsComponent,
    MatSortModule,
    MatTooltipModule,
    MatSelectModule ,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    ManualImplementationComponent,
    PushToRepositoryComponent,
    HoldingStatusComponent,
    MatAutocompleteModule,
    MatExpansionModule,
    MatRadioModule,
    MatTableModule,
    StackableMultilevelStepsSidebarComponent
  ],
  entryComponents: [
    InfoHelperComponent,
    ConfirmationDialogComponent,
    EpicErrorComponent,
    GenericErrorComponent,
    FeatureErrorComponent,
    ForbiddenErrorComponent,
    StatusInfoDialogComponent,
    HelpOverlayComponent,
    AccessibilityInfoHelperComponent,
    InfoHelperNewComponent,
    CustomConfirmationDialogComponent
  ]
})
export class SharedComDirModule { }
