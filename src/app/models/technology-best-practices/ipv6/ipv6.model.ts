export interface IPv6Model {
    _id: string;
    IPv6Id: string;
    projectId: string;
    isImplementRequired: boolean;
    betaFlag: boolean;
    recommendationStatus: 'notSaved' | 'saved';
    __v: number;
    recommendations: Recommendation[];
    version: Version;
    workflow: Workflow;
    savedFilters: SavedFilters;
    projectDetails: {
        name: string
    };
    implementation: Implementation;
}

export interface Workflow {
    active: 'plan' | 'implement' | 'complete';
    next: 'plan' | 'implement' | 'complete';
    timestamp: {
        plan: Date,
        implement: Date,
        complete: Date
    };
}

export interface SavedFilters {
    productType: { name: string; selected: boolean; }[];
    status: { name: string; selected: boolean; }[];
    priority: { name: string; selected: boolean; }[];
}

export interface Version {
    value: number;
    name: string;
    latest: boolean;
}

export interface Recommendation {
    productTypes?: [{
        name: string,
        priority: string
    }];
    uniqueIdentifier: string;
    description?: string;
    position: number;
    status?: string;
    comment?: string;
}

export interface Implementation {
    isManualImplementation: boolean;
    repository: {
        source: string;
        rallyProjectId: string;
        rallyParentId: string;
        newFeature: string;
        newFeatureName: string;
        workspacePath: string;
        jiraServer: string;
        jiraParent: string;
    };
    populateBacklog: Date;
}
