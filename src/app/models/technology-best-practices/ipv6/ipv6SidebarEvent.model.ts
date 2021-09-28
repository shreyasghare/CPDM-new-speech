import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type IPv6Component =  'plan' | 'implement' | 'complete';

export interface IPv6SidebarEventModel extends SideBarEventModel {
    currentTab: { name: IPv6Component; number: number };
}
