import { Recommendation } from "@cpdm-model/technology-best-practices/serviceability/serviceability.model";

export class RecommendationDataModel {
    createdOn: string;
    originalImage: string;
    priority: [string];
    recommendations: Recommendation[];
    thumbnailImage: string;
    title: string;
    version : {
        value: number;
        name: string;
        latest: boolean;
        draft: boolean;
    }
    _v: number;
    _id: string;
}
export class ProfileDetails {
    public profile: string;
    public subProfiles: string[];
  }