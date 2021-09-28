import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueRecognitionComponent } from './revenue-recognition.component';
import { InfoHelperComponent } from './shared/info-helper/info-helper.component';
import { RevenueRecognitionHelpComponent } from './shared/revenue-recognition-help/revenue-recognition-help.component';
import { AssessmentQuestionnairePopupComponent } from './rcl-pid-submit/assessment-questionnaire-popup/assessment-questionnaire-popup.component';
import { SubmitConfirmationComponent } from './shared/submit-confirmation/submit-confirmation.component';
import { RevenueRecognitionRoutingModule } from './revenue-recognition-routes.module';
import { GeneralComplianceModule } from '../general-compliance.module';
import { ReviewListComponent } from '@cpdm-shared/components/review-list/review-list.component';
import { CommentListComponent } from '@cpdm-shared/components/comment-list/comment-list.component';
import { RclPidSubmitComponent } from './rcl-pid-submit/rcl-pid-submit.component';
import { FmvAssessmentComponent } from './fmv-assessment/fmv-assessment.component';
import { CompleteComponent } from './complete/complete.component';
import { RclPidApproveComponent } from './rcl-pid-approve/rcl-pid-approve.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    RevenueRecognitionComponent,
    RclPidSubmitComponent,
    RclPidApproveComponent,
    CompleteComponent,
    RevenueRecognitionHelpComponent,
    AssessmentQuestionnairePopupComponent,
    SubmitConfirmationComponent,
    ReviewListComponent,
    CommentListComponent,
    FmvAssessmentComponent
  ],
  imports: [
    CommonModule,
    RevenueRecognitionRoutingModule,
    GeneralComplianceModule,
    MatCheckboxModule
  ],
  exports: [

  ],
  entryComponents: [InfoHelperComponent, RevenueRecognitionHelpComponent, AssessmentQuestionnairePopupComponent, SubmitConfirmationComponent]
})
export class RevenueRecognitionModule { }
