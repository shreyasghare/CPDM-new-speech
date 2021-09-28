import { EngagementQuestionnareModel } from './EngagementQuestionnaireModel';

export interface EngagementQuestionnareStateModel {
  state: 'submitted' | 'saved';
  answers: EngagementQuestionnareModel[];
  answeredQuestionsCount: number;
  savedQuestionsCount: number;
  isAllQuestionsAnswered: boolean;
}
