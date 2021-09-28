import { Component, OnInit, Inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { DocCentral } from '@cpdm-model/DocCentral';
import { Role } from '@cpdm-model/role';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { QuestionAnswer } from '../../../../../models/general-compliances/questionAnswer.model';
import { RclassessmentQuestionnaire } from '@cpdm-model/general-compliances/revenue-recognition/rclAssessmentQuestionnaire.model';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { Subscription, interval } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-assessment-questionnaire-popup',
  templateUrl: './assessment-questionnaire-popup.component.html',
  styleUrls: ['./assessment-questionnaire-popup.component.scss']
})

export class AssessmentQuestionnairePopupComponent implements OnInit, OnDestroy {
  questionsFromNode: any = [];
  answeredQuestions = [] as QuestionAnswer[];
  revRecId: string;
  private file: File;
  docCentralObject: DocCentral = null;

  // HTML element Variables
  enableComment = false;
  answeredQuestionsValueChanged = false;
  isFilePicked = false;
  uploadClicked = false;
  role = Role;
  currentRole = '';
  remainingQuestionCount: number;
  rclQuestionnaireStatus = '';
  isRevRecProcessCompleted = false;
  isRCLApproved = false;
  commentBtnName: { [key: number]: string } = {};
  autoSave: Subscription;
  getPostedRclQuestionnaireSubscription: Subscription;
  getDataByPathSubscription: Subscription;
  updateRclQuestionnaireSubscription: Subscription;
  uploadToDocCentralNewSubscription: Subscription;
  patchEdcsObjSubscription: Subscription;
  
  isEnableAdditionalQuestions = false;
  @ViewChild('divToScroll', { static: true }) divToScroll: ElementRef;

  // Questions Logic---------------------------------------------------------------------------------
  questionsLogic = {
    initialQuestionHasAnsweredYes: false,
    answeredQuestionsCount: 0,
    savedQuestionsCount: 0,
    questionsInInitialStep: 17,
    questionsInMiddleStep: 20,
    questionsInLastStep: 26,
    optionalQuestionInMiddleStep: 1,
    initialIsEnableAdditionalQuestions:false,
    getRemainingQuestionsCount(that: AssessmentQuestionnairePopupComponent): number {
      const areAnyFirstSeventeenHasAnswerYes = that.getIsFirstSeventeenHasYesValue();
      // If some of the first 17 questions are answered as No or none of them answered
      if (!areAnyFirstSeventeenHasAnswerYes) {
        
        let q18answered=0;
        if(that.isQuestion18Answered) q18answered=1;

        if(this.answeredQuestionsCount <= this.questionsInInitialStep){
          return this.questionsInInitialStep + q18answered - this.answeredQuestionsCount;
        }       
        return 0;
      }
      // If some of the first 20 questions are answered as Yes
      else if ( areAnyFirstSeventeenHasAnswerYes && !that.isEnableAdditionalQuestions) {
        if(this.answeredQuestionsCount <= this.questionsInMiddleStep){
          //return (this.questionsInMiddleStep - this.answeredQuestionsCount)- this.optionalQuestionInMiddleStep;
          return (this.questionsInMiddleStep - this.answeredQuestionsCount);
        }    
        return 0;        
      }
      else  if (this.answeredQuestionsCount <= this.questionsInLastStep && areAnyFirstSeventeenHasAnswerYes && that.isEnableAdditionalQuestions) {
        //return (this.questionsInLastStep - this.answeredQuestionsCount)- this.optionalQuestionInMiddleStep;
        return (this.questionsInLastStep - this.answeredQuestionsCount);
      }
    },
    status(): string {
      // Marks status as 'submitted' if all the mandatory questions are answered else marks status as 'saved'
      if ((this.answeredQuestionsCount === this.questionsInInitialStep && !this.initialQuestionHasAnsweredYes) ||
          (this.answeredQuestionsCount === (this.questionsInInitialStep + 1) && !this.initialQuestionHasAnsweredYes) ||
          (this.answeredQuestionsCount === (this.questionsInMiddleStep ) && this.initialQuestionHasAnsweredYes && !this.initialIsEnableAdditionalQuestions) ||
          (this.answeredQuestionsCount === (this.questionsInLastStep) && this.initialIsEnableAdditionalQuestions)) {
     /*   (this.answeredQuestionsCount === (this.questionsInMiddleStep - this.optionalQuestionInMiddleStep) && this.initialQuestionHasAnsweredYes && !this.initialIsEnableAdditionalQuestions) ||
        (this.answeredQuestionsCount === (this.questionsInLastStep - this.optionalQuestionInMiddleStep) && this.initialIsEnableAdditionalQuestions)) {
     */   return 'submitted';
      } else {
        return 'saved';
      }
    }
  };

  forecastedBookingTotal: number;

