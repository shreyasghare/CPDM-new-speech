import { SidebarDataModel } from '@cpdm-model/SidebarDataModel';

export const sidebarData: SidebarDataModel[] = [
  {
    alias: 'plan',
    title: 'Plan',
    isEnabled: true,
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
  },
];

/**
 * Side bar data for CSDL
 */
export const csdlSidebarData: SidebarDataModel[] = [
  {
    alias: 'create',
    title: 'Create',
    isEnabled: true,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true
  },
  {
    alias: 'plan_execute',
    title: 'Plan/Execute',
    isEnabled: false,
    isActive: false,
    isCompleted: false,
    completedOn: null,
    showInfoIcon: true,
    showTimestampStatus: true,
    footerTextForNext: `'Complete' will be enabled once the project is approved to ship`
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
  },
];

export const tpsdSidebarData: SidebarDataModel[] = [
    {
        alias: 'create_link',
        title: 'Create/Link',
        isEnabled: false,
        isActive: false,
        isCompleted: false,
        completedOn: null,
        showInfoIcon: true,
        showTimestampStatus: true
    },
    {
        alias: 'discover_register_execute',
        title: 'Discover/Register & Execute',
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
    }
];