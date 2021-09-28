export interface UpdatedWebRecommendationModel {
    recommendations: [
        {
            status: string;
            position: number;
            uniqueIdentifier: string;
            tag: string;
            recommendationDesc: string;
            priority: string;
            comment: string;
        }
    ];
    savedFilters: {
        tag: { 'recommendations.tag': string }[],
        priority: { 'recommendations.priority': string }[],
        status: { 'recommendations.status': string }[]
    };
    recommendationStatus: string;
}
