import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { GzRequirementChecklistModalComponenet } from './gz-requirement-checklist-modal/gz-requirement-checklist-modal.component';
import { GzServiceSelectionQuestionnaireModalComponenet } from './gz-service-selection-questionnaire-modal/gz-service-selection-questionnaire-modal.component';
import { GlobalizationModel, GlobalizationStrategyModel, ServiceRequestModel, RequirementCheckListModel } from '@cpdm-model/additional-requirements/globalization/globalization.model';
import { GlobalizationService } from '@cpdm-service/additional-requirements/globalization/globalization.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Role } from '@cpdm-model/role';
import { CustomConfirmationDialogComponent } from '@cpdm-shared/components/custom-confirmation-dialog/custom-confirmation-dialog.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
@Component({
  selector: 'app-gz-requirements',
  templateUrl: './gz-requirements.component.html',
  styleUrls: ['./gz-requirements.component.scss']
})
export class GzRequirementsComponent implements OnInit {

  destroy$ = new Subject();
  globalizationId: string;
  role = Role;
  globalizationStrategyObj: GlobalizationStrategyModel;
  globalizationServiceRequestObj: ServiceRequestModel;
  updatedGlobalozationObj: GlobalizationModel;
  defineStratgyScreen = true;
  serviceRequestScreen = false;
  requirementCheckListScreen = false;
  isServiceSelectionSelected = false;
  addCheckListButton = 'Start';
  checkListStatusMsg: string;
  isSpinner = false;
  checklistSectionObj: RequirementCheckListModel;
  hasRequirements = false;
  pmSubmitComment: string;

  requChecklistStatus: string;
  ServiceSelectionOption: boolean;
  serviceSelectionQuestionnaireStatus: boolean;

  defineStrategyForm = new FormGroup({
    offeringSelection: new FormControl('', [Validators.required]),
    productName: new FormControl('', [this.noWhitespaceValidator]),
    productVersion: new FormControl('', [this.noWhitespaceValidator]),
    expectedDeliveryDate: new FormControl('', [Validators.required])
  });

  serviceSelectionForm = new FormGroup({
    serviceSelection: new FormControl('', [Validators.required]),
    gapAnalysis: new FormControl({value: true, disabled: true}, [Validators.required]),
    internationalDev: new FormControl({value: true, disabled: true}, [Validators.required]),
    translation: new FormControl({value: true, disabled: true}, [Validators.required]),
    userInterface: new FormControl({value: true, disabled: true}, [Validators.required]),
    onlineHelp: new FormControl('', [Validators.required]),
    techDocuments: new FormControl('', [Validators.required]),
    LATRecommended: new FormControl({value: true, disabled: true}, [Validators.required]),
    LATSupport: new FormControl({value: true, disabled: true}, [Validators.required]),
    solutionTesting: new FormControl({value: true, disabled: true}, [Validators.required])
  });

  // Dummy expected Delivery Dates (Service creation in-progress)
  expectedDeliveryDates = [
    {
      label: 'No Selection',
      value: 'noSelection'
    },
    {
    label: 'Q1FY21',
    value: 'Q1FY21'
    },
    {
      label: 'Q2FY21',
      value: 'Q2FY21'
    },
    {
      label: 'Q3FY21',
      value: 'Q3FY21'
    },
    {
      label: 'Q4FY21',
      value: 'Q4FY21'
    },
    {
      label: 'Q1FY22',
      value: 'Q1FY22'
    },
    {
      label: 'Q2FY22',
      value: 'Q2FY22'
    },
    {
      label: 'Q3FY22',
      value: 'Q3FY22'
    },
    {
      label: 'Q4FY22',
      value: 'Q4FY22'
    }];
  customTab = [
    { tabNumber: 1, tabName: 'Define Strategy', active: true, isEnabled: true, isStatusAvailable: true },
    { tabNumber: 2, tabName: 'Service Request', active: false, isEnabled: false, isStatusAvailable: false },
    { tabNumber: 3, tabName: 'Requirements checklist', active: false, isEnabled: false, isStatusAvailable: false }
  ];

