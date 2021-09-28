import { NgModule } from '@angular/core';
// test cmt
/**
 * Components
 */
import { GlobalizationComponent } from './globalization.component';
import { GzRequirementChecklistModalComponenet } from './gz-requirements/gz-requirement-checklist-modal/gz-requirement-checklist-modal.component';
import { GzServiceSelectionQuestionnaireModalComponenet } from './gz-requirements/gz-service-selection-questionnaire-modal/gz-service-selection-questionnaire-modal.component'
/**
 * Module
 */
import { AdditionalRequirementsModule } from '../additional-requirements.module';
import { GzRequirementsComponent } from './gz-requirements/gz-requirements.component';
import { GzImplementationSignOffComponent } from './gz-implementation-sign-off/gz-implementation-sign-off.component';
import { GzCompleteComponent } from './gz-complete/gz-complete.component';
import { GlobalizationRoutesModule } from './globalization-routing.module';

@NgModule({
  declarations: [
    GlobalizationComponent,
    GzRequirementsComponent,
    GzImplementationSignOffComponent,
    GzCompleteComponent,
    GzRequirementChecklistModalComponenet,
    GzServiceSelectionQuestionnaireModalComponenet
  ],
  imports: [
    GlobalizationRoutesModule,
    AdditionalRequirementsModule
  ],
  entryComponents: [
    GzRequirementChecklistModalComponenet,
    GzServiceSelectionQuestionnaireModalComponenet
  ]
})
export class GlobalizationWfModule { }