  navBarItems = [
    {
      tabNumber: 1,
      tabName: 'Initial assessment',
      id: 'initial-assessment',
      isActive: true
    },
    {
      tabNumber: 2,
      tabName: 'CX PM and CX Finance',
      id: 'cx-pm-and-cx-finance',
      isActive: false
    },
    {
      tabNumber: 3,
      tabName: 'Additional questions',
      id: 'additional-questions',
      isActive: false
    }
  ];
  private onRemoveClicked = false;

  // loader when submitting questionnaire form
  isSpinner = false;
  activeQuestionIndex: number;
  activeQuestion = {};

  constructor(
    public dialogRef: MatDialogRef<AssessmentQuestionnairePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private revRecService: RevenueRecognitionService,
    public cuiModalService: CuiModalService,
    private docCentralService: DocCentralService,
    private toastService: ToastService,
    private userDetailsService: UserDetailsService
  ) { }

  ngOnInit() {
    
    this.isSpinner = true;
    this.revRecId = this.revRecService.getComplianceRefID;
    this.currentRole = this.userDetailsService.userRole;
    this.isRevRecProcessCompleted = getNestedKeyValue(this.data.revRecData, 'workflowTimestamp', 'fmvAssessment') ? true : false;
    this.isRCLApproved = getNestedKeyValue(this.data.revRecData, 'rclPidSubmit', 'status') === 'approved' ? true : false;
    if ('status' in this.data.revRecData.rclAssessmentQuestionnaire) {
      // Get combined result of all answered and unanswered questions
      this.getPostedRclQuestionnaireSubscription = this.revRecService.getPostedRclQuestionnaire(this.revRecId).subscribe(updatedRclquestionnaire => {
        this.answeredQuestions = [...this.data.revRecData.rclAssessmentQuestionnaire.answers];
        this.questionsFromNode = updatedRclquestionnaire;
        this.setCommentBtnName();
        this.isSpinner = false;
        if (!this.questionsFromNode[19].isQuestionDisabled && this.questionsFromNode[19].answer.forecastedBooking) {
          this.forecastedBookingTotal = this.questionsFromNode[19].answer.forecastedBooking.totalOfFirstFourQtr;
        }
        this.questionsLogic.initialQuestionHasAnsweredYes = getNestedKeyValue(this.data.revRecData.rclAssessmentQuestionnaire, 'questionnnaireLogic', 'areAnyFirstSeventeenHasAnswerYes');
        this.remainingQuestionCount = this.data.revRecData.rclAssessmentQuestionnaire.remaningQuestionsCount;
        
        if(this.answeredQuestions.find(x => x.questionNumber === 4) && this.answeredQuestions.find(x => x.questionNumber === 4).answer)
          this.isEnableAdditionalQuestions = this.answeredQuestions.find(x => x.questionNumber === 4).answer.value ==="Yes";
        this.questionsLogic.initialIsEnableAdditionalQuestions = this.isEnableAdditionalQuestions;
        this.isEnableAdditionalQuestions && this.disableAdditionalQuestions(); 
        this.getRemainingCount();
        if(this.isEnableAdditionalQuestions){
          this.toggleCommentField(3);
        }
        
      }, err => {
        console.error(err);
        this.isSpinner = false;
      });
    } else {
      // Get all unanswered questions
      this.getDataByPathSubscription = this.revRecService.getDataByPath('rclquestionnaire').subscribe(rclquestionnaire => {
        this.questionsFromNode = rclquestionnaire;
        this.setCommentBtnName();
        this.isSpinner = false;
        this.getRemainingCount();
        this.defaultQ18DatesonInit();
      }, err => {
        console.error(err);
        this.isSpinner = false;
      });
    }

    const autoSaveInterval = interval(environment.autoSaveTimeInterval);
    if (!this.data.isReadonly) {
      this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
    }
  }

  /**
   * @description Set comment button name to 'Add a comment' or 'View / Edit comment'
   */
  setCommentBtnName() {
    this.questionsFromNode.forEach((question: RclassessmentQuestionnaire, index: number) => {
      if ((question.reviewComment[0] && question.reviewComment[0].text) ||
        (question.questionNumber === 4 && question.comment[0] && question.comment[0].text)) {
        this.commentBtnName[index] = 'View / Edit comment';
      } else {
        this.commentBtnName[index] = 'Add a comment';
      }
    });
  }

