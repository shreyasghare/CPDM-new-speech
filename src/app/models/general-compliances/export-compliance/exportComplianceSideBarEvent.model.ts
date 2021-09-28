import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type exportComplianceStepName = 'create_link' | 'plan-discover_register_execute' | 'complete';

export interface ExportComplianceSideBarEventModel extends SideBarEventModel {
    currentTab: { 
        name: exportComplianceStepName;
        number: number;
    };
}