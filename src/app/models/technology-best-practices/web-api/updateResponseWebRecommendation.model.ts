export interface UpdateResponseWebRecommendationModel {
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
            comment: string
        }
    ];
}
