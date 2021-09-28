import { Component, OnDestroy, OnInit, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GlobalizationModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ThrowStmt } from '@angular/compiler';
import { GlobalizationService } from '@cpdm-service/additional-requirements/globalization/globalization.service';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
// import "rxjs/add/operator/distinctUntilChanged";

@Component({
  selector: 'app-gz-service-selection-questionnaire-modal',
  templateUrl: './gz-service-selection-questionnaire-modal.component.html',
  styleUrls: ['./gz-service-selection-questionnaire-modal.component.scss']
})
export class GzServiceSelectionQuestionnaireModalComponenet implements OnInit, OnDestroy { 
  isSpinner = false;
  toolTipInfo = {
    i18nInfoIconText: `What is Internationalization or i18n?
                      Internationalization is the process of designing a product so that it can be adapted to multiple languages and cultural conventions without the need for code changes. Internationalization is one aspect of globalization. i18n is the common abbreviation for internationalization where 18 refers to the eighteen letters between the i and the n.`,
    i10nInfoIconText: `What is Localization or l10n?
                      Localization is the process of delivering and adapting a product or service to a particular language, culture, and localized "look-and-feel” by adding local-specific components and translating text.  l10n is the common abbreviation for localization where 10 refers to the ten letters between the L and the n.`,
    lATInfoIconText: 'Testing and navigating the localized application and reviewing the display of the translations (User Interface UI) as well as the interaction of the application with localized content (user data and user input).',
    turnKeyInfoText: 'Globalize and deliver all 4 GTS services to our stakeholders with little or no involvement of their resources after Globalization engagement, process review, and examination of the project requirements and stakeholder’s approval. Stakeholders can check project status live via LME or talk to the GTS Engagement Manager.'
  };

  assessmentQuestion = {
    questionOne: '1) Are there any additional languages supported by release?',
    questionTwo: `2) Were there any i18n <span class="icon-info icon--custom-size" [matTooltip]="${this.toolTipInfo.i18nInfoIconText}" matTooltipPosition="right" [matTooltipClass]="tooltipForInfo"></span> /L10n bugs that were not addressed in the last release that need to be fixed in the upcoming release?`,
    questionThree: '3) Was this product merged with another product?',
    questionFour: '4) Which browsers are supported?',
    questionFive: '5) Will there be any Subject Matter Expert review or IFT/EFTs? (e.g., Reginal Language Review, Reginal Legal Review, Reginal Marketing Review, etc.) Please note that if any of your languages is Japanese, SME review is required.'
  };

  question = {
    options: [
      {value: "Yes"}, {value: "No"}
    ]
  };
  
  serviceRequestQuestionaire: object;
  questionnaireArray

  questionOnetextPlaceHolder: string = "Please provide details";
  questionTwotextPlaceHolder: string = "";
  questionThreetextPlaceHolder: string = "";
  
  questionnaireStatus = `5 Questions are remaining to be answered`;
  mendatoryQuestionCount: number = 5;
  remainingQuestionsCount: number;
  destroy$ = new Subject();

  questionOneMandatory: boolean = true;
  questionTwoMandatory: boolean = true;
  questionThreeMandatory: boolean = true;
  questionFourMandatory: boolean = true;
  questionFiveMandatory: boolean = true;

  serviceAssesmentForm = new FormGroup({
    questionNumberOneRadio: new FormControl('', [Validators.required]),
    questionNumberOneText: new FormControl('', [Validators.required]),
    questionNumberTwoRadio: new FormControl('', [Validators.required]),
    questionNumberTwoText: new FormControl('', [Validators.required]),
    questionNumberThreeRadio: new FormControl('', [Validators.required]),
    questionNumberThreeText: new FormControl('', [Validators.required]),
    questionNumberFourText: new FormControl('', [Validators.required]),
    questionNumberFiveRadio: new FormControl('', [Validators.required]),
  });

  constructor(
              private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: {globalizationData: GlobalizationModel, isReadonly: boolean},
              private globalizationService: GlobalizationService,
              ) {}

