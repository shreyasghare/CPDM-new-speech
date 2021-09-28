import { User } from './user.model';

export interface InitiateQuestionerModel {
    questionnaires: {
        answers: QuestionAnswerInterface[];
        invitationSend: boolean;
        state: string;
    };
}

export interface QuestionAnswerInterface {
    answer: string | MemberInterface[];
    questionNumber: string;
    _id: string;
}

export interface MemberInterface {
    fullname: string;
    id: string;
    name: string;
}
export interface SLProcessQuestionnaireinterface {
    slId: string;
    sLEngagedChoice: string;
    sLReleaseChoice: string;
}

export interface SEEMNotificationInterface {
    members: string;
    projectName: string;
    pm: User;
    projectId:string;
}