import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevenueRecognitionComponent } from './revenue-recognition.component';
import { RclPidSubmitComponent } from './rcl-pid-submit/rcl-pid-submit.component';
import { RclPidApproveComponent } from './rcl-pid-approve/rcl-pid-approve.component';
import { FmvAssessmentComponent } from './fmv-assessment/fmv-assessment.component';
import { CompleteComponent } from './complete/complete.component';

// const revenueRecognitionRoutes: Routes = [
//   {path: ':id', component: RevenueRecognitionComponent }
// ];

const revenueRecognitionRoutes: Routes = [{
  path: ':id',
  component: RevenueRecognitionComponent,
  children: [
    { path: 'rclPidSubmit', component: RclPidSubmitComponent },
    { path: 'rclPidApprove', component: RclPidApproveComponent },
    { path: 'fmvAssessment', component: FmvAssessmentComponent },
    { path: 'complete', component: CompleteComponent },
  ]
}];

@NgModule({
  imports: [
    RouterModule.forChild(revenueRecognitionRoutes)
  ]
})

export class RevenueRecognitionRoutingModule { }
