export interface SidebarDataModel {
  alias: string;
  title: string;
  isEnabled: boolean;
  isActive: boolean;
  isCompleted: boolean;
  completedOn: string;
  showInfoIcon: boolean;
  showTimestampStatus: boolean;
  footerTextForNext?: string;
}
