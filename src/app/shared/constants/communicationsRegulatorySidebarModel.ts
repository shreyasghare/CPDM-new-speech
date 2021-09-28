import { SidebarDataModel } from "@cpdm-model/SidebarDataModel";

export class CommunicationsRegulatorySidebarModel {
    CommunicationsRegulatorySidebarData: SidebarDataModel[] = [
    {
        alias: 'submit',
        title: 'Submit',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'identify',
        title: 'Identify',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'implement',
        title: 'Implement',
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