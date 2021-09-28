import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type serviceabilityComponent =  'plan' | 'implement' | 'complete';

export interface ServiceabilitySideBarEventModel extends SideBarEventModel {
    currentTab: { name: serviceabilityComponent; number: number };
}
