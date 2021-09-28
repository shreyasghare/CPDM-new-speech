import { SideBarEventModel } from '@cpdm-model/SideBarEventModel';

export type ApiProductsComponent =  'plan' | 'implemet' | 'complete';

export interface ApiProductsSideBarEventModel extends SideBarEventModel {
    currentTab: { name: ApiProductsComponent; number: number };
}
