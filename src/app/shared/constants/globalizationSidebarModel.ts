import { SidebarDataModel } from "@cpdm-model/SidebarDataModel";

export class GlobalizationSidebarModel {
    GlobalizationSidebarData: SidebarDataModel[] = [
    {
        alias: 'requirements',
        title: 'Requirements',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'implementationSignoff',
        title: 'Implementation Sign-off',
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