  toolTipInfo = {
    i18nInfoIconText: `What is Internationalization or i18n?
                      Internationalization is the process of designing a product so that it can be adapted to multiple languages and cultural conventions without the need for code changes. Internationalization is one aspect of globalization. i18n is the common abbreviation for internationalization where 18 refers to the eighteen letters between the i and the n.`,
    i10nInfoIconText: `What is Localization or l10n?
                      Localization is the process of delivering and adapting a product or service to a particular language, culture, and localized "look-and-feel” by adding local-specific components and translating text.  l10n is the common abbreviation for localization where 10 refers to the ten letters between the L and the n.`,
    lATInfoIconText: 'Testing and navigating the localized application and reviewing the display of the translations (User Interface UI) as well as the interaction of the application with localized content (user data and user input).',
    turnKeyInfoText: 'Globalize and deliver all 4 GTS services to our stakeholders with little or no involvement of their resources after Globalization engagement, process review, and examination of the project requirements and stakeholder’s approval. Stakeholders can check project status live via LME or talk to the GTS Engagement Manager.'
  };
  gobalisationAppHolding = {
    icon: 'globe',
    status: `<div><span class="text-danger">*</span>Define your Globalization Strategy</div>`,
    optionLabel : {
      newOfferingLabel: 'New offering',
      changeOfferingLabel: 'Change to an existing offering',
      changeOfferingText: `<p>- Localization update (prioritize new features and required strings or new texts/contents 
                            for an existing product and/or add new locale(s). Note that some new features may require
                            internationalization)</p>`
    },
    noteText: `<p class="text-secondary ml-8 text-italic">NOTE:  For help on Globalization Strategy, Best Practices and Product Globalization Policy guidelines,<br>please contact:
    <u><a class="text-link" href="mailto:globalgts-eng-mgrs@cisco.com" target="_blank">globalgts-eng-mgrs@cisco.com</a></u></p>`
  };
  serviceReqAppHolding = {
    serviceSelectionStatus: {
      icon: 'service',
      status: '<div><span class="text-danger">*</span>Service Selection</div>',
      message: 'Most frequently requested services from GTS (Globalization & Translation Services)'
    },
    questionnaireMsgs: {
      icon: 'edit',
      status: '<div><span class="text-danger">*</span>Add more details by answering few questions</div>',
    },
    messageNote: `<div class="important-note-color"><span>Important:</span>
                  <ul class="ml-1"><li class="mt-1 mb-1">We recommend that all Globalization service requesters secure a budget from their respective organization prior to submitting a service request in Localization Management Engine
                  <a class="text-link" href="https://ibpm.cisco.com/cpe/sr/login/qDDyXNoEv0RP6tigJaHDPQ%5b%5b%2a/%21STANDARD" target="_blank">LME</a>, our service request tool.</li>
                  <li> Email the Globalization & Translation Services <a class="text-link" href="mailto:globalgts-eng-mgrs@cisco.com" target="_blank">globalgts-eng-mgrs@cisco.com</a> if you have questions or comments.</li></ul></div>`
  };

  reqChkListAppHolding = {
    reqChkListHolding: {
      icon: 'service',
      status: '<div><span class="text-danger">*</span>Requirement Checklist</div>',
    },
    pmCommentsHolding: {
      icon: 'chat',
      status: 'Provide comment (if any)'
    },
    reqChkListSubmit:{
      icon: 'wait',
      status:'Requirment Checklist Submitted for review',
      text: `<div><span>The GTS (Globalization & Translation Services) team will review the recommendations to provide feedback or acknowledgment. Email  <a class="text-link" href="mailto:globalgts-eng-mgrs@cisco.com" target="_blank">globalgts-eng-mgrs@cisco.com</a> if you have questions or comments.</span></div>`
    },
    pmCommentsSubmit: {
      icon: 'chat',
      status: 'Comments from the PM team'
    }
  };
/*
 with any further questions.
*/
  checkboxList = [
    {
      name: 'Gap Analysis',
      value: 'gapAnalysis',
      disabled: true
    },
    {
      name: 'Internationalization Development and Unit testing',
      value: 'internationalDev',
      disabled: true
    },
    {
      name: 'Translation',
      value: 'translation',
      disabled: true
    },
    {
      name: 'User Interface',
      value: 'userInterface',
      disabled: true,
      intermediate: true
    },
    {
      name: 'Online Help (OLH)',
      value: 'onlineHelp',
      disabled: false,
      intermediate: true
    },
    {
      name: 'Tech Documents',
      value: 'techDocuments',
      disabled: false,
      intermediate: true
    },
    {
      name: 'Localization Acceptance Testing (LAT) - Recommended',
      infoIcon: true,
      value: 'LATRecommended',
      disabled: true
    },
    {
      name: 'LAT Support Services - Script Development',
      value: 'LATSupport',
      disabled: true
    },
    {
      name: 'Solution Testing (AKA Introperability Testing)',
      value: 'solutionTesting',
      disabled: true,
    }
  ];

