export interface CrcQuestionAnswer {
    _id: string;
    questionId: string;
    questionNumber: number;
    answers:{
        value?:String,
        comment?:[{
            questionNumber:Number,
            text:String
        }],
        option?:{
            questionNumber:Number,
            answer:{
                value:String
            }
        },
        isQuestionAnswered:boolean
    },
}