import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type csdlComponent = 'create' | 'plan-execute' | 'complete';

export interface CsdlSideBarEventModel extends SideBarEventModel {
    currentTab: { name: csdlComponent; number: number };
}
