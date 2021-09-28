import { Component, OnInit, Input, EventEmitter, Output, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, interval } from 'rxjs';
import { ProjectsDataService } from '@cpdm-service/project/projects-data.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { ApplicabilityHelperComponent } from '../applicability-helper/applicability-helper.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CuiModalService } from '@cisco-ngx/cui-components';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MatDialog } from '@angular/material/dialog';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { MatomoTracker } from 'ngx-matomo';
import { environment } from 'src/environments/environment';
import { InfoHelperNewComponent } from '@cpdm-shared/components/info-helper-new/info-helper-new.component';
import { TextToSpeechService } from '@cpdm-service/text-to-speech.service';
import { VoiceRecognitionService } from '@cpdm-service/voice-recognition.service';


const moment = _rollupMoment || _moment;
// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
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
  selector: 'app-create-project-form',
  templateUrl: './create-project-form.component.html',
  styleUrls: ['./create-project-form.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class CreateProjectFormComponent implements OnInit, OnDestroy {


  // myDate = new FormControl(moment()); // For default system date.
  myDate = new FormControl();

  @Input() saveNextButton = 'Next';
  @Output() getProName: EventEmitter<any> = new EventEmitter();
  @Output() selectedScreen: EventEmitter<any> = new EventEmitter();
  @Input() createProject = true;
  @Input() projectId: string;
  standardTemplate: any;

  @ViewChild(ApplicabilityHelperComponent, { static: false }) child: ApplicabilityHelperComponent;
  @ViewChild('applicabilityHelperPopup', { static: false }) applicabilityHelperComponentPopup: TemplateRef<any>;
  @ViewChild('formDataLostError', { static: false }) formDataLostTemplate: TemplateRef<any>;


  createProForm: FormGroup;
  MandatoryNameValidation: boolean;
  showMandatoryDescValidation: boolean;
  applicabilityHelper = false;
  createProjectFormScreen = true;
  createProjectSecondScreen = false;
  private projectNameTimeout;

  businessEntity: any = [];
  subBusinessEntity: any = [];
  productTypes: any = [];
  developmentStyles: any = [];
  templates: any = [];

  selectedBusinessEntity: String;
  selectedSubBusinessEntity: String;
  selectedProductType: String;
  selectedDevelopmentStyle: String;
  selectedTemplate: String;
  templateDisabled = true;
  teamsArray: any = [];
  ownersArray: any = [];
  ownersAcceptorsArray: any = [];
  showInputFields = true;
  productTypesFinal: any;
  finalDevelopmentStyle: any;
  finalTemplate: any;
  test: any;
  finalBusinessEntity: any;
  selectedBusinessEntityObj: any;
  existingProduct = false;
  switchPage = true;
  iSsubBusinessEntityDisabled = true;

  // creatProjectSecondScreen
  generalCompliances: any;
  additionalRequirements: any;
  technicalBestPractices: any;
  displayStandard = true;
  apiResponseReady: boolean;
  postData: any;
  submitFormButtonDisabled = false;
  projectNameExistsLastValue: any;

  nameFromServer: any;
  trackHelpMeSelect = true;
  initializeWizardComponent = true;
  businessEntitySubscription: Subscription;
  productTypesSubscription: Subscription;
  developmentStylesSubscription: Subscription;
  templatesSubscription: Subscription;

  // postForm json object

  // tooltip desc
  generalCompliancesDesc = [];
  additionalReqDesc = [];
  technicalItemsDesc = [];
  infoIconDesc: any;
  resForInfoIcon: any = [];
  applicability: any;
  reachCompliance: any;
  reachComplianceText: any;
  reachComplianceContent: any;
  rcContentText: any;
  rcContentSubcontent: any;
  rcContentSubcontentText: any;
  rcContentSubcontentSc: any;
  applicabilityKey: any;
  projectCodeNameDesc: any;
  fcsDateDesc: any;
  ownerDesc: any;
  teamDesc: any;
  productVerDesc: any;
  applicabilityContent: any;
  loggedInUserCecId: any;
  isProjectOwner = false;
  // While Creating Project Show Loader
  isCreatingProject = false;  
  applicabilityHelpermodalRef: BsModalRef;
  componentTempData = { gc: {}, ar: {}, mapQuestionsLogicData: [] };
  autoSave : Subscription;

  // voice rec -
  cancelProject :boolean = false;
  isDropDonwActive :boolean = false;
  isStatusDropDonwActive :boolean = false;
  selectedTemplateValue:string = '';
  selectedStatusValue:string = '';

  constructor(public cuiModalService: CuiModalService,
              private formBuilder: FormBuilder, private router: Router,
              private dataService: ProjectsDataService,
              private textToSpeechService : TextToSpeechService,
              private voiceRecService :VoiceRecognitionService,
              private toastService: ToastService, private modalService: BsModalService,
              private userDetailsService: UserDetailsService,
              public dialog: MatDialog,
              private matomoTracker: MatomoTracker
              ) { }

  // Angular lifecycle hook
  async ngOnInit() {
    this.dataService.getItemDesc('tooltip').subscribe(res => {
      this.resForInfoIcon = res;
    });
    this.initialiseForm();
    if (this.projectId) {
      this.fetchProjectDetails(this.projectId);
      this.dataService.getStandardTemplates().subscribe(res => {
        for (const key in res[0]) {
          res[0][key].forEach(item => {
            item.checked = true;
            // item.applicability = true;
          });
          break;
        }
        this.getComplianceItems(res[0]);
      }
      );
    }
    this.fetchDropDownData();
    if(this.saveNextButton.toLocaleLowerCase() === 'save'){
      const autoSaveInterval = interval(environment.autoSaveTimeInterval);
      this.autoSave = autoSaveInterval.subscribe(val => this.autoSaveOnTimeInterval());
    }
    this.textToSpeechService.speak(`Enter Unique project name`);
    this.onCreateProjectFirstPage();
  }
  
  async onCreateProjectFirstPage(){
    setTimeout(() => {
      this.voiceRecService.start()
    }, 3000);
    this.getProjectName();
  }
  
  async getProjectName(){
    const voiceProjectName :any = await this.voiceRecService.getResult();
    this.createProForm.patchValue({projectName:voiceProjectName});
    this.dataService.projectNameExists(voiceProjectName.trim()).subscribe(res => {
        if(res){
          this.voiceRecService.stop();
          this.textToSpeechService.speak(`The project name is already exists, please try again`);
          setTimeout(() => {
            this.onCreateProjectFirstPage();
          }, 2000);
        }
        else{
          this.textToSpeechService.speak(`Do you want to continue with ${voiceProjectName} ?`);
          this.onProjectNamePersist();
        }
    });
  }
  
  async onProjectNamePersist(){
    setTimeout(async() => {
      this.voiceRecService.start();
      const confirmProjectName = await this.voiceRecService.getResult();
      if(confirmProjectName == 'yes' || confirmProjectName == 'yeah' || confirmProjectName == 'ya'){
        if(this.cancelProject){
          this.navigateToHome();
        }
        else{
          this.cancelProject = false;
          this.getProjectDescription();
        }
      }
      else if(confirmProjectName == 'no' || confirmProjectName == 'nope' ){
        if(this.cancelProject){
          this.cuiModalService.hide();
          this.onFirstPageComplete();
        }
        else{
          this.onCreateProjectFirstPage();
        }
      }
      else if(confirmProjectName == 'cancel'){
        this.gotoHome();
      }
      else{
        this.voiceRecService.stop();
        setTimeout(() => {
          this.onCreateProjectFirstPage();
        }, 0);
      }
    }, 2000);
  }
  
  async getProjectDescription(){
    // setTimeout(async () => {
      this.textToSpeechService.speak(`Enter project description`);
      setTimeout(async() => {
        setTimeout(() => {
          this.voiceRecService.start();
        }, 0);
        const description =  await this.voiceRecService.getResult();
      this.createProForm.patchValue({projectDescription:description});
      // this.voiceRecService.stop();
      this.selectStatusField();
      }, 3000);
    // }, 0);
  }

  selectStatusField(){
    this.isStatusDropDonwActive = true;
    this.textToSpeechService.speak(`Please select the status`);
    setTimeout(async() => {
      this.voiceRecService.start();
      const statusValue =  await this.voiceRecService.getResult();
      let obj = {value: "", color: ""};
      switch(statusValue){
          case "green": case "new":
            obj.color = "green";
            obj.value = "New";
            break;
          case "orange": case "existing":
            obj.color = "orange";
            obj.value = "Existing";
            break;
          case "red": case "closed":
            obj.color = "red";
            obj.value = "Closed";
            break;
      }
      this.selectedStatusValue = obj.value;
      this.textToSpeechService.speak(`You have selected ${obj.value} status, color - ${obj.color}`);
      this.isStatusDropDonwActive = false; 
      setTimeout(() => {
        this.onFirstPageComplete();
      }, 4000);
    }, 3000);
  }

  async onFirstPageComplete(){
    if(!this.createProjectSecondScreen){
      this.textToSpeechService.speak(`Should I proceed the project creation?`);
      this.selectedTemplateValue = '';
    }else if(this.createProjectSecondScreen && this.selectedTemplateValue !== 'Default'){
      this.choseATemplate();
    }
    this.onFormAction();
  }

  
  speakDescription(){
    const getProDesc = this.createProForm.get('projectDescription').value;
    console.log(getProDesc);
    this.voiceRecService.stop();
    this.textToSpeechService.speak(`${getProDesc}`);
  }

  async onFormAction(){
    if(this.createProjectSecondScreen && this.selectedTemplateValue !== 'Default'){
        this.textToSpeechService.speak(`Please select a template`);
        this.isDropDonwActive =true;
    }
      setTimeout(() => {
        this.voiceRecService.start();
        this.voiceRecService.getResult().then((res)=>{
          console.log(res);
          switch(res){
            case 'yes':{
              if(this.selectedTemplateValue === 'Default'){
                this.postFinalForm();
              }
              this.onSaveNext();
              break;
            }
            case 'default':{
                // debugger
                // if(this.createProjectSecondScreen){
                  this.selectedTemplateValue = 'Default';
                  this.selectedTemplate = 'default';
                  this.isDropDonwActive = false;
                  this.onSelectTemplate();
                  setTimeout(() => {
                    this.choseATemplate();
                  }, 5000);
                  break;
                // }
                // else if(!this.isSubmitDisable && !this.createProjectSecondScreen){
                //   this.onSaveNext();
                //   break;
                // }
              }
              case 'stop' :
                case 'no':{
                this.voiceRecService.stop();
                break;
              }
              case 'cancel':{
                this.gotoHome();
                break;
              }
              case 'back':{
                this.gotoBack();
                break;
              }
              default :{
                this.textToSpeechService.speak(`sorry I am not able to understand you, please try again`);
                setTimeout(() => {
                  this.onFormAction();
                }, 3000);
                break;
              }
            }
          });
      }, 2000);
    }

  async choseATemplate(){
    this.textToSpeechService.speak('Do you want to create a project with default template');
    setTimeout(() => {
      this.onFormAction();
    }, 3000);
  }  


  public demoTemplateSelect(){
    this.isDropDonwActive = !this.isDropDonwActive;
  }
  public demoStatusSelect(){
    this.isStatusDropDonwActive = !this.isStatusDropDonwActive;
  }

  public onDemoTemplateSelect(){
    this.selectedTemplateValue = "Default";
  }

  public onDemoStatusSelect(val){
    this.selectedStatusValue = val;
  }


  showModal(content, large, name: string): void {
    const reusableIconInfoHelperGeneralCompliance = ['Accessibility', 'Revenue Recognition', 'Smart Licensing',
                                                     'Product Security, Privacy and Trust (CSDL)', 'Third Party Software Compliance & Risk Management (TPSCRM)', 'Export Compliance'];
    const reusableIconInfoHelperTechnologyBest = ['API Products', 'Telemetry', 'IPv6', 'Serviceability'];
    const reusableIconInfoHelperAdditionalRequirements = ['Communications Regulatory Compliance', 'Globalization'];

    if (reusableIconInfoHelperGeneralCompliance.includes(name) || reusableIconInfoHelperTechnologyBest.includes(name) || reusableIconInfoHelperAdditionalRequirements.includes(name)) {
      let mainCategory = null;
      if (reusableIconInfoHelperGeneralCompliance.includes(name)) { mainCategory = 'applicableRequirements'; }
      if (reusableIconInfoHelperTechnologyBest.includes(name)) { mainCategory = 'technologyBestPractices'; }
      if (reusableIconInfoHelperAdditionalRequirements.includes(name)) {
        mainCategory = 'additionalRequirements';
      }
      const accInfoHelper = this.dialog.open(InfoHelperNewComponent, {
        autoFocus: false,
        maxHeight: '96vh',
        width: '67vw',
        data: { workflowName: 'projectDashboard', stepName: mainCategory,
          title: name }
      });
      accInfoHelper.afterClosed().subscribe(result => {
      });
    } else {

      this.dataService.getItemDesc(name).subscribe(res => {
        const plainDescriptionItems = ['api products', 'telemetry', 'ipv6',
        'general compliance requirements', 'technology best practices', 'business entity',
        'additional compliance requirements'];
        if (res[0].name === name && !plainDescriptionItems.includes(name.toLocaleLowerCase())) {
          const keys = Object.keys(res[0]);
          this.infoIconDesc = res[0];
          this.applicabilityKey = keys[3];
          this.applicability = res[0].applicability;
          this.applicabilityContent = this.applicability.content;
          this.reachCompliance = res[0].reachCompliance;
          this.reachComplianceText = this.reachCompliance.text;
          this.reachComplianceContent = this.reachCompliance.content;
          this.cuiModalService.show(content, large);
        } else if (plainDescriptionItems.includes(name.toLocaleLowerCase())) {
          this.infoIconDesc = res[0];
          this.cuiModalService.show(content, large);
        }
      },
      err => {
      });
    }
  }

  getTooltipDesc(name: string) {
    let desc;
    if (this.resForInfoIcon.length > 0) {
      for (const iterator of this.resForInfoIcon) {
        if (name.toLowerCase() == iterator.name.toLowerCase()) {
          desc = iterator.description;
          break;
        }
      }
      return desc;
    }
  }
  //   getTooltipDescfromjson(){
  //     this.dataService.getTooltipDesc().subscribe(res=>{
  //       for (const key in res[0]) {
  //         res[0][key].forEach(item => {
  //           if(key == 'generalCompliances')
  //             this.generalCompliancesDesc.push(item.description);
  //           else if(key == 'additionalRequirements')
  //             this.additionalReqDesc.push(item.description);
  //           else if(key == 'technicalBestPractices')
  //             this.technicalItemsDesc.push(item.description);
  //         });
  //       }
  //     })
  // }
  onCAndTCheckboxChange(event, index) {
    this.trackHelpMeSelect = true;
    this.destroryWizardComponent();
    const checked = event.target.checked;
    switch (event.target.id) {
      case 'generalCompliance':
        this.generalCompliances[index].selected = checked;
        break;
      case 'additionalRequirement':
        this.additionalRequirements[index].selected = checked;
        break;
      case 'technicalBestPractice':
        this.technicalBestPractices[index].selected = checked;
        break;
    }
  }

  // get compliance items from node
  getComplianceItems(standardTemplates): void {
    let i = 0; let j = 0; let k = 0;
    for (const key in standardTemplates) {
      standardTemplates[key].forEach((item) => {
        if (key == 'generalCompliances') {
          item.desc = this.generalCompliancesDesc[i];
          i++;
        }
        if (key == 'additionalRequirements') {
          item.desc = this.additionalReqDesc[j];
          j++;
        }
        if (key == 'technicalBestPractices') {
          item.desc = this.technicalItemsDesc[k];
          k++;
        }
      });
      i = 0;
    }

    this.standardTemplate = Object.assign({}, standardTemplates);
    this.generalCompliances = this.standardTemplate.generalCompliances;
    this.additionalRequirements = this.standardTemplate.additionalRequirements;
    this.technicalBestPractices = this.standardTemplate.technicalBestPractices;
    this.apiResponseReady = true;
  }

  // switch to create project form screen
  gotoBack(): void {
    this.selectedScreen.emit('createProject');
    this.createProjectFormScreen = true;
    this.createProjectSecondScreen = false;
    this.onFirstPageComplete();
  }

  // initialize the reactive form fields base on edit or create form
  initialiseForm(): void {
    // Pattern validator: Only allowed Numbers, Characters and (., _, -, spaces)
    const projectName = ['', [Validators.required, Validators.maxLength(200), this.noWhitespaceValidator, Validators.pattern('^[0-9a-zA-Z_\\-\\ ]*$')], this.checkNameExists.bind(this)];
    const projectDescription = ['', [Validators.required, Validators.maxLength(4000), this.noWhitespaceValidator]];
    const productCodeName = ['', [Validators.maxLength(200)]];
    const productVersion = ['', [Validators.maxLength(200)]];

    if (this.createProject) {
      this.createProForm = this.formBuilder.group({
        projectName,
        projectDescription ,
        businessEntity: 'default',
        subBusinessEntity: 'default',
        productTypes: 'default',
        developmentStyles: 'default',
        visibility: true,
        template: 'default',
        productCodeName ,
        existingNewProduct: true,
        productVersion,
        myDate: '',
        owners: '',
        teams: ''
      });

    } else {
      this.showInputFields = false;
      this.iSsubBusinessEntityDisabled = false;
      this.createProForm = this.formBuilder.group({
        projectName,
        projectDescription,
        businessEntity: 'default',
        subBusinessEntity: 'default',
        productTypes: 'default',
        developmentStyles: 'default',
        visibility: true,
        template: 'default',
        productCodeName,
        existingNewProduct: true,
        productVersion,
        myDate: '',
        owners: '',
        teams: ''
      });
    }

  }

  // go to list all project / home scrren
  gotoHome(): void {
    const name = this.createProForm.value.projectName;
    const description = this.createProForm.value.projectDescription;
    if (this.createProject) {
      if (name.length >= 1 || description.length >= 1) {
        this.cuiModalService.show(this.formDataLostTemplate, 'normal');
        this.textToSpeechService.speak(`Do you want to Cancel a Project ?`);
        this.cancelProject = true;
        this.onProjectNamePersist();
        return;
      }
    }
    this.router.navigate(['/home']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
    this.cuiModalService.hide();
  }

  get getTodayDate() {
    const todayDate = new Date();
    return todayDate;
  }

  // getter to get todays system date
  setDate(mDate: any): string {

    let dd: any = mDate.date;
    let mm: any = mDate.month + 1;
    const yyyy: any = mDate.year;


    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    return `${yyyy}-${mm}-${dd}`;
  }

  checkUserIsProjectOwner() {
    if (!this.createProject) {
      this.createProForm.disable();
      this.loggedInUserCecId = this.userDetailsService.currentUserValue;
      this.ownersArray.forEach((el) => {
        if (el.cecId === this.loggedInUserCecId.cecId) {
          if (this.loggedInUserCecId.role === 'PM') {
            this.isProjectOwner = true;
            this.createProForm.enable();
          }
        }
      });
    }
  }

  // click event for edit / create new project
  onSaveNext(): void {
    if (this.saveNextButton.toLocaleLowerCase() === 'next') {
      this.goToNext();
    } else if (this.saveNextButton.toLocaleLowerCase() === 'save') {
      // this.prepareUpdateData();
      this.updateProject(this.prepareUpdateData(), this.projectId);
    }
  }

  // getter for next / save button on create new project screen
  get isSubmitDisable(): boolean {
    if (this.saveNextButton.toLowerCase() == 'save') {
      if (!this.createProForm.valid) {
        return true;
      } return false;
    } else if (!this.createProForm.valid) {
      return true;
    }
    return false;
  }

  // go to next screen if form is valid and input max length is fulfilled
  goToNext(): void {
    if (this.createProForm.valid) {
      // this.getComplianceItems();
      this.createProjectFormScreen = false;
      this.createProjectSecondScreen = true;
      this.selectedScreen.emit('compliance');
      
      setTimeout(() => {
        this.onFormAction();
      }, 3000);
    }
  }

  // preparing Project data to update
  prepareUpdateData() {

    const formData = this.createProForm.getRawValue();


    const selectedBE = this.businessEntity.filter(e => e._id == this.selectedBusinessEntity);

    if (selectedBE.length > 0) {
      this.finalBusinessEntity = {
        refId: selectedBE[0]._id,
        businessEntity: selectedBE[0].businessEntity,
        subBusinessEntity: [this.selectedSubBusinessEntity]
      };
    }
    this.onSelectProductType();
    this.onSelectDevelopmentStyle();
    this.onSelectTemplate();
    const updateData = {
      owners: this.ownersArray,
      teams: this.teamsArray,
      productTypes: [this.productTypesFinal],
      styles: [this.finalDevelopmentStyle],
      templates: [this.finalTemplate],
      businessEntity: this.finalBusinessEntity,
      name: formData.projectName.trim(),
      desc: formData.projectDescription,
      visiblity: formData.visibility,
      codeName: formData.productCodeName,
      existing: formData.existingNewProduct,
      productVersion: formData.productVersion,
      fcsDate: formData.myDate != null && formData.myDate._i != undefined ? this.setDate(formData.myDate._i) : formData.myDate
    };
    return updateData;
    // this.updateProject(updateData, this.projectId);
    // this.matomoTracker.trackEvent('HomePage','ProjectUpdate',`projectName = ${formData.projectName}`);
  }

  // check users input is valid base on input
  getIsForFormInputValid(inputName: string): boolean {
    if (!this.createProForm.get(inputName).valid &&
      this.createProForm.get(inputName).touched ||
      !this.createProForm.get(inputName).valid
      && this.createProForm.get(inputName).dirty) {
      return true;
    } else if (this.createProForm.get(inputName).valid) {
      return false;
    }
    return false;
  }

  getNgClass(inputName: string): boolean {
    return this.createProForm.get(inputName).invalid && this.createProForm.get(inputName).touched ? true : false;
  }

  // Async reactive form custom validation to get check unique project name
  checkNameExists(control: FormControl): Promise<any> | Observable<any> {

    clearTimeout(this.projectNameTimeout);
    // excuse project name validation while updating for current project name
    if (this.projectId && this.nameFromServer == control.value.trim()) {
      return new Promise<any>((resolve, reject) => {
        resolve(null);
      });
    }
    const promise = new Promise<any>((resolve, reject) => {
      if (control.value == this.projectNameExistsLastValue) {
        resolve(null);
      } else {
        this.projectNameTimeout = setTimeout(() => {
          this.dataService.projectNameExists(control.value.trim()).
            subscribe(res => {
              if (res) {
                resolve({ projectNameExists: true });
              } else {
                resolve(null);
                this.projectNameExistsLastValue = control.value;
              }
            });
        }, 500);
      }
    });
    return promise;
  }

  // on change event
  onChangeExistingProduct(): void {
    if (this.createProForm.value.existingNewProduct == true) {
      this.existingProduct = false;
      this.createProForm.patchValue({
        productVersion: ''
      });
    } else {
      this.existingProduct = true;
    }
  }

  // On change of business entity
  onSelectBusinessEntity(): void {
    // Fetching sub-business Entity

    this.subBusinessEntity = [];
    this.selectedSubBusinessEntity = '';

    if (this.selectedBusinessEntity && this.selectedBusinessEntity.length > 0 && this.selectedBusinessEntity.toLocaleLowerCase() != 'default') {
      this.dataService.getSubBusinessEntity(this.selectedBusinessEntity).subscribe(data => {
        this.iSsubBusinessEntityDisabled = false;
        if (data != null) {
          this.subBusinessEntity = data.subBusinessEntity;
          this.subBusinessEntity = this.subBusinessEntity.map(item => {
          const container: any = {};
          container.value = item;
          container.name = item;
          return container;
        });
        }
      });
    }

  }

  // On change of sub-business entity
  onSelectSubBusinessEntity(): void {
   const selectedBE = this.businessEntity.filter(e => e._id == this.selectedBusinessEntity);
   this.finalBusinessEntity = {
      refId: selectedBE[0]._id,
      businessEntity: selectedBE[0].businessEntity,
      subBusinessEntity: [this.selectedSubBusinessEntity]
    };

  }

  // On change of product type
  onSelectProductType(): void {

    if (this.selectedProductType) {
      this.productTypesFinal = this.getObjJSON(this.selectedProductType, this.productTypes, 'productType');

    }
  }

  // get dropdown item name using id
  getObjJSON(id: any, name: any, objName: any): any {
    if (id !== 'default') {
      let selected;
      selected = name.filter(element => {
        if (element._id === id) {
          return true;
        }
      });
      const finalObj = {
        refId: selected[0]._id,
        [objName]: selected[0].name
      };
      return finalObj;
    }
  }

  // On change of development style
  onSelectDevelopmentStyle(): void {

    if (this.selectedDevelopmentStyle) {
      this.finalDevelopmentStyle = this.getObjJSON(this.selectedDevelopmentStyle, this.developmentStyles, 'styleName');
    }
  }

  // On change of template
  onSelectTemplate(): void {
    this.trackHelpMeSelect = true;
    this.destroryWizardComponent();
    this.selectedTemplate == 'default' ? this.displayStandard = true : this.displayStandard = false;
    this.submitFormButtonDisabled = false;
    let finalTemplate;

    if (this.selectedTemplate) {
      this.componentTempData = { gc: {}, ar: {}, mapQuestionsLogicData: [] };
      finalTemplate = this.getObjJSON(this.selectedTemplate, this.templates, 'name');

      let elementMatched = false;
      this.templates.forEach(element => {
        if (this.selectedTemplate == element._id) {

          elementMatched = true;
          if (element.generalCompliances.length > 0) {
              element.generalCompliances.forEach(item => {
                this.generalCompliances.forEach(gItem => {
                  if (gItem.name == item.name) {
                    gItem.selected = item.selected;
                    gItem.applicability = item.selected;
                  }
                });
              });
          } else {
            this.standardTemplate.generalCompliances.forEach(element => {
              element.selected = false;
            });
          }

          if (element.additionalRequirements.length > 0) {
            element.additionalRequirements.forEach(item => {
              this.additionalRequirements.forEach(gItem => {
                if (gItem.name == item.name) {
                  gItem.selected = item.selected;
                  gItem.applicability = item.selected;
                }
              });
            });
          } else {
            this.standardTemplate.additionalRequirements.forEach(element => {
              element.selected = false;
            });
            this.additionalRequirements = this.standardTemplate.additionalRequirements;

          }

          if (element.technicalBestPractices.length > 0) {
            element.technicalBestPractices.forEach(item => {
              this.technicalBestPractices.forEach(gItem => {
                if (gItem.name == item.name) {
                  gItem.selected = item.selected;
                  gItem.applicability = item.selected;
                }
              });
            });

          } else {
            this.standardTemplate.technicalBestPractices.forEach(element => {
              element.selected = false;
            });
            this.technicalBestPractices = this.standardTemplate.technicalBestPractices;
          }
        } else {
          if (!elementMatched) {
            this.getComplianceItems(this.standardTemplate);
          }
        }
      });
    }
    this.finalTemplate = finalTemplate;
    if (this.child && this.saveNextButton.toLocaleLowerCase() === 'next') {
     // this.child.onCancel(false);
    }
  }

  updateItemsFromWizard(event) {
    this.generalCompliances = event.gc;
    this.additionalRequirements = event.ar;
  }


  // fetch all dropdown items form node
  fetchDropDownData(): void {
    // Business Entity
    this.businessEntitySubscription = this.dataService.getBusinessEntity().subscribe(data => {
      this.businessEntity = data;
    });

    // Product Types
    this.productTypesSubscription = this.dataService.getProductTypes().subscribe(data => {
      this.productTypes = data;
    });

    // Development Styles
    this.developmentStylesSubscription = this.dataService.getDevelopmentStyles().subscribe(data => {
      this.developmentStyles = data;
    });
    // Templates
    this.templatesSubscription = this.dataService.getTemplates().subscribe(data => {
      this.templates = data;

    });

  }

  // event from add remove member component to patch owners array
  onAddRemoveOwner($event) {
    this.ownersArray = $event;
  }

  // event from add remove member component to patch teams array
  onAddRemoveTeam($event) {
    this.teamsArray = $event;
  }

  // fetch project details using project id for edit project screen
  fetchProjectDetails(id: string) {
    this.dataService.getProjectDetails(id).subscribe((res) => {
      this.showInputFields = true;

      const resDate = res.fcsDate != null ? res.fcsDate.substring(0, 10) : '';
      const resBusinessEntityRefId = (res.businessEntity != null) ? (res.businessEntity.refId != null) ? res.businessEntity.refId : '' : '';
      const resCodeName = res.codeName ? res.codeName : '';
      const resProductVersion = res.productVersion != null ? res.productVersion : '';
      const resVisibility = res.visiblity != null ? res.visiblity : true;
      const resExistingProduct = res.existing != null ? res.existing : true;
      const resProductTypes = res.productTypes[0] != null ? res.productTypes[0].refId : '';
      const resDevelopmentStyles = res.styles[0] != null ? res.styles[0].refId : '';
      const resSubBusinessEntity = (res.businessEntity != null) ? res.businessEntity.subBusinessEntity[0] != null ? res.businessEntity.subBusinessEntity[0] : '' : '';
      const resTemplate = res.templates[0] != null ? res.templates[0].refId : '';

      this.ownersArray = res.owners.length >= 1 && res.owners != null ? res.owners : [];
      this.teamsArray = res.teams.length >= 1 && res.teams != null ? res.teams : [];

      const complianceArray = res.complianceItems.length >= 1 && res.complianceItems != null ? res.complianceItems : [];
      complianceArray.forEach(compliance => {
        compliance.owners.forEach(owner => {
          const found = this.ownersAcceptorsArray.some(el => el.id === owner.id);
          if (!found) { this.ownersAcceptorsArray.push(owner); }
        });
        compliance.acceptors.forEach(acceptor => {
          const found = this.ownersAcceptorsArray.some(el => el.id === acceptor.id);
          if (!found) { this.ownersAcceptorsArray.push(acceptor); }
        });
      });
      const techStdArray = res.technicalStandardItems.length >= 1 && res.technicalStandardItems != null ? res.technicalStandardItems : [];
      techStdArray.forEach(compliance => {
        compliance.owners.forEach(owner => {
          const found = this.ownersAcceptorsArray.some(el => el.id === owner.id);
          if (!found) { this.ownersAcceptorsArray.push(owner); }
        });
        compliance.acceptors.forEach(acceptor => {
          const found = this.ownersAcceptorsArray.some(el => el.id === acceptor.id);
          if (!found) { this.ownersAcceptorsArray.push(acceptor); }
        });
      });
      this.getProName.emit(res.name);
      this.createProForm.patchValue({
        projectName: res.name,
        projectDescription: res.desc,
        myDate: resDate,
        businessEntity: resBusinessEntityRefId,
        productCodeName: resCodeName,
        existingNewProduct: resExistingProduct,
        productVersion: resProductVersion,
        visibility: resVisibility,
        productTypes: resProductTypes,
        developmentStyles: resDevelopmentStyles,
        subBusinessEntity: resSubBusinessEntity,
        template: resTemplate,
      });
      this.nameFromServer = res.name;
      //
      this.selectedBusinessEntity = resBusinessEntityRefId;
      this.selectedTemplate = resTemplate;
      this.selectedSubBusinessEntity = resSubBusinessEntity;
      this.selectedProductType = resProductTypes;
      this.selectedDevelopmentStyle = resDevelopmentStyles;
      this.existingProduct = !resExistingProduct;

      if (this.selectedBusinessEntity.length > 0 && this.selectedBusinessEntity.toLocaleLowerCase() != 'default') {
        this.dataService.getSubBusinessEntity(this.selectedBusinessEntity).subscribe(data => {
          this.subBusinessEntity = data.subBusinessEntity;
          this.subBusinessEntity = this.subBusinessEntity.map(item => {
            const container: any = {};
            container.value = item;
            container.name = item;
            return container;
          });

        });
      }
      this.checkUserIsProjectOwner();
    });

  }


  // creating the final object to post the form to node
  postFinalForm(): void {
    this.isCreatingProject = true;
    const formData = this.createProForm.value;
    const finalcomplianceItems = [];
    const finaladditionalRequirements = [];
    const finalTechnicalBestPractices = [];

    this.generalCompliances.forEach(element => {
      const complianceObj = {
        descRefId: element.refId ? element.refId : element._id,
        name: element.name,
        owners: [],
        acceptors: [],
        applicability: element.applicability,
        selected: element.selected,
        progressStatus: 'Not Started',
        progressScore: 0,
        comments: [],
        betaFlag: element.betaFlag
      };
      finalcomplianceItems.push(complianceObj);
    });

    this.additionalRequirements.forEach(element => {
      const additionalRequirementsObj = {
        descRefId: element.refId ? element.refId : element._id,
        name: element.name,
        owners: [],
        acceptors: [],
        applicability: element.applicability,
        selected: element.selected,
        progressStatus: 'Not Started',
        progressScore: 0,
        comments: [],
        betaFlag: element.betaFlag
      };
      finaladditionalRequirements.push(additionalRequirementsObj);
    });

    this.technicalBestPractices.forEach(element => {
      const technicalBestPracticesObj = {
        descRefId: element.refId ? element.refId : element._id,
        name: element.name,
        owners: [],
        acceptors: [],
        applicability: false, //  for  technicalBestPractices the applicability will always false
        selected: element.selected,
        progressStatus: 'Not Started',
        progressScore: 0,
        comments: [],
        betaFlag: element.betaFlag
      };
      finalTechnicalBestPractices.push(technicalBestPracticesObj);
    });
    if (this.createProForm.get('businessEntity').value != 'default') {
      this.finalBusinessEntity = {
        refId: this.selectedBusinessEntityObj[0]._id,
        businessEntity: this.selectedBusinessEntityObj[0].businessEntity,
        subBusinessEntity: [formData.subBusinessEntity]
      };
    }

    const finalObj = {
      owners: this.ownersArray,
      teams: this.teamsArray,
      productTypes: [this.productTypesFinal],
      styles: [this.finalDevelopmentStyle],
      templates: [this.finalTemplate],
      businessEntity: this.finalBusinessEntity,
      complianceItems: finalcomplianceItems,
      additionalRequirements: finaladditionalRequirements,
      name: formData.projectName.trim(),
      desc: formData.projectDescription,
      stream: null,
      createdDate: formData.myDate,
      visiblity: formData.visibility,
      codeName: formData.productCodeName,
      existing: formData.existingNewProduct,
      productVersion: formData.productVersion,
      fcsDate: formData.myDate._i != undefined ? this.setDate(formData.myDate._i) : formData.myDate,
      technicalStandardItems: finalTechnicalBestPractices
    };
    /*
    if(finalObj.complianceItems.length>0){
      finalObj.complianceItems.forEach(element => {
        element.applicability = false;
        if(element.selected == true){
          element.applicability = true;
        }
      });
    };

    if(finalObj.additionalRequirements.length>0){
      finalObj.additionalRequirements.forEach(element => {
        element.applicability = false;
        if(element.selected == true){
          element.applicability = true;
        }
      });
    };

    if(finalObj.technicalStandardItems.length>0){
      finalObj.technicalStandardItems.forEach(element => {
        element.applicability = false;
        if(element.selected == true){
          element.applicability = true;
        }
      });
    };
    */

    this.onSubmitForm(finalObj);
    this.matomoTracker.trackEvent('ProjectCreatePage','ProjectCreate',`projectName = ${finalObj.name}`);
  }

  // method to submit the final object to node
  onSubmitForm(newProject: any): void {
    this.apiResponseReady = false;
    this.textToSpeechService.speak(`Creating a project ${this.createProForm.get('projectName').value}`)
    this.dataService.createNewProject(newProject).subscribe((res) => {
      this.apiResponseReady = true;
      this.toastService.show('New project has been created',  newProject.name, 'success');
      this.router.navigate(['/home']);
      this.isCreatingProject = false;
      this.textToSpeechService.speak(`Project has been created successfully`)
    }, (err) => {
      this.apiResponseReady = true;
      this.toastService.show('Project Creation Failed',  newProject.name, 'danger');
      this.router.navigate(['']);
      this.isCreatingProject = false;
    });
  }

  // finally update the project data by calling service & show toast notification
  updateProject(projecData: any, projectId: string): void {
    this.apiResponseReady = false;
    this.dataService.updateProject(projecData, projectId).subscribe((res) => {
      this.apiResponseReady = true;
      this.toastService.show('Project has been updated',  projecData.name,  'success' );
      this.matomoTracker.trackEvent('HomePage','ProjectUpdate',`projectName = ${projecData.name}`);
      this.router.navigate(['/home']);
    }, (err) => {
      this.apiResponseReady = true;
      this.toastService.show('Updating project failed',  projecData.name, 'danger');
      this.router.navigate(['']);
    });
  }

  onHelpMeSelect() {
    // this.selectedScreen.emit('wizardShow');
    // if(this.trackHelpMeSelect){
    //   this.child.getStandatdTemplate(false);
    //   this.child.getQuestionsFromNode();
    // }
    // this.cuiModalService.showComponent(this.applicabilityHelperComponentPopup,{name:'anruag'},'full')
    // this.createProjectFormScreen = false;
    // this.createProjectSecondScreen = false;
    // this.applicabilityHelper = true;
    // this.trackHelpMeSelect = false;
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ApplicabilityHelperComponent, {
      width: '75vw', height: 'auto',
      data: this.componentTempData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateItemsFromWizard(this.componentTempData);
      }
    });
  }

  onWizardScreenUpdate(event) {
    if (event === 'goToComplianceScreen' || event === 'destroyWizardComponent') {
      if (event === 'destroyWizardComponent') {
        this.trackHelpMeSelect = true;
        this.destroryWizardComponent();
      }
      this.applicabilityHelper = false;
    }
  }

  destroryWizardComponent() {
    this.initializeWizardComponent = false;
    setTimeout(() => {
      this.initializeWizardComponent = true;
    }, 0);
  }


  ngOnDestroy() {
    // unsubscribing the rxjs observable to stop memory leak
    this.businessEntitySubscription.unsubscribe();
    this.productTypesSubscription.unsubscribe();
    this.developmentStylesSubscription.unsubscribe();
    this.templatesSubscription.unsubscribe();
    // *****************************************************/
    if (this.autoSave) {
      this.autoSave.unsubscribe();
    }
  }


  public noWhitespaceValidator(control: FormControl) {

    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
  getShortName(member) {
    const name =  member.name;
    if (member.name.length > 2 && !member.members) {
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ')[1];
      const lastNameShort = lastName.split('')[0];
      return `${firstName} ${lastNameShort}`;
    } else {
      return member.name;
    }
  }

  autoSaveOnTimeInterval() {
    if (!this.isSubmitDisable) { //flag based on save button
        const projecData = this.prepareUpdateData();
        this.dataService.updateProject(projecData, this.projectId).subscribe(res => {
          this.toastService.show('Project has been auto updated',  projecData.name,  'success' );
        }, err => {
          this.toastService.show('Project auto update failed',  projecData.name, 'danger');
        });
    } else {
      console.log('form invalid, Cannot autoSave form ');
    }
  }
  
  get getShowMore(): string {
    if (this.ownersAcceptorsArray.length >= 2) {
      return `${this.ownersAcceptorsArray.length - 2} More`;
    } else {
      return null;
    }
  }

  showOwnerListModal(contentUsers, normal): void {
   // this.searchMember.reset();
    this.cuiModalService.show(contentUsers, normal);
}

hideModal(): void {
    this.cuiModalService.hide();
  //  this.clearErrorMessage();
  }
  
}
