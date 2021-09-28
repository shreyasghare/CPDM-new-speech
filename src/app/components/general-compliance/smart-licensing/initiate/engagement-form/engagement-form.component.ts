import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SmartLicensingService } from '@cpdm-service/general-compliance/smart-licensing/smart-licensing.service';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CuiInputOptions } from '@cisco-ngx/cui-components';
import { Role } from '@cpdm-model/role';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { MatDatepickerInputEvent } from '@angular/material';
import { SmartLicensingQuestionnaireModel } from '../../models/SmartLicensingQuestionnaireModel';
import { EngagementQuestionnareModel } from '../../models/EngagementQuestionnaireModel';
import { QuestionnaireState } from './QuestionnaireState';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Subscription, interval } from 'rxjs';
import { environment } from 'src/environments/environment';
import { isBlankString } from 'src/app/shared/utils/utils';

const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'll',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-engagement-form',
  templateUrl: './engagement-form.component.html',
  styleUrls: ['./engagement-form.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

export class EngagementFormComponent implements OnInit, OnDestroy {
  initiateProcessContinues: boolean;
  // navBarItems = [
  //   {
  //     tabNumber: 1,
  //     tabName: 'About product',
  //     id: 'about-product',
  //     isActive: true
  //   },
  //   {
  //     tabNumber: 2,
  //     tabName: 'Product team contacts',
  //     id: 'product-team-contacts',
  //     isActive: false
  //   },
  //   {
  //     tabNumber: 3,
  //     tabName: 'Release informations',
  //     id: 'release-informations',
  //     isActive: false
  //   },
  //   {
  //     tabNumber: 4,
  //     tabName: 'Additional requirements',
  //     id: 'additional-requirements',
  //     isActive: false
  //   }
  // ];

  questionsFromDb = [] as SmartLicensingQuestionnaireModel[];
  answeredQuestions = [] as EngagementQuestionnareModel[];
  dbResponseReady = false;
  // tooltip
  resForInfoIcon: any = [];
  role = Role;
  membersObject: { [key: string]: [{ name: string, id: string, fullname: string }] } = {};
  isSaveEnabled = false;
  isReadOnly = false;
  engFormStatus = "";
  remainingQuestionCount: number;
  mandatoryQuestions = [];
  seemIdentifierNotificationDisabled: boolean = true;
  autoSave : Subscription;

  constructor(private slService: SmartLicensingService,
    private toast: ToastService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EngagementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userDetailsService: UserDetailsService,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService) { }

  questionnaireForm: FormGroup;
  items: FormArray;
  selection: string;

  radioOptions: CuiInputOptions = new CuiInputOptions({
    autofocus: false,
    required: false,
    helperText: '',
    helperLevel: 'info',
  });

  invalidDateWarning = false;

  // @ViewChild('divToScroll', { static: true }) divToScroll: ElementRef;

  // onScroll(event: { srcElement: { scrollTop: number } }) {
  //   const scrollTop = event.srcElement.scrollTop;
  //   this.onScrollChangeTab(scrollTop);
  // }

  // onScrollChangeTab(scrollTop: number) {
  //   if (this.isReadOnly) {
  //     if (scrollTop < 1080) {
  //       this.changeActiveTab(0);
  //     } else if (scrollTop >= 1080 && scrollTop < 1580) {
  //       this.changeActiveTab(1);
  //     } else if (scrollTop >= 1580 && scrollTop < 1837) {
  //       this.changeActiveTab(2);
  //     } else if (scrollTop >= 1837) {
  //       this.changeActiveTab(3);
  //     }
  //   } else {
  //     if (scrollTop < 1625) {
  //       this.changeActiveTab(0);
  //     } else if (scrollTop >= 1625 && scrollTop < 2274) {
  //       this.changeActiveTab(1);
  //     } else if (scrollTop >= 2274 && scrollTop < 2721) {
  //       this.changeActiveTab(2);
  //     } else if (scrollTop >= 2721) {
  //       this.changeActiveTab(3);
  //     }
  //   }
  // }

  // changeActiveTab(mainIndex: number) {
  //   for (const [index, value] of this.navBarItems.entries()) {
  //     if (index === mainIndex) {
  //       value.isActive = true;
  //     } else {
  //       value.isActive = false;
  //     }
  //   }
  // }

  ngOnInit() {
    this.questionnaireForm = this.formBuilder.group({
      items: this.formBuilder.array([])
    });
    const currentUserRole = this.userDetailsService.userRole;
    if (this.role.pm === currentUserRole) {
      this.isReadOnly = this.data.isReadOnly;
    } else if (this.role.smartLicensingPO === currentUserRole) {
      this.isReadOnly = true;
    }

    if (this.data.slObj.initiate.engagementRequestForm.state !== 'notSubmitted') {
      this.slService.getAnsweredQuestionnaire(this.data.slId).subscribe(answeredQuestionsRes => {
        const { success, data } = answeredQuestionsRes;

        if (success) {
          this.generateReactiveFormControls(answeredQuestionsRes.data);
          const cecIdSearchQuestions = Object.keys(this.membersObject);
          if (cecIdSearchQuestions.length > 0) {
            cecIdSearchQuestions.forEach(questionNumber => {
              const answer = this.membersObject[questionNumber];
              this.getSelectedMembers(answer, parseInt(questionNumber) - 1);
            });

          }
          this.dbResponseReady = true;
          this.questionsFromDb = data;
          this.cdRef.detectChanges();
          this.createMandatoryQuestionsObject();
        }
      });

    } else {
      this.isSaveEnabled = true;
      this.slService.getQuestionnare().subscribe(questionnareRes => {
        const { success, data } = questionnareRes;
        if (success) {
          this.generateReactiveFormControls(questionnareRes.data);
          this.dbResponseReady = true;
          this.questionsFromDb = data;
          this.cdRef.detectChanges();
          this.createMandatoryQuestionsObject();
        }
      });
    }

    if (this.data.slObj.projectId.fcsDate) {
      const diff = Math.ceil(( (new Date(this.data.slObj.projectId.fcsDate)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24));
      this.invalidDateWarning = diff < 60 ? true : false;
    }

    const autoSaveInterval = interval(environment.autoSaveTimeInterval);
    if (!this.isReadOnly) {
      this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
    }

  }

  private generateReactiveFormControls(questionnaireArray: SmartLicensingQuestionnaireModel[]): void {
    questionnaireArray.forEach(question => {
      this.items = this.questionnaireForm.get('items') as FormArray;
      let subQuestion = null;
      if (question.subQuestion.length > 0) {
        subQuestion = question.subQuestion;
      }
      if (!question.answer && this.data.slObj.initiate.engagementRequestForm.state !== 'submitted') {
        switch (question.questionNumber) {
          case 1:
            if(this.data.slObj.initiate.engagementRequestForm.state == 'saved'){
              question.answer = question.answer ? question.answer : '';
            }else{
              question.answer = this.data.slObj.projectId.name;
            }
            break;
          case 2:
            question.answer = this.data.slObj.projectId.desc;
            break;
          case 6:
            question.answer = this.data.slObj.projectId.fcsDate ? this.getStdDate(this.data.slObj.projectId.fcsDate) : '';
            break;
          default:
            question.answer = '';
            break;
        }
      }
      const questionId = question._id !== undefined ? question._id : question.questionId;
      const answer = question.answer !== undefined ? question.answer : null;
      const { question: questionFromMaster, questionNumber, mandatory } = question;
      this.items.push(this.createItem(questionFromMaster, questionNumber, questionId, answer, mandatory, subQuestion));
    });
  }

  // private reactiveFormChanges() {
  //   this.questionnaireForm.valueChanges.subscribe(form => {
  //   });
  // }

  get formData() {
    return this.questionnaireForm.get('items') as FormArray;
  }

  // onNavigate(event: HTMLElement) {
  //   const elmnt = document.getElementById(event.id);
  //   elmnt.scrollIntoView();
  // }

  getSubquestions(form) {
    return form.controls.subQuestion.controls;
  }

  createItem(question: string, questionNumber: number, questionId: string, answer = null, mandatory: boolean, subQuestion?: any): FormGroup {
    const questionObj = {
      question,
      questionNumber,
      questionId,
      answer: answer === null ? '' : answer,
      subQuestion: this.formBuilder.array([]),
      mandatory
    };

    if (typeof answer === 'object' && answer !== null && answer !== undefined) {
      this.membersObject[questionNumber] = answer;
    }

    if (subQuestion) {
      const subQuestionGroupArray = subQuestion.map(item => {
        const { question, questionNumber, inputType, additionalInfo, answer } = item;
        return this.formBuilder.group({ question, questionNumber, inputType, additionalInfo, answer: answer != undefined ? answer : '' });
      });

      questionObj.subQuestion = this.formBuilder.array(subQuestionGroupArray);
    }

    return this.formBuilder.group(questionObj);
  }

  getSelectedMembers(event, index) {
    const FormArray = this.questionnaireForm.get('items') as FormArray;
    const formGroup = FormArray.controls[index] as FormGroup;
    formGroup.patchValue({ answer: event });
    this.mandatoryQuestions[index] = event.length ? event[0].id : "";
    // enable/ disable q7 notification button
    if (index === 4 && event.length >= 1) {
      this.seemIdentifierNotificationDisabled = false;
    } else if (index === 4 && event.length === 0) {
      this.seemIdentifierNotificationDisabled = true;
    }
    this.getRemainingQuestionCount();
    this.getUpdatedQuestionnaireStatus();
  }

  buildQuestionnaireFormPostObj() {
    this.answeredQuestions.length = 0;
    const buildForm = [...this.questionnaireForm.value.items];
    const state = new QuestionnaireState();
    state.totalQuestions = this.questionnaireForm.value.items.length;

    buildForm.forEach(element => {
      const { mandatory, answer } = element;
      if (mandatory) {
        state.mandatoryQuestionsCount++;
      }
      if (answer != '') {
        if (mandatory) {
          state.mandatoryQuestionsAnswered++;
        }
        delete element.question;
        delete element.mandatory;
        if (element.answer && element.answer._i) { // Check if it is moment object
          element.answer = this.setDate(element.answer._i);
        }
        if (element.subQuestion && element.subQuestion.length > 0) {
          element.subQuestion.forEach(subQues => {
            delete subQues.question;
            delete subQues.additionalInfo;
            delete subQues.inputType;
          });
        } else {
          delete element.subQuestion;
        }
        this.answeredQuestions.push(element);
      }
    });
    return state.questionnaireState(this.answeredQuestions);
  }

  onSave() {
    this.dbResponseReady = false;
    this.isSaveEnabled = false;
    const engagementFormPostObject = this.buildQuestionnaireFormPostObj();

    if (this.answeredQuestions.length > 0) {
      this.slService.postQuestionnaire(engagementFormPostObject, this.data.slId).subscribe(queRes => {
        this.dbResponseReady = true;
        const { success, data } = queRes;
        if (success) {
          this.toast.show('Success', 'Engagement Form has been saved successfully', 'success');
          this.dialogRef.close({ success: true, data });
        }
      }, err => {
        this.dbResponseReady = true;
        this.answeredQuestions = [];
      });
    } else {
      this.onCancel();
    }

  }

  /**
   * Creates object of mandatory questions with key-value pair - questionIndex: "answer"
   */
  createMandatoryQuestionsObject() {
    this.questionsFromDb.forEach((element, i) => {
      if (element.mandatory) {
        this.mandatoryQuestions[i] = element.answer ? element.answer : "";
      }
    });
    this.getRemainingQuestionCount();
    this.getUpdatedQuestionnaireStatus();
  }

  /**
   * Executes on textbox value change
   * @param index 
   * @param value 
   */
  onInputChange(index: number, value: string) {
    if (this.questionsFromDb[index].mandatory) {
      if(isBlankString(this.questionnaireForm.value.items[index].answer)){
        this.questionnaireForm.value.items[index].answer = '';
      }
      this.mandatoryQuestions[index] = value ? value : this.formData.controls[index].value.answer;
    }
    this.getRemainingQuestionCount();
    this.getUpdatedQuestionnaireStatus();
  }

  /**
   * Get count of all unanswered mandatory questions
   */
  getRemainingQuestionCount() {
    this.remainingQuestionCount = this.mandatoryQuestions.filter(item => item === "").length;
  }

  /**
   * Creates a status which shows pending count for mandatory questions
   */
  getUpdatedQuestionnaireStatus() {
    if (this.remainingQuestionCount === 0) {
      this.engFormStatus = `All mandatory questions are answered`;
    } else if (this.remainingQuestionCount === 1) {
      this.engFormStatus = `${this.remainingQuestionCount} question is remaining to be answered`;
    } else {
      this.engFormStatus = `${this.remainingQuestionCount} questions are remaining to be answered`;
    }
  }
  enableInputType(type: string, index: number): boolean {
    return this.questionsFromDb[index].inputType === type;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>, index: string) {
    if (this.questionsFromDb[index].questionNumber === 6) {
      const today = new Date();
      const eventDate = new Date(event.value); // converting moment obj to date obj
      const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      this.invalidDateWarning = diff < 60 ? true : false;
    }
  }

  onCancel() {
    this.dialogRef.close({ success: true, message: 'dilogClosed' });
  }

  // get getTodayDate() {
  //   return new Date();
  // }

  sendSEEMNotification() {
    const body = {
      members: this.questionnaireForm.value.items[4].answer,
      projectName: this.data.slObj.projectId.name,
      pm: this.userDetailsService.currentUserValue,
      projectId:this.data.slObj.projectId._id
    };
    const notificationToast = this.toastService.show(`SEEM Identification`, `Sending  Notification`, 'info', { autoHide: false });
    this.slService.sendSEEMNotificationService(body).subscribe(data => {
      notificationToast.update(`SEEM Identification`, `Notification Send`, 'success');
    }, err => {
      notificationToast.update('SEEM Identification', `Notification Failed`, 'danger');
    });
  }

  getStdDate(date) {
    return date.substring(0, 10); 
  }

  // getter to get todays system date
  setDate(mDate): string {

    let dd = mDate.date;
    let mm = mDate.month + 1;
    const yyyy = mDate.year;


    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    return `${yyyy}-${mm}-${dd}`;
  }

  autoSaveOnTimeInterval() {
    const engagementFormPostObject = this.buildQuestionnaireFormPostObj();
    if (this.answeredQuestions.length > 0) {
      this.slService.postQuestionnaire(engagementFormPostObject, this.data.slId).subscribe(queRes => {
        const { success, data } = queRes;
        if (success) {
          this.toast.show('Success', 'Engagement Form has been auto saved', 'success');
        }
      }, err => {
        this.toast.show('Failed', 'Auto saved failed for engagement form', 'danger');
      });
    } else {
      console.log('form invalid, Cannot autoSave form ');
    }

  }

  ngOnDestroy() {
    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
  }
}