  /**
   * @description Get remaining questions count & clears not required answers
   */
  getRemainingCount() {
    const hasYesValue = this.getIsFirstSeventeenHasYesValue();
    this.questionsLogic.answeredQuestionsCount = 0;
    if (!hasYesValue) {
      // set saved question count to 0 when all answers have value 'NO' && all 17 questions are answered
      if (this.answeredQuestions.length === this.questionsLogic.questionsInInitialStep) {
        this.questionsLogic.savedQuestionsCount = 0;
      }

      this.forecastedBookingTotal = 0;
      // Clear answered values from Q.18 - Q.20 if first 17 questions has no 'Yes' selected
      for (let i = this.questionsLogic.questionsInInitialStep; i < this.questionsLogic.questionsInLastStep; i++) {
        if (this.questionsFromNode[i].answer && Object.keys(this.questionsFromNode[i].answer).length) {
        //  this.questionsFromNode[i].answer.isQuestionAnswered = false;
         // skipping  optional Q.18 (as it is not mandatory)to disable but removing values if answered 
          if(this.questionsFromNode[i].questionNumber != 18) { 
            this.questionsFromNode[i].answer.isQuestionAnswered = false;
            this.questionsFromNode[i].isQuestionDisabled = true;   
          }
          //   May be required for next - US [US31218]
          // if (getNestedKeyValue(this.questionsFromNode[i], 'answer', 'productLaunchDates', 'table') &&
          //   getNestedKeyValue(this.questionsFromNode[i], 'answer', 'productLaunchDates', 'table').length) {
          //   for (let j = 0; j < this.questionsFromNode[i].answer.productLaunchDates.table.length; j++) {
          //     this.questionsFromNode[i].answer.productLaunchDates.table[j].value = '';
          //     this.questionsFromNode[i].table[j].value = '';
          //   }
          // }
          if(getNestedKeyValue(this.questionsFromNode[i], 'answer', 'comment') && getNestedKeyValue(this.questionsFromNode[i], 'answer', 'comment').length){
            for (let k = 0; k < this.questionsFromNode[i].answer.comment.length; k++) {
              this.questionsFromNode[i].answer.comment[k].text = '';
              this.questionsFromNode[i].comment[k].text = '';
            }
          }
          if (getNestedKeyValue(this.questionsFromNode[i], 'answer', 'forecastedBooking', 'table') &&
            getNestedKeyValue(this.questionsFromNode[i], 'answer', 'forecastedBooking', 'table').length) {
            this.questionsFromNode[i].answer.forecastedBooking.totalOfFirstFourQtr = 0;
            for (let m = 0; m < this.questionsFromNode[i].answer.forecastedBooking.table.length; m++) {
              this.questionsFromNode[i].answer.forecastedBooking.table[m].value = 0;
              this.questionsFromNode[i].table[m].value = 0;
            }
          }
        }
      }
    }

    // Updates answered question count
    this.questionsFromNode.forEach((question: RclassessmentQuestionnaire) => {
      //if (question.questionNumber <= 26 && question.questionNumber !== 18 && question.answer && question.answer.isQuestionAnswered ) {
      if (question.questionNumber <= 26 && question.answer && question.answer.isQuestionAnswered ) {
        this.questionsLogic.answeredQuestionsCount++;
      }
    });
    this.getUpdatedSavedQuestionsCount();
    this.remainingQuestionCount = this.questionsLogic.getRemainingQuestionsCount(this);
    this.getUpdatedQuestionnaireStatus();
  }

  /**
   * @description Returns true if any of the option is selected 'Yes'
   * @returns {boolean}
   */
  getIsFirstSeventeenHasYesValue(): boolean {
    const hasYesValue = this.answeredQuestions.find(item => item.answer && item.answer.value && item.answer.value.toLowerCase() === 'yes');
    return hasYesValue ? true : false;
  }

  isQuestion18Answered(): boolean {
    let question18=this.questionsFromNode.find(x => x.questionNumber === 18);
    if(question18.answer && question18.answer.isQuestionAnswered==true) return true;
    return false;
  }

  /**
   * @description Updates answered questions count which yet to be submit
   */
  private getUpdatedSavedQuestionsCount() {
    let savedQuestionsCount = 0;
    this.questionsFromNode.forEach((element: RclassessmentQuestionnaire) => {
      if (element.answer && !element.answer.isQuestionAnswered) {
        savedQuestionsCount++;
      }
    });

    this.questionsLogic.savedQuestionsCount = savedQuestionsCount;
  }

  /**
   * @description Creates statement for remaining questions answered
   */
  getUpdatedQuestionnaireStatus() {
    if (this.remainingQuestionCount === 0 && this.questionsLogic.answeredQuestionsCount > 0) {
      this.rclQuestionnaireStatus = `All ${this.questionsLogic.answeredQuestionsCount} questions are answered`;
    } else {
      this.rclQuestionnaireStatus = `${this.remainingQuestionCount} ${this.remainingQuestionCount === 1 ? 'question is' : 'questions are'} remaining to be answered`;
    }
  }

