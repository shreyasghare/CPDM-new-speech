import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { CommunicationsRegulatoryModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { Role } from '@cpdm-model/role';
import { UtilsService } from '@cpdm-service/shared/utils.service';
import { ConfirmationDialogComponent } from '@cpdm-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenericErrorComponent } from '@cpdm-shared/components/generic-error/generic-error.component';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { SpinnerService } from '@cpdm-service/shared/spinner.service';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavigationTabsComponent } from '@cpdm-shared/components/navigation-tabs/navigation-tabs.component';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-crc-implement-pm',
  templateUrl: './crc-implement-pm.component.html',
  styleUrls: ['./crc-implement-pm.component.scss']
})
export class CrcImplementPmComponent implements OnInit {

  role = Role;

  commRegId = '';
  selectedImplMethod = 'pushToRepo';
  isManualTaskComplete = false;
  enableAdditionalFields = true;
  infoIconData = [];

  slImplementation_status: { icon: string; status: string } = {
      icon: 'chevron',
      status: 'Implementation is not applicable'
  };
  implementationStatus: string = 'ppp';
  confirmationDialogRef: any;
  communicationsRegulatoryDetails: CommunicationsRegulatoryModel;

  templates: Array<{ name: string, value: string }> = [
      { name: 'Rally Template', value: 'Rally' },
      { name: 'Jira Template', value: 'Jira' },
      { name: 'PRD Template', value: 'PRD' }
  ];
  repositories: Array<{ name: string, value: string }> = [
      { name: 'Rally', value: 'Rally' },
      { name: 'Jira', value: 'Jira' }
  ];

  populateBacklogStatus: { isPopulating: boolean, isBacklogPopulated: boolean } = {
      isPopulating: false,
      isBacklogPopulated: false
  };
  disableImplementationMethod: { manual: boolean, pushToRepo: boolean } = {
      manual: false,
      pushToRepo: false
  };
  confirmationObj: { confirmationText: string } = {
      confirmationText: 'Are you sure you want to complete implementation task?'
  };

  customTab = [
    { tabNumber: 1, tabName: 'Push to repository', active: true, isEnabled: true },
    { tabNumber: 2, tabName: 'Send implementation details', active: false, isEnabled: false }
  ];
  disableNextBtn:boolean = true;
  isNextBtn: boolean= true;
  populateDetails: boolean = true;
  sendImplDetails: boolean;
  implementationDetailsForm: FormGroup;
  workspacePath: string;
  implReportPopulating: boolean;
  requirementsImplementedDetails: string;
  defectsFixedDetails: string;

  modifiedCommRegObj;

  poComments: string;
  commentedBy: string;
  commentedOn: string;

  naHoldingMsg = {
    statusIcon: 'notApplicable',
    status: 'Communication Regulatory Compliance is \'Not applicable\'',
    message: 'The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy is ‘Not Applicable’ for this project. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.'
  };

  openSecondTab: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  sendBtnText: string
  @ViewChild(NavigationTabsComponent, { static: false }) tabs: NavigationTabsComponent;

  constructor(private activatedRoute: ActivatedRoute,
    private commRegService: CommunicationsRegulatoryService,
    private utilsService: UtilsService,
    private spinnerService: SpinnerService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private formBuilder: FormBuilder,) { }

    ngOnInit() {
        this.spinnerService.show();
        this.commRegId = this.activatedRoute.snapshot.parent.params.id;
        this.getCommRegDetails();
        this.implementationDetailsForm = this.formBuilder.group({
            features: [''],
            defects: ['']
        });        
    }    
    /**
     * Get tooltip data
     */
    getTooltipDesc(name: string) {
        let desc: string;
        if (this.infoIconData.length > 0) {
            for (const iterator of this.infoIconData) {
                if (name.toLowerCase() === iterator.name.toLowerCase()) {
                    desc = iterator.description;
                    break;
                }
            }
            return desc;
        }
    }

