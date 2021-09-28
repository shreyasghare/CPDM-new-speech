export interface EngagementQuestionnareModel {
  questionNumber: number;
  questionId: string;
  answer: String | [{ name: string; id: string; fullname: string }] | Date;
  subQuestion: [{ questionNumber: number; answer: string }];
}