  ngOnInit() {
    this.serviceAssesmentForm.controls['questionNumberOneText'].disable();
    this.serviceAssesmentForm.controls['questionNumberTwoText'].disable();
    this.serviceAssesmentForm.controls['questionNumberThreeText'].disable();

    let serviceRequestData = getNestedKeyValue(this.data.globalizationData,"requirements","serviceRequest");
    this.serviceRequestQuestionaire = getNestedKeyValue(serviceRequestData,"serviceRequestQuestionaire")
    this.questionnaireArray = getNestedKeyValue(serviceRequestData,"serviceRequestQuestionaire","questionaire")

    this.serviceAssesmentForm.get('questionNumberOneRadio').valueChanges.subscribe( selectedValue =>{
      if(selectedValue){
        this.serviceAssesmentForm.controls['questionNumberOneText'].enable();
        switch (selectedValue){
          case "Yes":
            this.questionOnetextPlaceHolder =  this.questionnaireArray[0].metadata.helpText.ifYes;          
            break;
          case "No":  
            this.questionOnetextPlaceHolder = this.questionnaireArray[0].metadata.helpText.ifNo;
            break;
          default:
            this.questionOnetextPlaceHolder = "Please provide details";
            break;
        }
      }      
    })
    this.serviceAssesmentForm.get('questionNumberTwoRadio').valueChanges.subscribe( selectedValue =>{
      if(selectedValue){
        this.serviceAssesmentForm.controls['questionNumberTwoText'].enable();
        switch (selectedValue){
          case "Yes":
            this.questionTwotextPlaceHolder = this.questionnaireArray[1].metadata.helpText.ifYes;
            break;
          default:
            this.questionTwotextPlaceHolder = "";
            break;
        }
      }      
    })
    this.serviceAssesmentForm.get('questionNumberThreeRadio').valueChanges.subscribe( selectedValue =>{
      if(selectedValue){
        this.serviceAssesmentForm.controls['questionNumberThreeText'].enable();
        switch (selectedValue){
          case "Yes":
            this.questionThreetextPlaceHolder = this.questionnaireArray[2].metadata.helpText.ifYes;
            break;
          default:
            this.questionThreetextPlaceHolder = "";
            break;
        }
      }
    })

    this.updateFormValues();
    this.formControlValueCheck();
  }