  /**
   * @description auto saves data after a specific time interval
   */
  autoSaveOnTimeInterval() {
    this.getUpdatedSavedQuestionsCount();
    const rclAssessmentQuestionnaire = this.createRclAssessmentQuestionnaireObject();
    this.updateRclQuestionnaireSubscription = this.revRecService.updateRclQuestionnaire(this.revRecId, rclAssessmentQuestionnaire).subscribe(() => {
      this.toastService.show('Success', 'RCL Assessment Questionnaire has been auto saved', 'success');
    }, () => {
      this.toastService.show('Failed', 'Auto save failed for RCL Assessment Questionnaire', 'danger');
    });
  }

  /**
   * @description Creates request body to update rclAssessmentQuestionnaire answers
   */
  createRclAssessmentQuestionnaireObject() {
    if (this.answeredQuestions.length) {
      return {
        answers: this.answeredQuestions.map(item => {
          return {
            answer: item.answer,
            questionId: item.questionId,
            questionNumber: item.questionNumber,
            reviewComment: item.reviewComment,
            _id: item.questionId
          };
        }),
        status: this.questionsLogic.status(),
        answeredQuestionsCount: this.questionsLogic.answeredQuestionsCount,
        remaningQuestionsCount: this.questionsLogic.getRemainingQuestionsCount(
          this
        ),
        questionnnaireLogic: {
          areAnyFirstSeventeenHasAnswerYes: this.getIsFirstSeventeenHasYesValue()
        }
      };
    } else {
      return {
        answers: []
      };
    }
  }

  /**
   * @description Navigate to requested section of the page
   * @param {string} id is the DOM element id
   */
  onNavigateHtml(id: string) {
    const elmnt = document.getElementById(id);
    elmnt.scrollIntoView();
  }

  /**
   * @description Scrolls & changes active tab element
   * @param event
   */
  onScroll(event: any) {
    const scrollTop = event.srcElement.scrollTop;
    if (scrollTop < 1795) {
      this.changeActiveTab(0);
    } else if (scrollTop >= 1795 && scrollTop < 2851) {
      this.changeActiveTab(1);
    } else if (scrollTop >= 2851) {
      this.changeActiveTab(2);
    }
  }

  /**
   * Sets active class for navbar element
   * @param {number} mainIndex index of navbar item
   */
  changeActiveTab(mainIndex: number) {
    for (const [index, value] of this.navBarItems.entries()) {
      value.isActive = index === mainIndex ? true : false;
    }
  }

  /**
   * @description Updates questionnaire JSON on change of radio button
   * @param question
   * @param {string} radioValue
   * @param isSubquestion
   */
  patchRadioButton(question: any, radioValue: string, isSubquestion?: any) {
    const checked = radioValue.toLowerCase() === 'yes';
    // Always expand comment field if Q.4 answered as 'yes'
    if (question.questionNumber === 4 && checked) {
      this.toggleCommentField(question.questionNumber - 1, checked);
      this.isEnableAdditionalQuestions = true;  
      this.questionsLogic.initialIsEnableAdditionalQuestions = this.isEnableAdditionalQuestions;
    }else if (question.questionNumber === 4 && !checked){
      this.isEnableAdditionalQuestions = false;
      this.questionsLogic.initialIsEnableAdditionalQuestions = this.isEnableAdditionalQuestions;
    }
    this.disableAdditionalQuestions();  

    if (question.isSubQuestionDisabled !== undefined && checked || isSubquestion) {
      if (!isSubquestion && typeof question.options[0].question === 'undefined') {
        question.isSubQuestionDisabled = true;
      } else {
        question.isSubQuestionDisabled = false;
      }
    } else {
      question.isSubQuestionDisabled = true;
    }

    if (question.isCommentDisabled !== undefined && checked) {
      if (question.comment.length === 0 && typeof question.options[0].question === 'undefined') {
        question.isCommentDisabled = true;
      } else {
        question.isCommentDisabled = false;
      }
    } else {
      question.isCommentDisabled = true;
    }
    if (isSubquestion) {
      if (this.answeredQuestions.length > 0) {
        for (let iterator of this.answeredQuestions) {
          if (question._id === iterator.questionId) {
            question.answer = iterator.answer;
            break;
          }
        }
      }
    }

    this.pushQuestionToArray(question, checked, isSubquestion);

    const isDisableQuestion = this.getIsFirstSeventeenHasYesValue();
    for (const iterator of this.questionsFromNode) {
      if (iterator.questionNumber === 19 || iterator.questionNumber === 20) {
        iterator.isQuestionDisabled = !isDisableQuestion;
        this.questionsLogic.initialQuestionHasAnsweredYes = isDisableQuestion;
        if(!isDisableQuestion){
          this.answeredQuestions = this.answeredQuestions.filter(item => item.questionNumber !== iterator.questionNumber);
        }
      }
    }
  }

