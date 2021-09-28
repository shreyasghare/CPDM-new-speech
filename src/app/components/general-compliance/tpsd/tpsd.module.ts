import { NgModule } from '@angular/core';
/**
 * Component
 */
import { TpsdComponent } from './tpsd.component';

/**
 * Service 
 */ 
import { TpsdService } from '@cpdm-service/general-compliance/tpsd/tpsd.service';

/**
 * Module
 */
import { GeneralComplianceModule } from '../general-compliance.module';
import { TpsdRoutesModule } from './tpsd-routing.module';
import { TpsdCreateLinkComponent } from './tpsd-create-link/tpsd-create-link.component';
import { TpsdDiscoverRegisterExecuteComponent } from './tpsd-discover-register-execute/tpsd-discover-register-execute.component';
import { TpsdCompleteComponent } from './tpsd-complete/tpsd-complete.component';

@NgModule({
    declarations: [TpsdComponent, TpsdCreateLinkComponent, TpsdDiscoverRegisterExecuteComponent, TpsdCompleteComponent],
    imports: [TpsdRoutesModule, GeneralComplianceModule],
    providers: [TpsdService]

})
export class TpsdModule{}