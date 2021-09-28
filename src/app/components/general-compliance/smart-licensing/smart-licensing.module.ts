import { NgModule } from '@angular/core';
import { SmartLicensingComponent } from './smart-licensing.component';
import { DemoEloComponent } from './demo-elo/demo-elo.component';
import { EngineeringInterlockComponent } from './engineering-interlock/engineering-interlock.component';
import { EngineeringResponseComponent } from './engineering-response/engineering-response.component';
import { InitiateComponent } from './initiate/initiate.component';
import { TestingComponent } from './testing/testing.component';
import { SharedComDirModule } from '../../../shared/shared-com-dir.module';
import { OperationalReadinessComponent } from './operational-readiness/operational-readiness.component';
import { SlImplementationComponent } from './sl-implementation/sl-implementation.component';
import { SmartLicensingHelpComponent } from './shared/smart-licensing-help/smart-licensing-help.component';
import { EngagementFormComponent } from './initiate/engagement-form/engagement-form.component';
import { UserSearchDirComponent } from './initiate/user-search-dir/user-search-dir.component';
import { SubmitConformationComponent } from './initiate/submit-conformation/submit-conformation.component';
import { SmartLicensingRoutingModule } from './smart-licensing-routing.module';
import { GeneralComplianceModule } from '../general-compliance.module';
import { QuestionnaireNavigationTabsComponent } from '@cpdm-shared/components/questionnaire-navigation-tabs/questionnaire-navigation-tabs.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    SmartLicensingComponent,
    DemoEloComponent,
    EngineeringInterlockComponent,
    EngineeringResponseComponent,
    InitiateComponent,
    TestingComponent,
    OperationalReadinessComponent,
    SlImplementationComponent,
    SmartLicensingHelpComponent,
    EngagementFormComponent,
    UserSearchDirComponent,
    SubmitConformationComponent,
    QuestionnaireNavigationTabsComponent
  ],
  imports: [
    SharedComDirModule,
    SmartLicensingRoutingModule,
    GeneralComplianceModule,
    MatRadioModule,
    MatCheckboxModule
  ],
  exports: [

  ],
  entryComponents: [SmartLicensingHelpComponent, EngagementFormComponent, SubmitConformationComponent]
})
export class SmartLicensingModule { }