  /**
   * @description Toggles comment field
   * @param {number} index is an index position of question
   */
  toggleCommentField(index: number, checked?: boolean) {
    if (this.activeQuestionIndex !== undefined && this.activeQuestionIndex !== index) {
      // Collapse already expanded comment field
      this.activeQuestion[this.activeQuestionIndex] = false;
      // Set comment btn name for previous index
      this.commentBtnName[this.activeQuestionIndex] =
        (this.questionsFromNode[this.activeQuestionIndex].reviewComment[0]
          && this.questionsFromNode[this.activeQuestionIndex].reviewComment[0].text)
          || (this.questionsFromNode[this.activeQuestionIndex].comment[0]
            && this.questionsFromNode[this.activeQuestionIndex].comment[0].text)
          ? 'View / Edit comment' : 'Add a comment';
    }
    // Set active index to latest selected index value
    this.activeQuestionIndex = index;
    // Set comment btn name for active index
    this.commentBtnName[this.activeQuestionIndex] =
      (this.questionsFromNode[this.activeQuestionIndex].reviewComment[0]
        && this.questionsFromNode[this.activeQuestionIndex].reviewComment[0].text)
        || (this.activeQuestionIndex === 3 && this.questionsFromNode[this.activeQuestionIndex].comment[0]
          && this.questionsFromNode[this.activeQuestionIndex].comment[0].text)
        ? 'View / Edit comment' : 'Add a comment';
    this.activeQuestion[index] = checked ? checked : !this.activeQuestion[index];
  }

  /**
   * @description Creates new entry to answered questions
   * @param {RclassessmentQuestionnaire} question
   * @param {boolean} checked selected value of radio button
   * @param {boolean} isSubquestion true if sub question answered
   * @returns {boolean}
   */
  pushQuestionToArray(question: RclassessmentQuestionnaire, checked?: boolean, isSubquestion?: boolean) {
    let buildQuestionAns = {} as QuestionAnswer;
    let storedObjInArray: QuestionAnswer;
    let isQuestionExists = false;
    let questionIndex: number;

    if (this.answeredQuestions.length > 0) {
      // Get questionIndex and answer object if editing already answered question
      for (const [index, iterator] of this.answeredQuestions.entries()) {
        if (question._id === iterator.questionId) {
          questionIndex = index;
          isQuestionExists = true;
          storedObjInArray = iterator;
          break;
        }
      }
    }

    buildQuestionAns.questionId = question._id;
    buildQuestionAns.questionNumber = question.questionNumber;
    if (storedObjInArray) {
      if (storedObjInArray.answer && checked !== undefined && !isSubquestion) {
        storedObjInArray.answer.value = checked ? 'Yes' : 'No';
      }
      buildQuestionAns = storedObjInArray;
    }
    if (checked !== undefined && isSubquestion === undefined && !storedObjInArray) {
      buildQuestionAns.answer = {
        value: checked ? 'Yes' : 'No',
        isQuestionAnswered: question.isSubQuestionDisabled
      };
    }

    if (checked && isSubquestion === undefined && !question.isSubQuestionDisabled) {
      buildQuestionAns.answer.isQuestionAnswered = question.isSubQuestionDisabled;
    }

    if (question.attachFile && this.docCentralObject) {
      if (!buildQuestionAns.answer) {
        buildQuestionAns.answer = {};
      }
      buildQuestionAns.answer.attachmentDetails = this.docCentralObject;
    }

    if (this.onRemoveClicked && this.docCentralObject === null) {
      buildQuestionAns.answer.attachmentDetails = null;
    }

    let isAllCommentAdded = false;

    if (question.comment) {
      if (!buildQuestionAns.answer) {
        buildQuestionAns.answer = {};
      }
      const commentsArray = [];
      let commentsCount = null;
      for (const iterator of question.comment) {
        if (iterator.text.trim().length > 0) {
          commentsCount++;
        }
        if (question.questionNumber) {
          commentsArray.push({
            questionNumber: question.questionNumber,
            text: iterator.text.trim()
          });
        } else {
          commentsArray.push({ questionNumber: '', text: iterator.text.trim() });
        }
        if (commentsCount > 0) {
          if (question.comment.length === 1 && commentsCount === 1 ||
            question.comment.length === 2 && commentsCount === 2) {
            isAllCommentAdded = true;
          } else {
            isAllCommentAdded = false;
          }
        }
      }
      buildQuestionAns.answer.comment = commentsArray;
      
      if(question.questionNumber>20)
        buildQuestionAns.answer.value = commentsArray[0].text;

      if (!isAllCommentAdded && question.isCommentDisabled && !checked) {
        buildQuestionAns.answer.isQuestionAnswered = question.isCommentDisabled;
      }
      if (question.isCommentDisabled === false || checked === undefined &&
        question.table.length === 0) {
        if (question.questionNumber === 4 && !buildQuestionAns.answer.value &&
          !getNestedKeyValue(question, 'answer', 'value')) {
          buildQuestionAns.answer.isQuestionAnswered = false;
        } else {
          buildQuestionAns.answer.isQuestionAnswered = isAllCommentAdded;
        }
      }
    }

    const reviewCommentsArray = [];
    for (const iterator of question.reviewComment) {
      reviewCommentsArray.push({
        text: iterator.text.trim()
      });
    }
    buildQuestionAns.reviewComment = reviewCommentsArray;

    if (checked !== undefined && isSubquestion) {
      for (const iterator of question.options) {
        if (iterator.question) {
          if (buildQuestionAns.answer) {
            buildQuestionAns.answer.question = {
              questionNumber: parseFloat(iterator.question.questionNumber),
              answer: {
                value: checked ? 'Yes' : 'No'
              }
            };
          } else {
            buildQuestionAns.answer = {
              question: {
                questionNumber: parseFloat(iterator.question.questionNumber),
                answer: {
                  value: checked ? 'Yes' : 'No'
                }
              }
            };
          }
        }
      }
      buildQuestionAns.answer.isQuestionAnswered = true;
    }


    if (!checked && buildQuestionAns.answer &&
      buildQuestionAns.answer.question &&
      buildQuestionAns.answer.question.answer) {
      if (isSubquestion) {
        buildQuestionAns.answer.question.answer.value = checked ? 'Yes' : 'No';
      } else {
        buildQuestionAns.answer.question.answer.value = '';
      }
    }


    if (question.table && question.table.length > 0) {
      buildQuestionAns.answer = {};
      buildQuestionAns.answer[question.tableName] = {};
      buildQuestionAns.answer[question.tableName].table = question.table;

      const tableRowValues = (itemType: string) => {
        let howManyRowHasValue = 0;

        question.table.forEach(item => {
          if (itemType === 'number') {
            if (typeof item.value === itemType && item.value > 0) {
              howManyRowHasValue++;
            }
          } else {
            if (typeof item.value === itemType || item.value.length > 0) {
              howManyRowHasValue++;
            }
          }
        });

        return howManyRowHasValue;
      };
      let typeOfTable = null;
      if (question.tableName === 'forecastedBooking') {
        buildQuestionAns.answer[question.tableName].totalOfFirstFourQtr
          = this.forecastedBookingTotal;
        if (this.forecastedBookingTotal > 0) {
          buildQuestionAns.answer.isQuestionAnswered = true;
        } else {
          buildQuestionAns.answer.isQuestionAnswered = false;
        }
      } else if (question.tableName === 'productLaunchDates') {
        typeOfTable = 'object';
        let isDateAnswered = true;
        question.table.forEach((productDate) => {
            if (productDate.value === null){
            isDateAnswered=false;
          };
        });
        buildQuestionAns.answer.isQuestionAnswered = isDateAnswered;
      }

    }

    if (isQuestionExists) {
      this.answeredQuestions.splice(questionIndex, 1);
    }

    this.answeredQuestions.push(buildQuestionAns);
    this.updateAnsweredQuestions(buildQuestionAns);
    this.answeredQuestionsValueChanged = true;
  }

