export interface ServiceabilityModel {
    _id: string;
    projectId: string;
    projectDetails: {
        name: string;
    };
    workflow: {
        active: 'plan' | 'implement' | 'complete';
        next: string;
        timestamp: {
            plan: Date;
            implement: Date;
            complete: Date;
        };
    };
    isImplementRequired: boolean;
    implementation: {
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
    };
    savedFilters: {
        productType: [];
        profile: [];
        subProfiles: [];
        conformanceLevel: [];
        status: [];
    };
    version: Version;
    recommendationStatus: 'notSaved' | 'saved';
    recommendations: Recommendation[];
    __v: number;
    betaFlag: boolean;
}

export interface Recommendation {
    position: number,
    uniqueIdentifier: string,
    uidName: string,
    profile: string,
    subProfiles: string,
    recommendationDesc: string,
    conformanceLevel: string,
    productType?: [string],
    status: string,
    comment?: string,
    subProfileArray?: string[]
}

export interface Version {
    value: number;
    name: string;
    latest: boolean;
}
export interface SavedFilters {
    productType: { name: string; selected: boolean; }[];
    profile: { name: string; selected: boolean; }[];
    subProfiles: { name: string; selected: boolean; }[];
    status: { name: string; selected: boolean; }[];
    conformanceLevel: { name: string; selected: boolean; }[];
}