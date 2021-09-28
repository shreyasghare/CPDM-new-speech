import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { CrcAssessmentQuestionnaire } from '@cpdm-model/additional-requirements/communications-regulatory/crcAssessmentQuestionnaire.model';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-crc-assessment-questionaire-modal',
  templateUrl: './crc-assessment-questionaire-modal.component.html',
  styleUrls: ['./crc-assessment-questionaire-modal.component.scss']
})
export class CrcAssessmentQuestionaireModalComponent implements OnInit, OnDestroy {
  crcId: string;
  isSpinner = false;
  unsubscribe$ = new Subject();
  assessmentQuestionnaireRes;
  assessmentQuestionnaireData: Object[];
  crcQuestionnaireStatus = '';
  totalQuestionsCount: number;
  remainingQuestionsCount: number;
  getCrcQuestionnaireDataSubscription: Subscription;
  getCrcDataSubcription: Subscription;
  getUpdatedRclQuestionnaireSubscription: Subscription;
  questionListFromDb = [] as CrcAssessmentQuestionnaire[];
  answeredQuestionsArr = [];
  questionnaireStatus: string;
  fisrtThreeQuestionsAnsweredNo: boolean;
  crcDataObj: CommunicationsRegulatoryModel;
  
  createQuestionnaireForm = new FormGroup({
    formControlValue1: new FormControl('', [Validators.required]),
    formControlValue2: new FormControl('', [Validators.required]),
    formControlValue3: new FormControl('', [Validators.required]),
    formControlValue4: new FormControl('', [this.noWhitespaceValidator]),
    formControlValue5: new FormControl('', [this.noWhitespaceValidator]),
    formControlValue6: new FormControl('', [this.noWhitespaceValidator]),
    formControlValue7: new FormControl('', [this.noWhitespaceValidator]),
    formControlValue8: new FormControl('', [this.noWhitespaceValidator])
  });

  constructor(
              private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private toastService: ToastService,
              private crcService: CommunicationsRegulatoryService,
              ) {}

