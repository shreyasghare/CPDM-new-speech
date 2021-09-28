export interface ApiProductsModel {
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
      productLanguage: string;
      otherDetails: string;
    };
    populateBacklog: Date;
  };
  savedFilters: {
    tag: { 'recommendations.tag': string }[],
    priority: { 'recommendations.priority': string }[],
    status: { 'recommendations.status': string }[]
  };
  version: {
    value: number;
    name: string;
    latest: boolean;
  };
  recommendationStatus: 'notSaved' | 'saved';
  recommendations: [{
    status: string;
    position: number;
    uniqueIdentifier: string;
    tag: string;
    recommendationDesc: string;
    priority: string;
    comment: string;
  }];
  __v: number;
  betaFlag:boolean;
}