  globalizationPoWaitStatus = {
    icon: 'wait',
    status: 'The Engineering team is defining the Globalization Strategy.'
  };
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private toastService: ToastService,
              private userDetailsService: UserDetailsService,
              private globalizationService: GlobalizationService) { }

  ngOnInit() {
    this.globalizationId = this.activatedRoute.snapshot.parent.params.id;
    this.getGlobalizationDetails();
  }

  /**
   * @description Getter to get current logged in user role
   */
   get currentRole(): string {
    return this.userDetailsService.userRole;
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

  /**
   * @description Onloading get the Globalization data
  */
  getGlobalizationDetails() {
    this.isSpinner = true;
    this.globalizationService.getGlobalizationData(this.globalizationId).pipe(takeUntil(this.destroy$)).subscribe(globalizationData => {
      this.updatedGlobalozationObj = globalizationData.data;
      if (globalizationData.data.requirements) {
        this.globalizationStrategyObj = JSON.parse(JSON.stringify(globalizationData.data.requirements.defineStategy));
        if (this.globalizationStrategyObj.globalizationStratery !== null) {
          this.patchDefineStrategyData();
          if (this.globalizationStrategyObj.tabStatus.status === 'Completed') {
            this.hasRequirements = true;
          }    
        } else {
          this.hasRequirements = false;
        }   
        this.globalizationServiceRequestObj =JSON.parse(JSON.stringify(globalizationData.data.requirements.serviceRequest));
        this.ServiceSelectionOption = getNestedKeyValue(this.globalizationServiceRequestObj,"serviceSelection")? true: false;
        this.serviceSelectionQuestionnaireStatus = getNestedKeyValue(this.globalizationServiceRequestObj,"serviceRequestQuestionaire","completedFlag");
        if(this.serviceSelectionQuestionnaireStatus){
          this.serviceReqAppHolding.questionnaireMsgs.status = `<div>Add more details by answering few questions</div>`  
        }
        if (this.globalizationServiceRequestObj.serviceSelection !== null) {
          this.patchServiceSelectionData();
        }  
        this.checklistSectionObj = JSON.parse(JSON.stringify(globalizationData.data.requirements.requirementsChecklist))
        status = this.updatedGlobalozationObj.requirements.requirementsChecklist.checklistSection.status;
        this.requChecklistStatus = getNestedKeyValue(this.checklistSectionObj,"tabStatus","status")
        if (status) {
          if (status === 'saved') {
            this.addCheckListButton = 'View / Edit';
            this.reqChkListAppHolding.reqChkListHolding.status= '<div>Requirement Checklist</div>';
          } else if(status === 'submitted'){
            this.addCheckListButton = 'View';
            this.reqChkListAppHolding.reqChkListHolding.status= '<div>Requirement Checklist</div>';
          } else {
            this.addCheckListButton = 'Start';
            this.reqChkListAppHolding.reqChkListHolding.status= '<div><span class="text-danger">*</span>Requirement Checklist</div>';
          }
        }
        this.getRemainingQueStatus(this.checklistSectionObj)
        
        this.loadTabData();
      }
      this.isSpinner = false;
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching Globalization details', 'danger');
      this.isSpinner = false;
    });
  }

  /**
   * @description Patching Define Strategy form values
  */
  patchDefineStrategyData() {
    const { globalizationStratery, productDetails: {productName, productVersion, expectedDeliveryDate} } = this.globalizationStrategyObj;
    this.defineStrategyForm.get('offeringSelection').setValue(globalizationStratery);
    this.defineStrategyForm.get('productName').setValue(productName);
    this.defineStrategyForm.get('productVersion').setValue(productVersion);
    this.defineStrategyForm.get('expectedDeliveryDate').setValue(expectedDeliveryDate);
    this.removeMandatory();

    if (this.currentRole === 'globalizationPO') {
      this.disableChevrons();
      Object.keys(this.defineStrategyForm.controls).forEach(key => {
        this.defineStrategyForm.controls[key].disable();
      });
    }
  }

  removeMandatory(event?) {
    let val;
    if (event) { val = event.target.value; }
    if (val || this.defineStrategyForm.value.offeringSelection) {
      this.gobalisationAppHolding.status = 'Define your Globalization Strategy';
    } else {
      this.gobalisationAppHolding.status = '<div><span class="text-danger">*</span>Define your Globalization Strategy</div>';
    }
  }
  
  /**
   * @description Patching Service selection form values
  */
  patchServiceSelectionData() {
    const { serviceSelection } = this.globalizationServiceRequestObj;
    this.serviceSelectionForm.get('serviceSelection').setValue(serviceSelection);
    this.setSelectionCheckboxes(serviceSelection);
  }
  /**
   * @description Saving Define Strategy On click 'Next'
  */
  saveStrategyObject() {
    this.isSpinner = true;
    const requestObj = {
      projectId: this.updatedGlobalozationObj.projectId,
      globalizationStratery: this.defineStrategyForm.value.offeringSelection,
      productName: this.defineStrategyForm.value.productName,
      productVersion: this.defineStrategyForm.value.productVersion,
      expectedDeliveryDate: this.defineStrategyForm.value.expectedDeliveryDate
    };

    this.globalizationService.updateDefineStrategyObject(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      if (strategyRes && strategyRes.success) {
      }
      this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
      this.switchToServiceReqTab();
      this.isSpinner = false;
    }, (err) => {
      this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
      this.isSpinner = false;
    });
  }

  getRemainingQueStatus(checklistData) {
    this.checklistSectionObj.checklistSection.mandatoryQuestionsYetToBeAnswered
    if (checklistData.checklistSection.completedFlag) {
      this.checkListStatusMsg = `All 6 requirements are checked`;
    } else {
      this.checkListStatusMsg = `${checklistData.checklistSection.mandatoryQuestionsYetToBeAnswered} ${checklistData.checklistSection.mandatoryQuestionsYetToBeAnswered === 1 ? 'requirement is' : 'requirements are'} remaining to be checked (completed)`;
    }
    
  }

  /**
   * @description Switching next tab from chevron
  */
  switchToNextTab(event) {
    this.switchScreen(event.currentTabNumber);
  }

  switchScreen(tabNumber: number) {
    switch (tabNumber) {
      case 1:
        this.defineStratgyScreen = true;
        this.serviceRequestScreen = false;
        this.requirementCheckListScreen = false;
        break;
      case 2:
        this.defineStratgyScreen = false;
        this.serviceRequestScreen = true;
        this.requirementCheckListScreen = false;
        break;
      case 3:
      this.defineStratgyScreen = false;
      this.serviceRequestScreen = false;
      this.requirementCheckListScreen = true;
      break;
    }
  }

  switchToServiceReqTab() {
    this.customTab[1].active = true;
    this.customTab[1].isEnabled = true;
    this.customTab[0].active = false;
    this.customTab[2].active = false;
    for (const tab of this.customTab) {
      if (tab.active && tab.isEnabled) {
        this.switchScreen(tab.tabNumber);
        break;
      }
    }
  }

  switchToRequirementCheckListTab() {
    this.isSpinner = true;
    const requestObj = {
      projectId: this.updatedGlobalozationObj.projectId,
    }
    this.globalizationService.updateServiceRequestTabSatus(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      if (strategyRes && strategyRes.success) {
      }
      this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
      
      this.customTab[2].active = true;
      this.customTab[2].isEnabled = true;
      this.customTab[1].active = false;
      for (const tab of this.customTab) {
        if (tab.active && tab.isEnabled) {
          this.switchScreen(tab.tabNumber);
          break;
        }
      }
      //
      this.isSpinner = false;
    }, (err) => {
      this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
      this.isSpinner = false;
    });    
  }

  switchToStrategyTab() {
    this.customTab[1].active = false;
    this.customTab[0].isEnabled = true;
    this.customTab[0].active = true;
    for (const tab of this.customTab) {
      if (tab.active && tab.isEnabled) {
        this.switchScreen(tab.tabNumber);
        break;
      }
    }
  }

  /**
   * @description On Changing Service Selection Radio
  */
  onServiceSelectionChange(event) {
    this.setSelectionCheckboxes(event.target.value);
    this.saveServiceSelectionOption(event.target.value);
    this.saveDefaultServiceSelectionList(event.target.value);
    if (event.target.value) {
      this.serviceReqAppHolding.serviceSelectionStatus.status = 'Service Selection';
    } else {
      this.serviceReqAppHolding.serviceSelectionStatus.status = '<div><span class="text-danger">*</span>Service Selection</div>';
    }
  }

  setSelectionCheckboxes(serviceSelection) {
    this.isServiceSelectionSelected = true;
    if (serviceSelection === 'turnKeyService') {
      this.serviceSelectionForm.get('gapAnalysis').setValue(true);
      this.serviceSelectionForm.get('gapAnalysis').disable();
      this.serviceSelectionForm.get('internationalDev').setValue(true);
      this.serviceSelectionForm.get('internationalDev').disable();
      this.serviceSelectionForm.get('LATSupport').setValue(true);
      this.serviceSelectionForm.get('LATSupport').disable();
      this.serviceSelectionForm.get('LATRecommended').setValue(true);
      this.serviceSelectionForm.get('LATRecommended').disable();
      this.serviceSelectionForm.get('solutionTesting').setValue(true);
      this.serviceSelectionForm.get('solutionTesting').disable();
      this.serviceSelectionForm.get('onlineHelp').setValue(false);
      this.serviceSelectionForm.get('onlineHelp').enable();
      this.serviceSelectionForm.get('techDocuments').setValue(false);
      this.serviceSelectionForm.get('techDocuments').enable();
    } else if (serviceSelection === 'individualServiceRequest' ) {
      this.serviceSelectionForm.get('gapAnalysis').setValue(false);
      this.serviceSelectionForm.get('gapAnalysis').enable();
      this.serviceSelectionForm.get('internationalDev').setValue(false);
      this.serviceSelectionForm.get('internationalDev').enable();
      this.serviceSelectionForm.get('LATSupport').setValue(false);
      this.serviceSelectionForm.get('LATSupport').enable();
      this.serviceSelectionForm.get('LATRecommended').enable();
      this.serviceSelectionForm.get('solutionTesting').setValue(false);
      this.serviceSelectionForm.get('solutionTesting').enable();
    }
  }


  saveServiceSelectionOption(serviceSelection) {
    const requestObj = {
      projectId: this.globalizationId,
      serviceSelectionValue: serviceSelection
    };
    this.globalizationService.updateServiceSelectionOption(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      if (strategyRes && strategyRes.success) {
        this.globalizationServiceRequestObj =JSON.parse(JSON.stringify(strategyRes.data.requirements.serviceRequest));
        this.ServiceSelectionOption = getNestedKeyValue(this.globalizationServiceRequestObj,"serviceSelection")? true: false;
      }
      this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
    }, (err) => {
      this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
    });
  }

  saveDefaultServiceSelectionList(serviceSelection){
    Object.keys(this.serviceSelectionForm.controls).forEach(key => {
      if(this.serviceSelectionForm.get(key).value === true){
        console.log(this.serviceSelectionForm.get(key).value);
        const requestObj = {
          projectId: this.globalizationId,
          uniqueKey: key,
          value: this.serviceSelectionForm.get(key).value
        }
        this.globalizationService.updateServiceSelectionChkBoxValues(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
          if (strategyRes && strategyRes.success) {
            //If any business logic write here
          }
          // this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
        }, (err) => {
          this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
        });
      }
    });
  }

  saveServiceSelectionList(event,value) {
    const requestObj = {
      projectId: this.globalizationId,
      uniqueKey: value,
      value: event.checked
    }
    this.globalizationService.updateServiceSelectionChkBoxValues(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
      if (strategyRes && strategyRes.success) {
        //If any business logic write here
      }
      this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
    }, (err) => {
      this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
    });

  }

  /**
   * @description Open Service Selction questionnaire model
  */

  openServiceQuestionnaireModel() {
    let isReadonlyFlag = false;
    const config = {
      data: { globalizationData: this.updatedGlobalozationObj, isReadonly: isReadonlyFlag},
      width: '100rem',
      height: '80vh',
      disableClose: true
    };
    const dialogRef = this.dialog.open(GzServiceSelectionQuestionnaireModalComponenet, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.globalizationService.updateGlobalizationDataWithSubject(this.updatedGlobalozationObj);
        let serviceSelectionQuestionnaire = getNestedKeyValue(res.data, "requirements", "serviceRequest");
        this.serviceSelectionQuestionnaireStatus = getNestedKeyValue(serviceSelectionQuestionnaire, "serviceRequestQuestionaire", "completedFlag");
        if(this.serviceSelectionQuestionnaireStatus){
          this.serviceReqAppHolding.questionnaireMsgs.status = `<div>Add more details by answering few questions</div>`  
        }else{
          this.serviceReqAppHolding.questionnaireMsgs.status = `<div><span class="text-danger">*</span>Add more details by answering few questions</div>`  
        }
      }
    });
  }

  /**
   * @description Opening requirements check list model
  */
  openReqChecKListModel(buttonStatus) {
    let isReadonlyFlag = false;
    if (buttonStatus === 'View') {
      isReadonlyFlag = true;
    }
    const config = {
      data: { globalizationData: this.updatedGlobalozationObj, isReadonly: isReadonlyFlag},
      width: '100rem',
      height: '75vh',
      disableClose: true
    };
    const dialogRef = this.dialog.open(GzRequirementChecklistModalComponenet, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.success) {
        this.getGlobalizationDetails();
      }
    });
    
  }

  /**
   * @description This methos is to disable second and third chevron for PO.
   * Developer can remove it once entire development completed fro PO.
  */
   disableChevrons() {
    this.customTab[1].isEnabled = false;
    this.customTab[2].isEnabled = false;
  }


  onSaveRequirements(event){
    const confirmationDialogRef = this.dialog.open(CustomConfirmationDialogComponent,
      {
        data: {
          headerText: 'Confirm action',
          confirmationText: `<span class= "text-green">By submitting this checklist, you acknowledge that you have reviewed and agree to provide all the items to GTS.</span>`,
          buttonText: 'I acknowledge, submit',
          buttonStyle: 'primary'
        },
        width: '35vw', height: 'auto', disableClose: true
      });
      confirmationDialogRef.componentInstance.onConfirmAction.subscribe(async () => {
      
        this.isSpinner = true;
        const requestObj = {
          projectId: this.updatedGlobalozationObj.projectId,
          comment: this.pmSubmitComment ? this.pmSubmitComment.trim() : undefined
        };

        this.globalizationService.submitRequirementsChecklistTab(this.globalizationId, requestObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
          if (strategyRes && strategyRes.success) {
          }
          this.globalizationService.updateGlobalizationDataWithSubject(strategyRes.data);
          this.toastService.show('Data saved successfully', 'Requirements Checklist save details', 'success');  
          this.isSpinner = false;

          this.getGlobalizationDetails();
        }, (err) => {
          this.toastService.show('Error in data updating', 'Unable to save details', 'danger');
          this.isSpinner = false;
        });

        confirmationDialogRef.close();
        // PO Approve 
        let reqObj = { 
                    "projectId":this.globalizationId,
                    "comment":"Approve comments from PO: try1"
                  }
        this.globalizationService.requirementsChecklistApprove(this.globalizationId, reqObj).pipe(takeUntil(this.destroy$)).subscribe(strategyRes => {
          if (strategyRes && strategyRes.success) {
            // for success approval
          }          
        }, (err) => {
          // err on approval
        });
        
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  loadTabData(){
    let strategyTabStatus = getNestedKeyValue(this.globalizationStrategyObj, "tabStatus", "status");
    let serviceRequestStatus = getNestedKeyValue(this.globalizationServiceRequestObj, "tabStatus", "status");
    let checklistSectionStatus = getNestedKeyValue(this.checklistSectionObj, "tabStatus", "status");
    if(serviceRequestStatus === 'In progress'){
      this.customTab[1].active = true;
      this.customTab[1].isEnabled = true;
      this.customTab[0].active = false;
      this.customTab[2].active = false;    
    }else if(checklistSectionStatus === 'In progress'){
      this.customTab[2].active = true;
      this.customTab[2].isEnabled = true;
      this.customTab[0].active = false;
      this.customTab[0].isEnabled = true;
      this.customTab[1].active = false;
      this.customTab[1].isEnabled = true;
    }else if(checklistSectionStatus === 'Completed'){
      this.customTab[2].active = true;
      this.customTab[0].active = false;
      this.customTab[1].active = false;
      this.customTab[0].isEnabled = false;
      this.customTab[1].isEnabled = false;
      this.customTab[2].isEnabled = true;
    }
    for (const tab of this.customTab) {
      if (tab.active && tab.isEnabled) {
        this.switchScreen(tab.tabNumber);
        break;
      }
    }
  }
}
