import { EngagementQuestionnareStateModel } from '../../models/EngagementQuestionnareStateModel';
import { EngagementQuestionnareModel } from '../../models/EngagementQuestionnaireModel';

export class QuestionnaireState {
  mandatoryQuestionsCount = 0;
  mandatoryQuestionsAnswered = 0;
  totalQuestions = 0;

  constructor() {}

  questionnaireState(
    answeredQuestions: EngagementQuestionnareModel[]
  ): { engagementRequestForm: EngagementQuestionnareStateModel } {
    const savedQuestionsCount: number = this.mandatoryQuestionsCount - this.mandatoryQuestionsAnswered;
    const isAllQuestionsAnswered: boolean = this.totalQuestions - answeredQuestions.length === 0;
    return {
      engagementRequestForm: {
        state: savedQuestionsCount === 0 ? 'submitted' : 'saved',
        answers: answeredQuestions,
        answeredQuestionsCount: answeredQuestions.length,
        savedQuestionsCount,
        isAllQuestionsAnswered
      },
    };
  }
}
