import { SidebarDataModel } from './SidebarDataModel';

export interface SideBarEventModel {
  currentTab: { name: string; number: number };
  disableNextBtn: boolean;
  disablePreviousBtn: boolean;
  sidebarData: SidebarDataModel[];
}
