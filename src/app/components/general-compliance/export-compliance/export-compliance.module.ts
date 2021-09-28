import { NgModule } from '@angular/core';

/**
 * Component
 */
 import { EcCompleteComponent } from './ec-complete/ec-complete.component';
 import { EcLinkGenerateComponent } from './ec-link-generate/ec-link-generate.component';
 import { EcSubmitAssignClassifyComponent } from './ec-submit-assign-classify/ec-submit-assign-classify.component';
 import { ExportComplianceComponent } from './export-compliance.component';

/**
 * Service 
 */ 
import { ExportComplianceService } from '@cpdm-service/general-compliance/export-compliance/export-compliance.service';

/**
 * Module
 */
import { GeneralComplianceModule } from '../general-compliance.module';
import { ExportComplianceRoutesModule } from './export-compliance-routing.module';

@NgModule({
    declarations: [ExportComplianceComponent, EcLinkGenerateComponent, EcSubmitAssignClassifyComponent, EcCompleteComponent],
    imports: [ExportComplianceRoutesModule, GeneralComplianceModule],
    providers: [ExportComplianceService]

})
export class ExportComplianceModule {}