export interface StartGlobalizationModel {
    success: boolean;
    data: {
        globalizationId: string;
    };
}
export interface GlobalizationModel {
    _id: string;
    workflow: {
        active: 'requirements' | 'implementionSignOff' | 'complete';
        timestamp: {
            requirements: Date;
            implementionSignOff: Date;
            complete: Date;
        };
    };
    betaFlag: boolean;
    projectId: string;
    projectName: string;
    requirements: {
        defineStategy: GlobalizationStrategyModel;
        serviceRequest: ServiceRequestModel;
        requirementsChecklist: RequirementCheckListModel;
    };
    implementation: {
        serviceRequestList: serviceRequestListModel[];
        poComments: [{
            comment: string;
            commentedBy: string;
            commentedOn: Date;
        }];
    };
    __v: number;
}

export interface GlobalizationStrategyModel {
    projectId: string;
    globalizationStratery: string;
    productDetails: {
        productName: string;
        productVersion: string; 
        expectedDeliveryDate: string
    };
    tabStatus: {
        status: string;
        timestamp: string;
    }
}
export interface ServiceRequestModel {
    serviceSelection: string;
    serviceRequestList: serviceRequestListModel[];
    serviceRequestQuestionaire: object;
}

export interface serviceRequestListModel {
    name : string,
    uniqueKey : string,
    selected : boolean,
    mandatoryForTurnKeyService : boolean,
    mandatoryForIndividualService : boolean
}

export interface RequirementCheckListModel {
    checklistSection: {
        checklist: CheckListModel[];
        mandatoryQuestionsYetToBeAnswered: number;
        noOfQuestionsAnswered: number;
        startedFlag: boolean;
        completedFlag:boolean;
        status: string;
    };
    pmcomments: [];
    poComments: [];
}
export interface CheckListModel {
    checklistNumber: number;
    checklistSelected: boolean;
    checklistText: string;
    pocCecId?: string
}