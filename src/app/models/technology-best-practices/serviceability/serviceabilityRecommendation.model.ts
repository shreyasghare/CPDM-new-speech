import { Recommendation, Version } from "./serviceability.model";

export interface ServiceabilityRecModel {
    recommendations: Recommendation[];
    status: ['No Selection', 'Adopted', 'Not applicable', 'Current Release', 'Future Release'];
    savedFilters: {
        productType: {},
        profile: {},
        subProfiles: {},
        conformanceLevel: {},
        status: {}
    };
    version: Version;
}