    /**
     * Get smart licensing details
     */
    private getCommRegDetails() {
        this.commRegService.getCrcData(this.commRegId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: { success: boolean, data: CommunicationsRegulatoryModel }) => {
            const { success, data } = res;
            if (success) {
                this.communicationsRegulatoryDetails = data;
                if(!getNestedKeyValue(data, 'crcAssessmentQuestionnaire', 'isApplicable') || getNestedKeyValue(data, 'crcAssessmentQuestionnaire', 'isApplicable') === undefined){
                    this.implementationStatus =  'notRequired' ;
                }else{
                    this.implementationStatus = getNestedKeyValue(data,'implement', 'implementStatus'); 
                    this.sendBtnText = this.implementationStatus === 'rejected'? 'Resend':'Send';
                    let implimentReportObj = getNestedKeyValue(data,'implement', 'report');
                    this.requirementsImplementedDetails = getNestedKeyValue(implimentReportObj, "requirementImplemented");
                    this.defectsFixedDetails = getNestedKeyValue(implimentReportObj, "defectFixed");
                    this.poComments = getNestedKeyValue(implimentReportObj, "poComments");
                    this.arrangeCommRegObj(data) 
                    if(getNestedKeyValue(data, 'implement', 'implementStatus') === 'rejected' && !implimentReportObj.moveToIdentify){                        
                        this.loadManualImplementationFormData();
                        this.checkAndDisableImplementationMethod();
                        this.populateBacklogStatus.isBacklogPopulated = true;
                        this.openSecondTab = true;
                    }                             
                }   
                this.spinnerService.hide();             
            }
        });

    }


    arrangeCommRegObj(commRegObj: CommunicationsRegulatoryModel){
        this.modifiedCommRegObj = commRegObj;  
        let implimentReportObj = getNestedKeyValue(commRegObj,'implement', 'report');      
        if (getNestedKeyValue(commRegObj, 'implement', 'backlogDetails') && !implimentReportObj.moveToIdentify){
            const backlogDetails = getNestedKeyValue(commRegObj, 'implement', 'backlogDetails');
            this.modifiedCommRegObj['implementation'] = { 'repository': getNestedKeyValue(commRegObj, 'implement', 'backlogDetails')} 
            this.workspacePath = backlogDetails.workspacePath; 
        }
    }

    /**
     * Load data into push to repo step
     */
     loadPushToRepoFormData() {
        if (this.communicationsRegulatoryDetails.implement && !this.communicationsRegulatoryDetails.implement.isManualImplement
            && this.communicationsRegulatoryDetails.implement.backlogDetails) {
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = true;
        }
    }

    /**
     * Load data in manual implementation step
     */
    loadManualImplementationFormData() {
        if (this.communicationsRegulatoryDetails.implement && this.communicationsRegulatoryDetails.implement.isManualImplement) {
            this.isManualTaskComplete = true;
            this.selectedImplMethod = 'manual';
            if (!this.communicationsRegulatoryDetails.implement.isManualImplement) {
                this.selectedImplMethod = 'pushToRepo';
            }
        }
    }

    /**
     * On step completion, disables implementation method which is not completed
     */
     private checkAndDisableImplementationMethod() {
        // if (this.communicationsRegulatoryDetails.workflow && this.communicationsRegulatoryDetails.workflow.active === 'implement') {
            if (this.communicationsRegulatoryDetails.implement &&
                this.communicationsRegulatoryDetails.implement.isManualImplement) {
                // Disables pushToRepo method
                this.disableImplementationMethod.pushToRepo = true;
                this.disableNextBtn = false;
            } else if (this.communicationsRegulatoryDetails.implement &&
                !this.communicationsRegulatoryDetails.implement.isManualImplement &&
                this.communicationsRegulatoryDetails.implement.backlogDetails) {
                // Disables manual method
                this.disableImplementationMethod.manual = true;
                this.disableNextBtn = false;
            }
        // }
    }

    /**
     * Downloads Smart Licensing template CSV file
     */
    async onDownloadTemplate(event: { selectedTemplate: string, selectedLanguage: string }) {
        try {
            this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}crc/${this.communicationsRegulatoryDetails._id}`, `${event.selectedTemplate}SLImportTemplate.csv`);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Once PM finishes with manual process
     */
    onCompleteManualImplTask(event: { target: { checked: boolean } }) {
        this.isManualTaskComplete = event.target.checked;
        if (this.selectedImplMethod === 'manual' && this.isManualTaskComplete) {
            this.confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent,
                { data: this.confirmationObj, width: '35vw', height: 'auto', disableClose: true });
            this.confirmationDialogRef.componentInstance.onConfirmAction.subscribe(() => {                
                this.commRegService.completeManualSetp( {crcId: this.commRegId})
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => {
                    if (res.data) {
                        this.communicationsRegulatoryDetails = res.data;
                        this.loadManualImplementationFormData();
                        this.checkAndDisableImplementationMethod();
                        this.disableNextBtn = false;
                        this.updateRecComments();
                    }
                    this.confirmationDialogRef.close(res);
                }, err => {
                    console.log(err);
                });
            });

            this.confirmationDialogRef.afterClosed().subscribe((result: { success: boolean }) => {
                const { success } = result;
                if (success) {
                    this.isManualTaskComplete = true;
                } else {
                    this.isManualTaskComplete = false;
                }
            });
        }
    }

    /**
     * Populate backlog for Jira & Rally
     * @param event 'event';
     */
    populateBacklog(event) {
        this.populateBacklogStatus.isPopulating = true;
        this.populateBacklogStatus.isBacklogPopulated = false;
        this.workspacePath = event.workspacePath;
        
        let featureObj;
        if (event.selectedRepo.toLocaleLowerCase() === 'rally') {
            featureObj = {
                selectedRepo: event.selectedRepo.toLowerCase(),
                userId: event.userId,
                rallyProjectId: event.rallyProjectId,
                _id: event._id,
                selectedWS: event.selectedWS,
                workspaceId: event.workspaceId,
                projectId: event.projectId,
                workspacePath: event.workspacePath,
                communicationsRegulatoryId: this.communicationsRegulatoryDetails.crcRecommendationsId
            };
        } else if (event.selectedRepo.toLocaleLowerCase() === 'jira') {
            featureObj = {
                selectedRepo: event.selectedRepo.toLowerCase(),
                userId: event.userId,
                jiraProjectId: event.projectId,
                _id: event._id,
                jiraProjectKey: event.jiraProjectKey,
                jiraIssueTypeName: event.jiraIssueTypeName,
                jiraUrl: event.jiraUrl,
                projectId: event.projectId,
                workspacePath: event.workspacePath,
                communicationsRegulatoryId: this.communicationsRegulatoryDetails.crcRecommendationsId
            };
        }
        this.commRegService.populateBacklog(featureObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: { data: CommunicationsRegulatoryModel }) => {
            this.communicationsRegulatoryDetails = res.data;
            this.arrangeCommRegObj(res.data);                
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = true;
            // this.disableImplementationMethod.manual = true;
            this.loadManualImplementationFormData();
            this.checkAndDisableImplementationMethod();
            this.updateRecComments();
            this.disableNextBtn = false;
        }, err => {
            this.dialog.open(GenericErrorComponent, {
                data: {
                    errorMsg: `Feature in ${event.selectedRepo === 'rally' ? 'RALLY' : 'JIRA'}`
                },
                width: '35vw', height: 'auto', disableClose: true
            });
            this.populateBacklogStatus.isPopulating = false;
            this.populateBacklogStatus.isBacklogPopulated = false;
            this.disableNextBtn = true
        });
    }

    /**
     * @description Get recommendations data from subject and update
     */
    private updateRecComments() {
        this.commRegService.getRecommendationDataSub
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
            if (res && res.isNewRecommendationsAvailable) {
                res.recommendations.forEach(element => {
                    delete element.isNewRecommendation;
                });
                res.isNewRecommendationsAvailable = false;
                let reqObj;
                reqObj = {
                    recommendations: res.recommendations,
                    isNewRecommendationsAvailable: res.isNewRecommendationsAvailable
                };

                this.commRegService.saveRecommendations(this.commRegId, reqObj)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.commRegService.updateRecommendationDataWithSubject(res);
                }, () => {
                    this.toastService.show('Error in saving', 'Error in saving CRC recommendations', 'danger');
                });
            }
        });
    }

    onTabChanged(event){    
        if(this.openSecondTab){
            let implementReportObj = getNestedKeyValue(this.communicationsRegulatoryDetails,'implement', 'report');
            if(!implementReportObj.moveToIdentify){
                this.customTab[0].active = false;
                this.customTab[0].isEnabled = true;

                this.customTab[1].active = true;
                this.customTab[1].isEnabled = true;
                event = {
                    currentTab: "Send implementation details",
                    currentTabNumber: 2,
                    disableNextBtn: true,
                    disablePreviousBtn: false,
                    previousTabName: "Push to repository"
                }
            }
            this.openSecondTab = false;
        }

        for (const tab of this.customTab) {
          if (event.currentTabNumber === 1 && this.customTab[1].isEnabled) {
                this.isNextBtn = true;
            break;
          } else if (event.currentTabNumber === this.customTab.length) {
            this.isNextBtn = false;
            break;
          }
        }
    
        for (const tab of this.customTab) {
          if (tab.active && tab.isEnabled) {
            this.switchScreen(tab.tabNumber);
            break;
          }
        }
    }

    switchScreen(tabNumber: number) {
        switch (tabNumber) {
          case 1:
            this.populateDetails = true;
            this.sendImplDetails = false;
            break;
          case 2:
            // this.workspacePath = this.communicationsRegulatoryDetails.implement.report.
            this.populateDetails = false;
            this.sendImplDetails = true;
            break;
        }
    }

    updateImplStatus() {
        this.implReportPopulating = true;
        let implObj = {
          crcId: this.communicationsRegulatoryDetails._id,
          projectId: this.communicationsRegulatoryDetails.projectId,
          emailTemplate: getNestedKeyValue(this.communicationsRegulatoryDetails, 'implement', 'implementStatus') === 'rejected' ? 'UpdatedImplementationReport' : 'SendImplementationReport',
          implement:{
            implementStatus: "submit",
              report:{
              requirementImplemented: this.implementationDetailsForm.value.features,
              defectFixed: this.implementationDetailsForm.value.defects,
              updatedOn: new Date()
            }
          }
        };
        
        this.commRegService.sendImplReport(implObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: { data: CommunicationsRegulatoryModel }) => {
            this.communicationsRegulatoryDetails = res.data;
            this.implReportPopulating = false;
            this.implementationStatus = getNestedKeyValue(this.communicationsRegulatoryDetails,'implement', 'implementStatus');
            let implimentReportObj = getNestedKeyValue(this.communicationsRegulatoryDetails,'implement', 'report');
            this.requirementsImplementedDetails = getNestedKeyValue(implimentReportObj, "requirementImplemented");
            this.defectsFixedDetails = getNestedKeyValue(implimentReportObj, "defectFixed");
        }, err => {
          this.toastService.show('Error', 'Error submitting Implementation Report', 'danger');
          this.implReportPopulating = true;
        })
    };

    sendToPO(){
        this.isNextBtn = false;
        this.customTab[1].isEnabled = true;
        this.tabs.nextTab();        
        this.populateDetails = false;
        this.sendImplDetails = true;
        this.disableNextBtn = true;
    };

    previousTab(){
        this.tabs.previousTab();
        this.disableNextBtn = false;
        this.isNextBtn = true;
    }

    onViewBacklog() {
        let parentUrl: string;
        if (this.communicationsRegulatoryDetails.implement && this.communicationsRegulatoryDetails.implement.backlogDetails) {
          const backlogDetails = getNestedKeyValue(this.communicationsRegulatoryDetails, "implement", "backlogDetails")
            if (backlogDetails.source === 'rally') {
                parentUrl = `https://rally1.rallydev.com/#/${backlogDetails.rallyProjectId}ud/portfolioitemstreegrid?detail=/portfolioitem/feature/${backlogDetails.rallyParentId}`;
            } else if (backlogDetails.source === 'jira') {
                parentUrl = `${backlogDetails.jiraServer}/browse/${backlogDetails.jiraParent}`;
            }
            const w = window.open(`${parentUrl}`, '_blank');
            w.opener = null;
            w.focus();
        }
    }


    /**
   * @description Cleaning up resources
   */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
