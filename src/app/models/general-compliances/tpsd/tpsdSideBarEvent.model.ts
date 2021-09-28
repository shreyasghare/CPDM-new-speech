import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type tpsdStepName = 'create_link' | 'plan-discover_register_execute' | 'complete';

export interface TpsdSideBarEventModel extends SideBarEventModel {
    currentTab: { name: tpsdStepName; number: number };
}
