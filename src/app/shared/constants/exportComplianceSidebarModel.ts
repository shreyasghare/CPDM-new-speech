import { SidebarDataModel } from "@cpdm-model/SidebarDataModel";

export class exportComplianceSidebarModel {
  exportComplianceSidebarData: SidebarDataModel[] = [
    {
        alias: 'link_generate',
        title: 'Link/Generate',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'submit_assign_classify',
        title: 'Submit/Assign/Classify',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'complete',
        title: 'Complete',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: false
    }]
}