  /**
   * @description Update original object to updated answer
   * @param {QuestionAnswer} buildQuestionAns
   */
  updateAnsweredQuestions(buildQuestionAns: QuestionAnswer) {
    this.questionsFromNode.forEach(question => {
      if (question.questionNumber === buildQuestionAns.questionNumber) {
        question.answer = buildQuestionAns.answer;
      }
    });
    this.getRemainingCount();
  }

  /**
   * @description Update review comment on change
   * @param {RclassessmentQuestionnaire} question is the updated question object
   */
  onChangeReviewComment(question: RclassessmentQuestionnaire) {
    let questionIndex: number;
    question.reviewComment[0].text = question.reviewComment[0].text.trim();
    // Find an index of if already answered question
    for (const [index, iterator] of this.answeredQuestions.entries()) {
      if (question._id === iterator.questionId) {
        questionIndex = index;
        break;
      }
    }
    if (question.reviewComment[0].text.length > 0) {
      if (questionIndex >= 0) {
        // Update answeredQuestions
        this.answeredQuestions[questionIndex].reviewComment = question.reviewComment;
        this.updateAnsweredQuestions(this.answeredQuestions[questionIndex]);
        this.answeredQuestionsValueChanged = true;
      } else {
        // Add new to answeredQuestions
        this.pushQuestionToArray(question);
      }
    } else if (this.answeredQuestions[questionIndex]) {
      if (this.currentRole === this.role.BUController && this.answeredQuestions[questionIndex].reviewComment[0].text) {
        this.answeredQuestionsValueChanged = false;
      } else {
        if (!question.answer.value) {
          // Remove unanswered questions(no yes/no) which has empty comments in it
          this.answeredQuestions.splice(questionIndex, 1);
        } else {
          // Update comment value if already answered(yes/no)
          this.answeredQuestions[questionIndex].reviewComment[0].text = '';
        }
        this.updateAnsweredQuestions(question as any);
        this.answeredQuestionsValueChanged = true;
      }
    }
    this.getRemainingCount();
  }

