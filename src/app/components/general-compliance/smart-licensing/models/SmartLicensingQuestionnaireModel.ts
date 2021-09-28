export interface SmartLicensingQuestionnaireModel {
  questionNumber: number;
  question: string;
  mandatory: boolean;
  inputType: string;
  options: any[];
  tags: {};
  subQuestion: [
    {
      inputType: string;
      question: string;
      mandatory: boolean;
      options?: [{ name: string; value: string }];
      questionNumber: number;
    }
  ];
  additionalInfo: string;
  isToolTip: string;
  toolTipDescription: string;
  section?: { alias: string; name: string };
  questionId: string;
  answer: string;
  _id: string;
}
