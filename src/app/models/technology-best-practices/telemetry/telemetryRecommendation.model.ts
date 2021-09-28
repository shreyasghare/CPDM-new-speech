export interface TelemetryRecommendationModel {
    recommendations: Recommendation[];
    savedFilters: {
        tag: [];
        status: [];
        priority: [];
    };
    status: [string];
    version: {
        value: number;
        name: string;
        latest: boolean;
    };
}

export interface Recommendation {
    position: number;
    uniqueIdentifier: string;
    tag: string;
    recommendationDesc: string;
    priority: string;
    embeddedApps: string;
    onOffPrem: string;
    businessOperational: string;
    status: string;
    comment?: string;
}
