import { SidebarDataModel } from "@cpdm-model/SidebarDataModel";

export class RevRecSidebarModel {
  revRecSideBarData: SidebarDataModel[] = [{
    alias: 'rclPidSubmit',
    title: 'RCL/PID Submit',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'rclPidApprove',
    title: 'RCL/PID Approve',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
    alias: 'fmvAssessment',
    title: 'FMV Assessment',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  }, {
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