  /**
   * @description Update comment on change
   * @param {RclassessmentQuestionnaire} question is the updated question object
   * @param {string} value is the comment text
   */
  onChangeComment(question: RclassessmentQuestionnaire, value: string) {
    if (value.trim().length > 0) {
      this.pushQuestionToArray(question);
    } else {
      let questionIndex;
      for (const [index, iterator] of this.answeredQuestions.entries()) {
        if (question._id === iterator.questionId) {
          questionIndex = index;
          break;
        }
      }
      // Update if one of the comment is available
      let isSubCommnetHasValue = false;
      if (question.comment.length > 1) {
        for (const subComment of question.comment) {
          if ((subComment.text.trim()).length > 0) {
            isSubCommnetHasValue = true;
            this.pushQuestionToArray(question);
            break;
          }
        }
      }

      // Update to empty comment
      if (!isSubCommnetHasValue && questionIndex !== undefined) {
        if (this.answeredQuestions[questionIndex].questionNumber === 4 && this.answeredQuestions[questionIndex].answer.value === 'No') {
          this.answeredQuestions[questionIndex].answer.isQuestionAnswered = true;
        } else {
          this.answeredQuestions[questionIndex].answer.isQuestionAnswered = false;
        }
        this.answeredQuestions[questionIndex].answer.comment[0].text = '';
        this.answeredQuestionsValueChanged = true;
        this.updateAnsweredQuestions(this.answeredQuestions[questionIndex]);
      }
    }
  }

  /**
   * @description Update forecastedBooking and productLaunchDates data
   * @param {RclassessmentQuestionnaire} question
   */
  onChangeTable(question: RclassessmentQuestionnaire) {
    if (question.tableName === 'forecastedBooking') {
      let totalOfFourQtr = 0;
      for (let i = 0; i < 8; i++) {
        totalOfFourQtr += question.table[i].value == null ? 0 : parseInt(question.table[i].value, 10);
      }
      this.forecastedBookingTotal = totalOfFourQtr;
    } else if (question.tableName === 'productLaunchDates') {
     /* question.table.forEach(date => {
        if (date.value < this.getTodayDate.setHours(0, 0, 0, 0)) {
          date.value = null;
        }
      });*/
    }
    this.pushQuestionToArray(question);
  }

  /**
   * @description Get selected file details
   * @param event
   */
  onFilePicked(event) {
    this.file = (event.target as HTMLInputElement).files[0];
    this.isFilePicked = true;
  }

  /**
   * @description Upload file & update questionnaire details
   * @param {QuestionAnswer} question
   */
  onUploadClicked(question: QuestionAnswer) {
    const body = {
      title: this.file.name,
      description: 'Revenue Recognition Questionnaire Attachment',
      folderPath: 'revenueRecognition/root',
      workflow: 'Revenue Recognition'
    };
    const toast = this.toastService.show('EDCS Upload In Progress', this.file.name, 'info', { autoHide: false });
    this.uploadToDocCentralNewSubscription = this.docCentralService.uploadToDocCentralNew(this.file, body).subscribe(docCentralServiceRes => {
      if (docCentralServiceRes.success === false) {
        this.uploadClicked = true;
      } else if (docCentralServiceRes.success === true) {
        this.uploadClicked = false;
        this.docCentralObject = docCentralServiceRes.body;
        this.pushQuestionToArray(question as any);
        const edcsPatchBody = {
          submit: { rclAssessmentQuestionnaire: this.docCentralObject }
        };
        this.patchEdcsObjSubscription = this.revRecService.patchEdcsObj(this.revRecId, edcsPatchBody).subscribe(() => {
          this.submitRclQuestionnareForm(false);
          toast.update('EDCS Upload Success', this.file.name, 'success');
        });
      }
    }, () => {
      toast.update('EDCS Upload Failed', 'Please try again after 5 minutes.', 'danger');
      this.uploadClicked = false;
    });
  }

  /**
   * @description Submit and update questionnaire form
   * @param {boolean} closePopup
   */
  submitRclQuestionnareForm(closePopup: boolean = true) {
    this.isSpinner = true;
    this.getUpdatedSavedQuestionsCount();
    const rclAssessmentQuestionnaire = this.createRclAssessmentQuestionnaireObject();
    this.updateRclQuestionnaireSubscription = this.revRecService.updateRclQuestionnaire(this.revRecId, rclAssessmentQuestionnaire).subscribe(() => {
      this.isSpinner = false;
      if (closePopup) {
        this.onCancel();
      }
    }, () => {
      this.isSpinner = false;
    }
    );
  }

