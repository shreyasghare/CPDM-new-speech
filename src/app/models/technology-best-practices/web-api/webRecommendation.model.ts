export interface WebRecommendationModel {
        recommendations: Recommendation[];
        status: [string];
        version: {
            value: number;
            name: string;
            latest: boolean;
        };
        recommendationCount: number;
}

export interface Recommendation {
    status?: string;
    position: number;
    uniqueIdentifier: string;
    tag: string;
    recommendationDesc: string;
    priority: string;
    comment?: string;
  }
