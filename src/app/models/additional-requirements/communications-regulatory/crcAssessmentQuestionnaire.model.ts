export interface CrcAssessmentQuestionnaire {
    _id: string;
    questionNumber: number;
    question: {
        text: string;
        html: string;
    };
    options: [];
    comment: [];
    answer:{
        value?:String,
        comment?:[{
            text:String
        }],
        isQuestionAnswered:boolean
    },
    isRequired?: boolean;
}