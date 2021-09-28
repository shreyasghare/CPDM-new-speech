import { DocCentral } from '@cpdm-model/DocCentral';

interface Question {
    questionNumber: number;
    answer: {
        value: string
    }
}

export interface QuestionAnswer {
    answer: {
        value?: string,
        isQuestionAnswered?: boolean,
        attachmentDetails?: DocCentral,
        comment?: any [];
        question?: Question;
    };
    question: Question;
    comment: [];
    forecastedBooking: { table: any [] };
    isQuestionAnswered: boolean;
    productLaunchDates: string;
    table: any [];
    value: 'Yes' | 'No';
    questionId: string;
    questionNumber: number;
    reviewComment: any [];
    text: string;
    _id: string;
    attachFile: any;
}