export interface RevenueRecognitionModel {
    _id: string;
    projectId: string;
    rclAssessmentQuestionnaire: {
        answers: [];
        answeredQuestionsCount: Number;
        remaningQuestionsCount: Number;
        status: string;
        questionnnaireLogic: {
            areAnyFirstSeventeenHasAnswerYes: Boolean;
        }
    };
    docCentralLinks: {
        rclPidSubmit : {
            scopingChecklist : {};
            assessmentChecklist:{};
        };
        fmvAssessment: {
            fmv : []
        };
    };
    rclPidSubmit:{
       status: string;
    },
    rclPidApprove: {};
    fmvAssessment: {
        status: string; 
    };
    workflowTimestamp: {
        rclPidSubmit: Date;
        rclPidApprove: Date;
        fmvAssessment: Date;
        complete: Date;
    };
    buController:{
        _id: string;
        cecId: string;
        name: string;
        bussinessEntity: string;
        businessUnit: string;
    };
    emailStatus:{
        rclReuploaded: string;
        pidReuploaded: string;
    };
    betaFlag: boolean;
    alternateProxy: {
        name: string;
        cecId: string;
    };   
    fmvNotApplicable?: {
        status: String;
        comment: String;
    };
    skipPidListUpload :{
        flag: Boolean;
        comments: String;
     };
}