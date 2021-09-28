import { Recommendation, Version } from '@cpdm-model/technology-best-practices/ipv6/ipv6.model';
export interface IPv6RecommendationModel {
    recommendations: Recommendation[];
    status: ['No Selection', 'Adopted', 'Not applicable', 'Current Release', 'Future Release'];
    version: Version;
}
