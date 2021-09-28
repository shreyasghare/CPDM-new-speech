import { NgModule } from '@angular/core';
/**
 * Component
 */
import { CsdlComponent } from './csdl.component';
import { CsdlCreateComponent } from './csdl-create/csdl-create.component';
import { CsdlPlanExecuteComponent } from './csdl-plan-execute/csdl-plan-execute.component';
import { CsdlCompleteComponent } from './csdl-complete/csdl-complete.component';
import { CsdlProjectModalComponent } from './csdl-create/csdl-project-modal/csdl-project-modal.component';
import { CsdlCreateProjectModalComponent } from './csdl-create/csdl-create-project-modal/csdl-create-project-modal.component';

/**
 * Service 
 */ 
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';

/**
 * Module
 */
import { GeneralComplianceModule } from '../general-compliance.module';
import { CsdlRoutesModule } from './csdl-routing.module';

@NgModule({
    declarations: [CsdlComponent, CsdlCreateComponent, CsdlPlanExecuteComponent, CsdlCompleteComponent, CsdlProjectModalComponent, CsdlCreateProjectModalComponent],
    entryComponents: [CsdlProjectModalComponent, CsdlCreateProjectModalComponent],
    imports: [CsdlRoutesModule, GeneralComplianceModule],
    providers: [CsdlService]

})
export class CSDLModule {}