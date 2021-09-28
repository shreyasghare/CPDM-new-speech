import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { Subscription } from 'rxjs';
import { CuiModalContent, CuiModalService } from '@cisco-ngx/cui-components';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'applicability-helper',
  templateUrl: './applicability-helper.component.html',
  styleUrls: ['./applicability-helper.component.scss']
})
export class ApplicabilityHelperComponent implements OnInit, OnDestroy {
  constructor(public cuiModalService: CuiModalService, private router: Router,
              private dataService: ProjectsDataService, private modalService: BsModalService,
              public dialogRef: MatDialogRef<ApplicabilityHelperComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {}

  get getSubmitBtnStatus() {
    if (this.trackQuestions.isFirstQuestionAnswered &&
      this.trackQuestions.isSecondQuestionAnswered &&
      this.trackQuestions.isThirdQuestionAnswered &&
      this.trackQuestions.isFourthQuestionAnswered) {
        return false;
      }
    return true;
  }
  firstSelectionValue: string;
  secondSelectionValue: string;
  disableSecondCheckbox = true;
  disableFirstCheckbox = true;

  questionNumberOne: any;
  questionNumberTwo: any;
  questionNumberThree: any;

  @Output() wizardScreen: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateItems: EventEmitter<any> = new EventEmitter<any>();

  firstRadioButton = 'yes';
  secondRadioButton = 'new product';
  isFirstVisit = true;
  apiResponseReady: boolean;
  generalComplianceItems: any[] = [];
  additionalRequirementsItems: any[] = [];
  mapQuestionsLogicData: any[] = [];
  standardTemplate: any;
  // @Input() copiedStandardTemplate:any;
  questionNumber2_1: any;
  questionNumber2_2: any;
  questionsLogicSubscription: Subscription;

  // information helper
  resForInfoIcon: any = [];
  infoIconDesc: any;
  applicabilityKey: any;
  applicability: any;
  applicabilityContent: any;
  reachCompliance: any;
  reachComplianceText: any;
  reachComplianceContent: any;

  trackQuestions = {
    isFirstQuestionAnswered: false,
    isSecondQuestionAnswered: false,
    isThirdQuestionAnswered: false,
    isFourthQuestionAnswered: false,
  };
  isFormSubmitted: boolean;
  @Input() modalRef;


  firstDropDownitems: any[] = [];

  secondDropDownitems: any[] = [
    [
      {
        name: 'Yes',
        value: 'yes',
      },
      {
        name: 'No',
        value: 'no',
      },
    ],
  ];

  generalCompliance = {
    accessibility: false,
    exportCompliance: false,
    thirdPartySoftwareRegistration: false,
    revenueDevelopmentLifestyle: false,
    secureDevelopmentLifestyle: false,
    smartLicensing: false
  };

  ngOnInit() {
    if (Object.keys(this.data.gc).length) {
      this.generalComplianceItems = [...this.data.gc];
    }
    if (Object.keys(this.data.ar).length) {
      this.additionalRequirementsItems = [...this.data.ar];
    }
    if (this.data.mapQuestionsLogicData.length) {
      this.mapQuestionsLogicData = [...this.data.mapQuestionsLogicData];
    }
    this.dataService.getStandardTemplates().subscribe(res => {
      this.standardTemplate = res[0];
      if (this.standardTemplate && !this.generalComplianceItems.length && !this.additionalRequirementsItems.length) {
        this.getStandatdTemplate(false);
      }
      if (this.mapQuestionsLogicData.length) {
        this.populateMapQuestionsData();
      } else {
        this.getQuestionsFromNode();
      }
      // this.getItemDescfromjson();
    });

  }

  populateMapQuestionsData() {
    this.mapQuestionsLogic();
    this.isFirstVisit = false;
    this.firstRadioButton = this.mapQuestionsLogicData[1].options[0].question[0].options.selectedRadioButton;
    this.secondRadioButton = this.mapQuestionsLogicData[1].options[0].question[1].options.selectedRadioButton;
    this.firstSelectionValue = this.mapQuestionsLogicData[1].selected;
    this.secondSelectionValue = this.mapQuestionsLogicData[2].selected;
    this.onSelectionFirstDropdown();
    this.onSelectionSecondDropdown();
    this.trackQuestions = {
      isFirstQuestionAnswered: true,
      isSecondQuestionAnswered: true,
      isThirdQuestionAnswered: true,
      isFourthQuestionAnswered: true,
    };
  }

  showModal(content, large, name: string): void {
    this.dataService.getItemDesc(name).subscribe(res => {
      if (res[0].name === name) {
        const keys = Object.keys(res[0]);
        this.infoIconDesc = res[0];
        this.applicabilityKey = keys[3];
        this.applicability = res[0].applicability;
        this.applicabilityContent = this.applicability.content;
        this.reachCompliance = res[0].reachCompliance;
        this.reachComplianceText = this.reachCompliance.text;
        this.reachComplianceContent = this.reachCompliance.content;
        this.cuiModalService.show(content, large);
      }
    },
    err => {
    });
}
  // getItemDescfromjson(){
  //   this.dataService.getItemDesc().subscribe(res=>{
  //   this.resForInfoIcon = res;
  //   });
  // }
  getStandatdTemplate(checked: boolean) {
    this.standardTemplate.generalCompliances.forEach(element => {
      // element.applicability = checked;
      element.selected = checked;
      this.generalComplianceItems.push(element);
    });
    this.standardTemplate.additionalRequirements.forEach(element => {
      // element.applicability = checked;
      element.selected = false;
      this.additionalRequirementsItems.push(element);
    });
}

  onSelectionFirstDropdown(action?): void {
    if (action || this.isFirstVisit) {
      this.firstRadioButton = 'yes';
      this.secondRadioButton = 'new product';
    }

    this.questionNumberTwo.options.forEach(element => {
      //
      if (this.firstSelectionValue === element.value) {
        if (element.question) {
          this.disableSecondCheckbox = false;
          this.disableFirstCheckbox = false;
          this.syncRadioButtonOne(this.firstRadioButton);
          this.syncRadioButtonTwo(this.secondRadioButton);
        } else {
          this.syncRadioButtonOne('no');
          this.syncRadioButtonTwo('neither');
          this.disableSecondCheckbox = true;
          this.disableFirstCheckbox = true;
        }
      }
    });
    this.trackUserInput('questionTwo', true);
    this.trackUserInput('questionThree', true);
  }

  onSelectionSecondDropdown(): void {
    for (const element of this.questionNumberThree.options) {
      if (element.value.toLocaleLowerCase() === this.secondSelectionValue.toLocaleLowerCase()) {
        this.isCheckboxChecked(element, true);
        break;
      } else {
        this.isCheckboxChecked(element, false);
      }
     }

    this.trackUserInput('questionFourth', true);

  }


  onChangeCheckBox(event, value) {
    let trackCheckbox = 0;
    const checked = event.target.checked;
    this.questionNumberOne.forEach(element => {
        if (element.value == value) {
          element.applicable = checked;
          element.checkBox = checked;
          this.isCheckboxChecked(element, checked);
        }
       });

    this.questionNumberOne.forEach(element => {
        if (element.applicable) {
          this.isCheckboxChecked(element, true);
          this.trackUserInput('questionOne', true);
      } else {
        trackCheckbox++;
        if (trackCheckbox === this.questionNumberOne.length) {
          this.trackUserInput('questionOne', false);
        }
      }
    });



  }

  isCheckboxChecked(element: any, checked: boolean) {
    if (element.generalCompliances) {
      element.generalCompliances.forEach(gc => {
        //
         this.checkGeneralCompliance(gc.refId, checked);
      });
    }
    if (element.additionalRequirements) {
        element.additionalRequirements.forEach(ar => {
         this.checkAdditionalRequirements(ar.refId, checked);
        });
  }
  }

  checkAdditionalRequirements(refId: string, checked: boolean) {
    this.additionalRequirementsItems.forEach(item => {
      if (item._id == refId) {
        item.selected = checked;
        // item.applicability = checked;
      }
    });
  }

  checkGeneralCompliance(refId: string, checked: boolean) {
    this.generalComplianceItems.forEach(item => {
      if (item._id == refId) {
        item.selected = checked;
        // item.applicability = checked;
      }
    });
  }


  onFirstRadioButtonChange(event) {
    const radioValue = event.target.value;
    this.firstRadioButton = radioValue;
    // this.updateRadioButtonValues(event);
    //
    this.syncRadioButtonOne(radioValue);

  }

  syncRadioButtonOne(radioValue: string) {
    for (const item of this.questionNumber2_1.options) {
      if (item.value.toLocaleLowerCase() === radioValue.toLocaleLowerCase()) {
        if (radioValue.toLocaleLowerCase() === 'yes') {
          this.isCheckboxChecked(item, true);
          this.disableSecondCheckbox = false;
          this.syncRadioButtonTwo(this.secondRadioButton);
          break;
        }
      } else {
        this.isCheckboxChecked(item, false);
        this.disableSecondCheckbox = true;
        // this.syncRadioButtonOne('no');
        this.syncRadioButtonTwo('neither');
      }
    }
  }

  onSecondRadioButtonChange(event) {
    const radioValue = event.target.value.toLocaleLowerCase();
    this.secondRadioButton = radioValue;
    // this.updateRadioButtonValues(event);
    //
    this.syncRadioButtonTwo(radioValue);

  }

  syncRadioButtonTwo(radioValue: string) {
    for (const item of this.questionNumber2_2.options) {
      if (item.value.toLocaleLowerCase() === radioValue) {
          this.isCheckboxChecked(item, true);
          break;
      } else {
        this.isCheckboxChecked(item, false);
      }
    }
  }


 // onCancel(emit: boolean) {
    // if(!this.isFormSubmitted){
    // this.generalComplianceItems = [];
    // this.additionalRequirementsItems = [];
    // this.getStandatdTemplate(true);
    // this.updateItems.emit({gc:this.generalComplianceItems,ar:this.additionalRequirementsItems})
    // if(emit){
    //   this.wizardScreen.emit('destroyWizardComponent');
    // }
    // }else{
      // this.wizardScreen.emit('goToComplianceScreen');
    // }
    // this.cuiModalService.hide();
    // this.modalRef.hide();
   // this.onNoClick(false);
 // }


  onNoClick(action): void {
    this.dialogRef.close(action);
  }

  onSubmit() {
    // this.wizardScreen.emit('goToComplianceScreen');
    // this.updateItems.emit({gc:this.generalComplianceItems,ar:this.additionalRequirementsItems})
    this.isFormSubmitted = true;
    // this.cuiModalService.hide();
    // this.modalRef.hide();
    this.data.gc = this.generalComplianceItems;
    this.data.ar = this.additionalRequirementsItems;

    this.mapQuestionsLogicData[1].selected = this.firstSelectionValue;
    this.mapQuestionsLogicData[1].options[0].question[0].options.selectedRadioButton = this.firstRadioButton;
    this.mapQuestionsLogicData[1].options[0].question[1].options.selectedRadioButton = this.secondRadioButton;
    this.mapQuestionsLogicData[2].selected = this.secondSelectionValue;
    this.data.mapQuestionsLogicData = this.mapQuestionsLogicData;

    this.onNoClick(true);

  }

  getQuestionsFromNode() {
    this.questionsLogicSubscription = this.dataService.getHelpMeSelectOptions().subscribe(res => {
      this.mapQuestionsLogicData = res;
      this.mapQuestionsLogic();
    });
  }

  mapQuestionsLogic() {
    //
      this.mapQuestionsLogicData.forEach((element) => {
       switch (element.questionNumber) {
         case '1':
            element.options.forEach(options => {
              if (options.checkBox == null) {
                options.checkBox = false;
              }
            });
            this.questionNumberOne = element.options;

            break;
         case '2':
           this.questionNumberTwo = element;
           const firstDD = [];
           element.options.forEach(element => {
             if (element.question) {
                element.question.forEach(element => {
                 switch (element.questionNumber) {
                   case '2.1':
                     this.questionNumber2_1 = element;
                     break;

                  case '2.2':
                    this.questionNumber2_2 = element;
                    break;
                 }
                });
             }
             const obj = {
               name: element.value,
               value: element.value
             };
             firstDD.push(obj);
           });
           this.firstDropDownitems.push(firstDD);
           break;
         case '3':
           this.questionNumberThree = element;
           break;
       }
       this.apiResponseReady = true;
    });
  }

  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    if (this.questionsLogicSubscription) {
      this.questionsLogicSubscription.unsubscribe();
    }
    // *****************************************************/
  }

  createId(id: string) {
    return id.replace(/\s+/g, '-').toLowerCase();
  }

  trackUserInput(userInput: string, isAnswered: boolean) {
    switch (userInput) {
      case 'questionOne':
      this.trackQuestions.isFirstQuestionAnswered = isAnswered;
      break;

      case 'questionTwo':
      this.trackQuestions.isSecondQuestionAnswered = isAnswered;
      break;

      case 'questionThree':
      this.trackQuestions.isThirdQuestionAnswered = isAnswered;
      break;

      case 'questionFourth':
      this.trackQuestions.isFourthQuestionAnswered = isAnswered;
      break;
    }
  }
}
