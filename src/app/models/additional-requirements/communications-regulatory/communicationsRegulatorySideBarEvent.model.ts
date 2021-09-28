import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type crcStepName = 'submit' | 'identify' | 'implement' | 'complete';

export interface communicationsRegulatorySideBarEvent extends SideBarEventModel {
    currentTab: { 
        name: crcStepName;
        number: number;
    };
}