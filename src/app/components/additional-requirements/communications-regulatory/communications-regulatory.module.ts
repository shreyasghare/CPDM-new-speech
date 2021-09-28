import { NgModule } from '@angular/core';

/**
 * Component
 */
import { CommunicationsRegulatoryComponent } from './communications-regulatory.component';
import { CrcSubmitComponent } from './crc-submit/crc-submit.component';
import { CrcIdentifyComponent } from './crc-identify/crc-identify.component';
import { CrcImplementComponent } from './crc-implement/crc-implement.component';
import { CrcCompleteComponent } from './crc-complete/crc-complete.component';
import { CrcAssessmentQuestionaireModalComponent } from './crc-submit/crc-assessment-questionaire-modal/crc-assessment-questionaire-modal.component'
import { CrcIdentifyPmComponent } from './crc-identify/crc-identify-pm/crc-identify-pm.component';
import { CrcIdentifyPoComponent } from './crc-identify/crc-identify-po/crc-identify-po.component';
import { CrcRecommendationsModalComponent } from './crc-identify/crc-recommendations-modal/crc-recommendations-modal.component';

/**
 * Service 
 */ 
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';

/**
 * Module
 */
import { AdditionalRequirementsModule } from '../additional-requirements.module';
import { CommunicationsRegulatoryRoutesModule } from './communications-regulatory-routing.module';
import { CrcImplementPmComponent } from './crc-implement/crc-implement-pm/crc-implement-pm.component';
import { CrcImplementPoComponent } from './crc-implement/crc-implement-po/crc-implement-po.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';

@NgModule({
    declarations: [
        CommunicationsRegulatoryComponent,
        CrcSubmitComponent,
        CrcAssessmentQuestionaireModalComponent,
        CrcIdentifyComponent,
        CrcIdentifyPmComponent,
        CrcIdentifyPoComponent,
        CrcRecommendationsModalComponent,
        CrcImplementComponent,
        CrcCompleteComponent,
        CrcImplementPmComponent,
        CrcImplementPoComponent,
        ConfirmationComponent],
    imports: [
        CommunicationsRegulatoryRoutesModule,
        AdditionalRequirementsModule],
    providers: [
        CommunicationsRegulatoryService
    ],
    entryComponents: [
        CrcAssessmentQuestionaireModalComponent,
        CrcRecommendationsModalComponent,
        ConfirmationComponent
    ]
})
export class CommunicationsRegulatoryModule {}