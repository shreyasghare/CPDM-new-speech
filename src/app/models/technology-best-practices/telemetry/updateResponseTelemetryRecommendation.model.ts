export interface UpdateResponseTelemetryRecommendationModel {
    version: {
        value: number,
        name: string,
        latest: string
    };
    workflow: {
        active: string
    };
    savedFilters: {
        tag: { 'recommendations.tag': string }[],
        priority: { 'recommendations.priority': string }[],
        embeddedApps: { 'recommendations.embeddedApps': string }[],
        onOffPrem: { 'recommendations.onOffPrem': string }[],
        businessOperational: { 'recommendations.businessOperational': string }[],
        status: { 'recommendations.status': string }[]
    };
    implementation: {
        isManualImplementation: boolean
    };
    recommendationStatus: string;
    _id: string;
    projectId: string;
    __v: number;
    recommendations: [
        {
            status: string,
            position: number,
            uniqueIdentifier: string,
            tag: string,
            recommendationDesc: string,
            priority: string,
            comment: string,
            embeddedApps: string,
            onOffPrem: string,
            businessOperational: string
        }
    ];
}
