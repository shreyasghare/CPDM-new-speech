export interface StartCRCWorkflowModel {
    success: boolean;
    data: {
        crcId: string;
    };
}
export interface CommunicationsRegulatoryModel {
    _id: string;
    workflow: {
        active: 'submit' | 'identify' | 'implement' | 'complete';
        timestamp: {
            submit: Date;
            identify: Date;
            implement: Date;
            complete: Date;
        };
    };
    betaFlag: boolean;
    projectId: string;
    projectDetails: {
        name: string
    };
    crcAssessmentQuestionnaire: {
        answers: [];
        isQuestionAnswered: boolean;
        status: string;
        fisrtThreeQuestionsAnsweredNo: boolean;
        remianingQuestionsCount: number;
        isApplicable: boolean;
        isQuestionnaireSubmitted: boolean;
        poComments: [{
            comment: string;
            commentedBy: string;
            commentedOn: Date;
            commentForIdentify: boolean;
        }];
        poReviewStatus: string;
    };
    crcSubmit:{
        status: string;
     },
    isUpdated: boolean;
    crcRecommendationsId: string;
    identify: IdentifyModel;
    implement: ImplementModel; 
    isTimestampAdded?: boolean;
    switchToStep?: string;
    __v: number;
}

export interface IdentifyModel {
    recommendationStatus: string;
    poComments: [{
        comment: string;
        commentedBy: string;
        commentedOn: Date;
    }];
    pmComments: [{
        status: string;
        comment: string;
        commentedBy: string;
        commentedOn: Date;
    }];
}

export interface CRCRecommendationsObjectModel {
    _id: string;
    createdOn: Date;
    lastUpdatedOn: Date;
    communicationsRegulatoryId: String;
    createdBy: string;
    updatedBy: string;
    isNewRecommendationsAvailable: boolean;
    recommendations: RecommendationsModel[]
}

export interface RecommendationsModel {
    _id: string;
    position: number;
    title: string;
    description: string;
    comments: string;
    commentsChangedBy: string;
    isNewRecommendation: Boolean;
}

export interface ImplementModel {
    implementStatus: { type: String },
    createdOn: { type: Date },
    backlogDetails: {},
    isManualImplement: { type: Boolean, default: false },
    report: {
        moveToIdentify: { type: Boolean, default: false },
        poComments: [{
            status: string,
            comment: string,
            commentedOn: Date,
            commentedBy: string,
            commentForIdentify: boolean
        }],
    pmComments: [{
        comment: { type: String },
        commentedOn: { type: Date },
        commentedBy: { type: String }
    }],
    requirementImplemented:{ type: String },
    defectFixed:{ type: String }    
    }
}

export interface ImplementationReportModel {
    crcId: string,
	implement:{
		implementStatus: string,
		report:{
			requirementImplemented?: string,
			defectFixed?: string,
			updatedOn: Date,
            poComments?:{
                comment: string,
                commentedOn: Date,
                commentedBy: string
            }
            moveToIdentify?:boolean
        }
	}
}