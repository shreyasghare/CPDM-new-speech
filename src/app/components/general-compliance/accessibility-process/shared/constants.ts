export const listOfAdrItems = {
    message: '',
    status: 'List of ADR Items',
    icon: 'submit'
};

export const listOfApplicableAdrItems = {
    message: '',
    status: 'List of applicable ADR Items',
    icon: 'submit'
}

export const adrItemIdentified = {
    message: `The identified ADR items are also sent to the Accessibility Team.
              For any queries, contact accessibility@cisco.com.`,
    status: 'ADR items identified',
    icon: 'complete'
};

export const adrChecklistApproval = {
    message: `The ADR Checklist has been submitted to the Accessibility Team and is pending approval.
              Please wait for the approval/rejection notification for next steps.
              For any queries, contact accessibility@cisco.com.`,
    status: 'ADR Checklist submitted for approval',
    icon: 'review'
};

export const identifyingAdr = {
    message: `The Project Manager is identifying the ADR items.
              The identified ADR items can be viewed when the identification is complete.`,
    status: 'Identifying ADRs',
    icon: 'submit'
};

export const adrItemsIdentified = {
    message: ``,
    status: 'ADR items identified',
    icon: 'complete'
};

export const puttingStatusAndComments = {
    message: `The Project Manager is putting status and comments to the ADR items. 
    The ADR list can be viewed after completion`,
    status: 'Putting status and comments',
    icon: 'chat'
};

export const checklistRevised = {
    message: `The Project Manager has resubmitted the revised ADR Checklist`,
    status: 'Checklist revised',
    icon: 'submit'
};

export const customTabs =  [
    { tabNumber: 1, tabName: 'Web', totalAdr: 0, selectedAdr: 0, active: true, isTraversed: true, isDisabled: false },
    { tabNumber: 2, tabName: 'Software', totalAdr: 0, selectedAdr: 0, active: false, isTraversed: false, isDisabled: false },
    { tabNumber: 3, tabName: 'Documentation', totalAdr: 0, selectedAdr: 0, active: false, isTraversed: false, isDisabled: false },
    { tabNumber: 4, tabName: 'Hardware', totalAdr: 0, selectedAdr: 0, active: false, isTraversed: false, isDisabled: false }
];