  closeModal() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
  }

  saveQuestionnaireData(){
    //Q1
    if(this.serviceAssesmentForm.get("questionNumberOneRadio").value){
      this.questionnaireArray[0].answer = this.serviceAssesmentForm.get("questionNumberOneRadio").value;
    }
    if(this.serviceAssesmentForm.get("questionNumberOneText").value){
      this.questionnaireArray[0].comment = this.serviceAssesmentForm.get("questionNumberOneText").value;
    }
    //Q2
    if(this.serviceAssesmentForm.get("questionNumberTwoRadio").value){
      this.questionnaireArray[1].answer = this.serviceAssesmentForm.get("questionNumberTwoRadio").value;
    }
    if(this.serviceAssesmentForm.get("questionNumberTwoText").value){
      this.questionnaireArray[1].comment = this.serviceAssesmentForm.get("questionNumberTwoText").value;
    }
    //Q3
    if(this.serviceAssesmentForm.get("questionNumberThreeRadio").value){
      this.questionnaireArray[2].answer = this.serviceAssesmentForm.get("questionNumberThreeRadio").value;
    }
    if(this.serviceAssesmentForm.get("questionNumberThreeText").value){
      this.questionnaireArray[2].comment = this.serviceAssesmentForm.get("questionNumberThreeText").value;
    }
    //Q4
    if(this.serviceAssesmentForm.get("questionNumberFourText").value){
      this.questionnaireArray[3].answer = this.serviceAssesmentForm.get("questionNumberFourText").value;
    }
    //5
    if(this.serviceAssesmentForm.get("questionNumberFiveRadio").value){
      this.questionnaireArray[4].comment = this.serviceAssesmentForm.get("questionNumberFiveRadio").value;
    }

    let reqObject = {
      "projectId":getNestedKeyValue(this.data.globalizationData,"_id"), 
      "noOfQuestionsAnswered":this.questionnaireArray.length, 
      "mandatoryQuestionsYetToBeAnswered": this.mendatoryQuestionCount,
      "completedFlag": this.mendatoryQuestionCount == 0 ? true: false, 
      "questionaire": this.questionnaireArray
    }
    this.isSpinner = true;
    this.globalizationService.updateServiceRequestQuestionaireObject(getNestedKeyValue(this.data.globalizationData,"_id"), reqObject).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      const { success, data } = strategyRes;
      if (strategyRes && strategyRes.success) {
        this.isSpinner = false;
        this.dialogRef.close({ success: true, data });
      }
    }, (err) => {

    });
  }

  updateFormValues(){
    if(this.questionnaireArray[0].answer){
      this.serviceAssesmentForm.controls.questionNumberOneRadio.setValue(this.questionnaireArray[0].answer);
    }
    if(this.questionnaireArray[0].comment){
      this.serviceAssesmentForm.controls['questionNumberOneText'].enable();
      this.serviceAssesmentForm.controls.questionNumberOneText.setValue(this.questionnaireArray[0].comment);
    }

    if(this.questionnaireArray[1].answer){
      this.serviceAssesmentForm.controls.questionNumberTwoRadio.setValue(this.questionnaireArray[1].answer);
    }
    if(this.questionnaireArray[1].comment){
      this.serviceAssesmentForm.controls['questionNumberTwoText'].enable();
      this.serviceAssesmentForm.controls.questionNumberTwoText.setValue(this.questionnaireArray[1].comment);
    }

    if(this.questionnaireArray[2].answer){
      this.serviceAssesmentForm.controls.questionNumberThreeRadio.setValue(this.questionnaireArray[2].answer);
    }
    if(this.questionnaireArray[2].comment){
      this.serviceAssesmentForm.controls['questionNumberThreeText'].enable();
      this.serviceAssesmentForm.controls.questionNumberThreeText.setValue(this.questionnaireArray[2].comment);
    }

    if(this.questionnaireArray[3].answer){
      this.serviceAssesmentForm.controls.questionNumberFourText.setValue(this.questionnaireArray[3].answer);
    }
    if(this.questionnaireArray[4].comment){
      this.serviceAssesmentForm.controls.questionNumberFiveRadio.setValue(this.questionnaireArray[4].comment);
    }
    this.questionnaireValidationCondition();
  }

  formControlValueCheck(){
    // this.mendatoryQuestionCount = 5;    
    this.serviceAssesmentForm.valueChanges.pipe(
      distinctUntilChanged((previous: any, current: any) => {
              if(JSON.stringify(previous) == JSON.stringify(current)){
                return true;
              }
      })).subscribe(val => {
        this.mendatoryQuestionCount = 5;
        this.questionnaireValidationCondition();
    });
  }

  questionnaireValidationCondition(){
    if ((this.serviceAssesmentForm.controls['questionNumberOneRadio'].value == 'Yes' || 
    this.serviceAssesmentForm.controls['questionNumberOneRadio'].value == 'No') && 
    ((this.serviceAssesmentForm.controls['questionNumberOneText'].value).trim().length !== 0)) {
        this.mendatoryQuestionCount--;
        this.questionOneMandatory = false;
    } else{
      this.questionOneMandatory = true;
    }

    if (this.serviceAssesmentForm.controls['questionNumberTwoRadio'].value == 'Yes' && 
        ((this.serviceAssesmentForm.controls['questionNumberTwoText'].value).trim().length !== 0)) {
        this.mendatoryQuestionCount--;
        this.questionTwoMandatory = false;
    }
    else if (this.serviceAssesmentForm.controls['questionNumberTwoRadio'].value == 'No') {
      this.mendatoryQuestionCount--;
      this.questionTwoMandatory = false;
    }else{
      this.questionTwoMandatory = true;
    }

    if (this.serviceAssesmentForm.controls['questionNumberThreeRadio'].value == 'Yes' && 
        ((this.serviceAssesmentForm.controls['questionNumberThreeText'].value).trim().length !== 0)) {
          this.mendatoryQuestionCount--;
          this.questionThreeMandatory = false;
    }
    else if (this.serviceAssesmentForm.controls['questionNumberThreeRadio'].value == 'No') {
      this.mendatoryQuestionCount--;
      this.questionThreeMandatory = false;
    }else{
      this.questionThreeMandatory = true;
    }

    if((this.serviceAssesmentForm.controls['questionNumberFourText'].value).trim().length !== 0) {
      this.mendatoryQuestionCount--;
      this.questionFourMandatory = false;
    }else{
      this.questionFourMandatory = true;
    }

    if(this.serviceAssesmentForm.controls['questionNumberFiveRadio'].value){
      this.mendatoryQuestionCount--;
      this.questionFiveMandatory = false;
    }else{
      this.questionFiveMandatory = true;
    }
    
    if(this.mendatoryQuestionCount === 0){
      this.questionnaireStatus = `All 5 Questions are answered.`
    }else if(this.mendatoryQuestionCount === 1){
      this.questionnaireStatus = `${this.mendatoryQuestionCount} Question is remaining to be answered.`;
    }else{
      this.questionnaireStatus = `${this.mendatoryQuestionCount} Questions are remaining to be answered.`;
    }
    return this.mendatoryQuestionCount;
  }
}

