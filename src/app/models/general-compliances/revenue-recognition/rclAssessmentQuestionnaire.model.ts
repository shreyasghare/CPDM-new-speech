export interface RclassessmentQuestionnaire {
    _id: string;
    questionNumber: any;
    question: Question;
    options: Option[];
    additionalInfo: string[];
    sectionName: string;
    table: Table[];
    comment: Comment[];
    reviewComment: ReviewComment[];
    answer: Answer;
    isCommentDisabled?: boolean;
    isSubQuestionDisabled?: boolean;
    tableName: string;
    isQuestionDisabled?: boolean;
    attachFile: string;
}

interface Docx {
    addlInfo: string[];
    questionInfo: string[];
    subQuestion: string[];
    note: string;
}

interface Question {
    text: string;
    docx: Docx;
    html: string;
}

interface Option2 {
    value: string;
}

interface Question2 {
    questionNumber: string;
    question: string;
    options: Option2[];
}

interface Option {
    value: string;
    question: Question2;
}

interface Table {
    row: string;
    value: any;
    column: string;
}

interface Comment {
    _id: string;
    text: string;
    questionNumber?: number;
    question: string;
}

interface ReviewComment {
    text: string;
}

interface Answer2 {
}

interface Question3 {
    answer: Answer2;
}

interface ForecastedBooking {
    table: any[];
}

interface ProductLaunchDates {
    table: any[];
}

interface Comment2 {
    _id: string;
    questionNumber?: number;
    text: string;
}

interface Answer {
    question: Question3;
    forecastedBooking: ForecastedBooking;
    productLaunchDates: ProductLaunchDates;
    isQuestionAnswered: boolean;
    comment: Comment2[];
    value: string;
}