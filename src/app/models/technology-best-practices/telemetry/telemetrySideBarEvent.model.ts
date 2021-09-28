import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';
export type telemetryComponent =  'plan' | 'implement' | 'complete';

export interface TelemetrySideBarEventModel extends SideBarEventModel {
    currentTab: { name: telemetryComponent; number: number };
}
