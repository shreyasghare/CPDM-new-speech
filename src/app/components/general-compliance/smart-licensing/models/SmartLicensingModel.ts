export interface SmartLicensingModel {
  projectId: { _id: string; name: string };
  status: {};
  skipTo: string;
  docCentralLinks: [];
  engineeringResponse: [];
  demoToElo: [];
  initiate: {
    engagementRequestForm: {
      state: 'notSubmitted' | 'saved' | 'submitted';
      answers: [
        {
          questionId: string;
          questionNumber: string;
          subQuestion: any[];
          answer: string | boolean | any[];
        }
      ];
      answeredQuestionsCount: number;
      savedQuestionsCount: number;
    };
    questionnaires: {
      state: 'notSubmitted' | 'saved' | 'submitted';
      answers: any[];
      invitationSend: boolean;
    };
  };
  workflowTimestamp: {
    initiate: Date;
    implementation: Date;
  };
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
  testing: any;
  betaFlag:boolean;
}