  /**
   * @description Download file
   */
  async onDownload() {
    const { nodeRef, fileName } = this.docCentralObject;
    await this.docCentralService.downloadFileFromDocCentral(nodeRef, fileName);
  }

  /**
   * @description Remove uploaded file
   * @param {RclassessmentQuestionnaire} question
   */
  onRemoveDocCentral(question: RclassessmentQuestionnaire) {
    this.onRemoveClicked = true;
    this.docCentralObject = null;
    this.uploadClicked = false;
    this.isFilePicked = false;
    this.pushQuestionToArray(question);
  }

  /**
   * @description Bind radio button value
   * @param {QuestionAnswer} question
   * @param {string} radio
   * @returns {boolean}
   */
  getIsChecked(question: QuestionAnswer, radio: string): boolean {
    if ((radio === 'No' && question.answer && question.answer.value === 'No') ||
      (radio === 'Yes' && question.answer && question.answer.value === 'Yes')) {
      return true;
    }
    return false;
  }

  /**
   * @description Bind radio button value to sub question
   * @param {QuestionAnswer} question
   * @param {string} radio
   * @returns {boolean}
   */
  getIsSubQuestionChecked(question: QuestionAnswer, radio: string): boolean {
    if (question.answer && question.answer.question) {
      if ((question.answer.question.answer.value === 'Yes' && radio === 'Yes') ||
        (question.answer.question.answer.value === 'No' && radio === 'No')) {
        return true;
      } else if (question.answer.value === 'No') {
        return false;
      }
    }
    return false;
  }

  /**
   * @description Returns today's date
   * @returns {Date}
   */
  get getTodayDate(): Date {
    return new Date();
  }

  /**
   * @description Returns attachFile value 
   * @param {QuestionAnswer} question
   * @returns {string}
   */
  attachmentState(question: QuestionAnswer): string {
    if ('answer' in question && 'attachmentDetails' in question.answer && !this.onRemoveClicked) {
      if (this.docCentralObject === null) {
        this.docCentralObject = question.answer.attachmentDetails;
      }

    }
    return question.attachFile;
  }

  /**
   * @description Closes project modal
   */
  onCancel() {
    this.dialogRef.close();
  }

  /**
   * @description Cleaning up resources
   */
  ngOnDestroy() {
    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
    if (this.getPostedRclQuestionnaireSubscription) {
      this.getPostedRclQuestionnaireSubscription.unsubscribe();
    }
    if (this.getDataByPathSubscription) {
      this.getDataByPathSubscription.unsubscribe();
    }
    if (this.updateRclQuestionnaireSubscription) {
      this.updateRclQuestionnaireSubscription.unsubscribe();
    }
    if (this.uploadToDocCentralNewSubscription) {
      this.uploadToDocCentralNewSubscription.unsubscribe();
    }
    if (this.patchEdcsObjSubscription) {
      this.patchEdcsObjSubscription.unsubscribe();
    }
  }
  
  // enable or disable question 20 to 26 & clear the entered ans value
  disableAdditionalQuestions(){
    for (let i =  this.questionsLogic.questionsInMiddleStep; i < this.questionsFromNode.length; i++) {             
        this.questionsFromNode[i].isQuestionDisabled = !this.isEnableAdditionalQuestions; 
        if(this.questionsFromNode[i].answer && !this.isEnableAdditionalQuestions){
          this.questionsFromNode[i].answer.isQuestionAnswered = this.isEnableAdditionalQuestions;
        }
              
        if (!this.isEnableAdditionalQuestions && this.questionsFromNode[i].answer && this.questionsFromNode[i].answer.comment && this.questionsFromNode[i].answer.comment.length) {
          for (let k = 0; k < this.questionsFromNode[i].answer.comment.length; k++) {
            this.questionsFromNode[i].answer.comment[k].text = '';
            this.questionsFromNode[i].comment[k].text = '';
          }
          this.removeFromArray(i+1);
        }    
    }
  }

  removeFromArray(questionNumberId){
    this.answeredQuestions = this.answeredQuestions.filter(item => item.questionNumber !== questionNumberId);
  }

  defaultQ18DatesonInit(){
   let question18=this.questionsFromNode.find(x => x.questionNumber === 18);
   for(let i=0;i<question18.table.length;i++){
     question18.table[i].value=new Date();
   }
   let answer={
                "productLaunchDates": {
                      "table": question18.table
                    },
                "isQuestionAnswered": true
              }
  question18["answer"]=answer;
  this.onChangeTable(question18);
  }

}