  ngOnInit() {
    this.getCrcDetails();
  }
  /**
   * @description Check for whitespace validation
   * @param { FormControl } control
  */
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getCrcDetails() {
    this.getCrcDataSubcription = this.crcService.getCrcDataSub.pipe(takeUntil(this.unsubscribe$)).subscribe(crcData => {
      if (crcData) {
        this.crcDataObj =  crcData;
        this.crcId = crcData._id;
        this.getCrcQuestionnaire();
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching CRC details', 'danger');
    });
  }

  private getCrcQuestionnaire() {
    this.isSpinner = true;
    if (this.crcDataObj.crcAssessmentQuestionnaire.answers.length > 0) {
      this.getUpdatedRclQuestionnaireSubscription = this.crcService.getUpdatedCrcQuestionnaire(this.crcId).pipe(takeUntil(this.unsubscribe$)).subscribe(updatedQuestionnaireObj => {
        this.answeredQuestionsArr = JSON.parse(JSON.stringify(this.crcDataObj.crcAssessmentQuestionnaire.answers));
        this.answeredQuestionsArr.forEach(arrRes => {
          const formControlvalue = 'formControlValue' + arrRes.questionNumber;
          const radioValue = arrRes.answer.value;
          const commentText = arrRes.answer.comment[0].text;
          if (this.crcDataObj.crcAssessmentQuestionnaire.fisrtThreeQuestionsAnsweredNo) {
            if (arrRes.answer.isRadioButton) {
              this.createQuestionnaireForm.get(formControlvalue).setValue(radioValue);
            } else {
              this.createQuestionnaireForm.get(formControlvalue).disable();
            }
            this.assessmentQuestionnaireRes = updatedQuestionnaireObj.data;
            this.assessmentQuestionnaireData = this.assessmentQuestionnaireRes.filter(questionList => {
            if (questionList.isRequired) {
                return questionList;
              }
            });
            this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireData));
            this.remainingQuestionsCount = this.crcDataObj.crcAssessmentQuestionnaire.remianingQuestionsCount;
            this.totalQuestionsCount = 3;
            this.getRemainingQuestionCount();
            this.isSpinner = false;
          } else {
            if (arrRes.answer.isRadioButton) {
              this.createQuestionnaireForm.get(formControlvalue).setValue(radioValue);
            } else {
              if (commentText) {
                this.createQuestionnaireForm.get(formControlvalue).setValue(commentText);
              } else {
                this.createQuestionnaireForm.get(formControlvalue).setValue('');   
              }
              this.createQuestionnaireForm.get(formControlvalue).enable();
            }
            this.assessmentQuestionnaireRes = updatedQuestionnaireObj.data;  
            this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireRes));
            this.remainingQuestionsCount = this.crcDataObj.crcAssessmentQuestionnaire.remianingQuestionsCount;
            this.totalQuestionsCount = Object.keys(this.createQuestionnaireForm.controls).filter(key => {
              return this.createQuestionnaireForm.controls[key].enabled;
            }).length;
            this.getRemainingQuestionCount();
            this.isSpinner = false; 
          }
        });
          
      }, err => {
        console.error(err);
        this.isSpinner = false;
      });
    } else {
      this.getCrcQuestionnaireDataSubscription = this.crcService.getCrcQuestionnaire(this.crcId, this.crcDataObj.projectId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: { success: boolean, data: CrcAssessmentQuestionnaire }) => {
        if (res) {
          this.assessmentQuestionnaireRes = res.data;
          this.assessmentQuestionnaireData = this.assessmentQuestionnaireRes.filter(questionList => {
           if (questionList.isRequired) {
              return questionList;
            }
          });
          this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireData));
          this.isSpinner = false;
        }
      }, () => {
        this.toastService.show('Error in data fetching', 'Error fetching CRC Qustionnaire list', 'danger');
        this.isSpinner = false;
      });
    }
  }

  updateCrcQuestionnaireYes() {
    this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireRes));
    this.totalQuestionsCount = 8;
    this.createQuestionnaireForm.get('formControlValue4').enable();
    this.createQuestionnaireForm.get('formControlValue5').enable();
    this.createQuestionnaireForm.get('formControlValue6').enable();
    this.createQuestionnaireForm.get('formControlValue7').enable();
    this.createQuestionnaireForm.get('formControlValue8').enable();
  }
  updateCrcQuestionnaireNo() {
    this.assessmentQuestionnaireData = this.assessmentQuestionnaireRes.filter(questionList => {
      if (questionList.isRequired) {
          return questionList;
        } 
    });
    this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireData));
    this.totalQuestionsCount = 3;
    this.createQuestionnaireForm.get('formControlValue4').disable();
    this.createQuestionnaireForm.get('formControlValue4').setValue('');
    this.createQuestionnaireForm.get('formControlValue5').disable();
    this.createQuestionnaireForm.get('formControlValue5').setValue('');
    this.createQuestionnaireForm.get('formControlValue6').disable();
    this.createQuestionnaireForm.get('formControlValue6').setValue('');
    this.createQuestionnaireForm.get('formControlValue7').disable();
    this.createQuestionnaireForm.get('formControlValue7').setValue('');
    this.createQuestionnaireForm.get('formControlValue8').disable();
    this.createQuestionnaireForm.get('formControlValue8').setValue('');
  }
  setQuestionnaireData(question: any, radioValue: string) {
    if (this.createQuestionnaireForm.get('formControlValue1').value === 'Yes' ||
        this.createQuestionnaireForm.get('formControlValue2').value === 'Yes' ||
        this.createQuestionnaireForm.get('formControlValue3').value === 'Yes') {
      this.updateCrcQuestionnaireYes();
      this.fisrtThreeQuestionsAnsweredNo = false;
    } else if (this.createQuestionnaireForm.get('formControlValue1').value === 'No' &&
          this.createQuestionnaireForm.get('formControlValue2').value === 'No' &&
          this.createQuestionnaireForm.get('formControlValue3').value === 'No') {
      this.fisrtThreeQuestionsAnsweredNo = true;
      for (let i = 0; i < 3; i++) {
        this.answeredQuestionsArr.filter((value, idx) => {
          if (!value.answer.isRadioButton) {
            this.answeredQuestionsArr.splice(idx, 1);
          }
        });
      }
      this.updateCrcQuestionnaireNo();
    } else {
      this.questionListFromDb = JSON.parse(JSON.stringify(this.assessmentQuestionnaireData));
      this.totalQuestionsCount = 3;
      this.fisrtThreeQuestionsAnsweredNo = true;
    }
    this.questionListFromDb.filter(e => {
      if (e.questionNumber === question.questionNumber) {
        let isQuestionExists = false;
        let questionIndex =  0;
        if (this.answeredQuestionsArr.length > 0) {
          this.answeredQuestionsArr.filter((value, idx) => {
            if (question._id === value.questionId) {
                  questionIndex = idx;
                  isQuestionExists = true;
            }
          });
        }
        const answeredQuestions = {
          questionId: question._id,
          questionNumber: question.questionNumber,
          answer: {
            value: radioValue,
            comment: [{
                text: ''
            }],
            isQuestionAnswered: true,
            isRadioButton: true
          },
        };
        if (isQuestionExists) {
          this.answeredQuestionsArr.splice(questionIndex, 1);
        }
        this.answeredQuestionsArr.push(answeredQuestions);
        this.updateAnswerInArray(this.answeredQuestionsArr);
      }
    });
    this.getRemainingQuestionCount();
  }

  onChangeComment(question, event) {
    let isQuestionExists = false;
    let questionIndex =  0;
    if (event.target.value) {
      this.questionListFromDb.filter(e => {
        if (e.questionNumber === question.questionNumber) {
          if (this.answeredQuestionsArr.length > 0) {
            this.answeredQuestionsArr.filter((value, idx) => {
              if (question._id === value.questionId) {
                    questionIndex = idx;
                    isQuestionExists = true;
              }
            });
          }
          const answeredQuestions = {
            questionId: question._id,
            questionNumber: question.questionNumber,
            answer: {
              value: '',
              comment: [{
                  text: event.target.value
              }],
              isQuestionAnswered: true,
              isRadioButton: false
            },
          };
          if (isQuestionExists) {
            this.answeredQuestionsArr.splice(questionIndex, 1);
          } 
          this.answeredQuestionsArr.push(answeredQuestions);
          this.updateAnswerInArray(this.answeredQuestionsArr);
        }
      });
      this.getRemainingQuestionCount();
    } else {
      if (this.answeredQuestionsArr.length > 0) {
        this.answeredQuestionsArr.filter((value, idx) => {
          if (question._id === value.questionId) {
            this.answeredQuestionsArr.splice(idx, 1);
            question.answer.isQuestionAnswered = false;
          }         
        });
        this.updateAnswerInArray(this.answeredQuestionsArr);
      }
      this.getRemainingQuestionCount();
    }
  }

  updateAnswerInArray(answeredQuestions) {
    this.questionListFromDb.forEach(question => {
      answeredQuestions.forEach(element => {
        if (question.questionNumber === element.questionNumber) {
          question.answer = element.answer;
        }
      });
    });
  }

  getRemainingQuestionCount() {
    this.remainingQuestionsCount = this.totalQuestionsCount;
    if (this.answeredQuestionsArr.length > 0) {
      if (this.fisrtThreeQuestionsAnsweredNo && this.answeredQuestionsArr.length > 3) {
        this.remainingQuestionsCount = 0;
      } else {
        this.remainingQuestionsCount = this.totalQuestionsCount - this.answeredQuestionsArr.length;
      }
    }
    this.getUpdatedQuestionnaireStatus();
  }
   
  getUpdatedQuestionnaireStatus() {
    if (this.remainingQuestionsCount === 0) {
      this.crcQuestionnaireStatus = `All the questions are answered`;
      this.questionnaireStatus = 'submitted';
    } else {
      this.crcQuestionnaireStatus = `${this.remainingQuestionsCount} ${this.remainingQuestionsCount === 1 ? 'question is' : 'additional questions'} remaining to be answered`;
      this.questionnaireStatus = 'saved';
    }
  }
  saveQuationnaireList() {
    const requestObj = {
      answers: [],
      status: this.questionnaireStatus,
      fisrtThreeQuestionsAnsweredNo: this.fisrtThreeQuestionsAnsweredNo,
      remianingQuestionsCount: this.remainingQuestionsCount
    }
    requestObj.answers = [...this.answeredQuestionsArr];
    if (this.answeredQuestionsArr.length > 0) {
      this.isSpinner = true;
        this.crcService.updateQuestionnaireObject(this.crcId, requestObj).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
          const { success, data } = res;
          if (res && res.success) {
            this.isSpinner = false;
            // this.toastService.show('Success', 'Assessment Questionnaire has been submitted successfully', 'success');
            this.dialogRef.close({ success: true, data });
          }
        }, () => {
          this.answeredQuestionsArr = [];
          this.toastService.show('Error in updating', 'Unable to save Questionnaire list', 'danger');
        });
      } else {
        this.closeModal();
      }
    }
  closeModal() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.getCrcQuestionnaireDataSubscription) {
      this.getCrcQuestionnaireDataSubscription.unsubscribe();
    }
    if (this.getCrcDataSubcription) {
      this.getCrcDataSubcription.unsubscribe();
    }
    if (this.getUpdatedRclQuestionnaireSubscription) {
      this.getUpdatedRclQuestionnaireSubscription.unsubscribe();
    }
  }
}
