import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type globalizationStepName = 'requirements' | 'implementionSignOff' | 'complete';

export interface globalizationSideBarEvent extends SideBarEventModel {
    currentTab: { 
        name: globalizationStepName;
        number: number;
    };
}