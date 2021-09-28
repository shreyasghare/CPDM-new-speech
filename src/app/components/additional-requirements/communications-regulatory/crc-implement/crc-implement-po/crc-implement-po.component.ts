import { Component, EventEmitter, OnInit,Output,TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserDetailsService } from '@cpdm-service/auth/user-details.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CommunicationsRegulatoryModel, ImplementModel } from '@cpdm-model/additional-requirements/communications-regulatory/communicationsRegulatory.model';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../confirmation/confirmation.component'
import { UtilsService } from '@cpdm-service/shared/utils.service';
@Component({
  selector: 'app-crc-implement-po',
  templateUrl: './crc-implement-po.component.html',
  styleUrls: ['./crc-implement-po.component.scss']
})
export class CrcImplementPoComponent implements OnInit {
  @Output() submitAction: EventEmitter<CommunicationsRegulatoryModel> = new EventEmitter<CommunicationsRegulatoryModel>();
  crcStatus = {
    comment: {
    icon: 'chat',
    status: `Provide comments (if any)`
    },action:{
      icon: '',
      status:'Choose an action'
    }}
    isSubmitDisabled: boolean = true;
    crcId: string;
    crcData: CommunicationsRegulatoryModel;
    destroy$: Subject<boolean> = new Subject<boolean>();
    implementationStatus: string = 'ppp';
    isUpdatingApproval: boolean = false;
    poApprove: string;
    poComment: string;
    poComments: string;
    moveToIdentify: string;
    requirementsImplementedDetails: string;
    defectsFixedDetails: string;  
    commentedBy: string;
    commentedOn: string;

    naHoldingMsg = {
      statusIcon: 'notApplicable',
      status: 'Communication Regulatory Compliance is \'Not applicable\'',
      message: 'The Assessment Questionnaire indicates that the Communications Regulatory Compliance policy is ‘Not Applicable’ for this project. Please direct all questions to <a href=\'mailto:comm-reg-legal@clsco.com\'>comm-reg-legal@clsco.com</a>.'
    };

    templates: Array<{ name: string, value: string }> = [
      { name: 'Rally Template', value: 'Rally' },
      { name: 'Jira Template', value: 'Jira' },
      { name: 'PRD Template', value: 'PRD' }
    ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetailsService: UserDetailsService,
    private crcService: CommunicationsRegulatoryService,
    private toastService: ToastService,
    private utilsService: UtilsService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.crcId = this.activatedRoute.snapshot.parent.params.id; 
    this.getCrcDataSub();
  }

  /**
   * @description Get CRC details data from subject
   */
  private getCrcDataSub() {
    this.crcService.getCrcDataSub
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.crcData = res;
        if(!getNestedKeyValue(res, 'crcAssessmentQuestionnaire', 'isApplicable') || getNestedKeyValue(res, 'crcAssessmentQuestionnaire', 'isApplicable') === undefined){
          this.implementationStatus =  'notRequired' ;
        }else{
          this.implementationStatus = getNestedKeyValue(this.crcData, 'implement', 'implementStatus');     
          let implimentReportObj = getNestedKeyValue(this.crcData,'implement', 'report');
          this.requirementsImplementedDetails = getNestedKeyValue(implimentReportObj, "requirementImplemented");
          this.defectsFixedDetails = getNestedKeyValue(implimentReportObj, "defectFixed");   
          this.poComments = getNestedKeyValue(implimentReportObj, "poComments");
        }  
      }
    });
  }

  updateApproval(){
    this.isUpdatingApproval = true;
    let obj = {
        crcId: this.crcId,
        projectId: this.crcData.projectId,
        emailTemplate: this.poApprove === 'approved' ? 'AcceptImplementationReport' : 'RejectImplementationReport',
        implement:{
          implementStatus: this.poApprove,          
          report:{
            poComments:{
              status: this.poApprove,
              comment: this.poComment,
              commentedOn: new Date(),
              commentedBy: this.userDetailsService.getLoggedInCecId(),
              commentForIdentify: this.moveToIdentify === 'yes' ? true : false,
            },          
          moveToIdentify: this.moveToIdentify === 'yes' ? true : false,
          updatedOn: new Date()
        }      
      }      
    }

    let confirmationObj = { title: '', desc: ''};

    if(this.moveToIdentify === 'yes') {
      confirmationObj.title = "Confirmation: Reject with additions to the Recommendations list",
      confirmationObj.desc = "By selecting to 'Reject the Implementation Report with changes', the process will move to Step 2: Identify step.  The current recommendations list is retained and allows new recommendation(s)."
    }else{
      confirmationObj.title = "Confirmation: Reject Implementation Report",
      confirmationObj.desc = "By selecting to 'Reject' the Implementation Report. The Project Team will address any gaps before resubmitting the Implementation Report for approval. The process will remain in Step 3: Implement step."
    }
    if(this.poApprove ==='rejected'){
      const dialogReference: MatDialogRef<any, any> = this.dialog.open(ConfirmationComponent,
        { data: confirmationObj, width: '45vw', height: 'auto', disableClose: true });

      dialogReference.afterClosed().subscribe(result => {
        if(result){
          this.crcService.sendImplReport(obj)
          .pipe(takeUntil(this.destroy$))
          .subscribe( res=>{
            this.isUpdatingApproval = false;
            this.crcData = res.data;
            this.implementationStatus = getNestedKeyValue(this.crcData, 'implement', 'implementStatus');     
            let implimentReportObj = getNestedKeyValue(this.crcData,'implement', 'report');
            this.requirementsImplementedDetails = getNestedKeyValue(implimentReportObj, "requirementImplemented");
            this.defectsFixedDetails = getNestedKeyValue(implimentReportObj, "defectFixed");   
            this.poComments = getNestedKeyValue(implimentReportObj, "poComments");
            if (getNestedKeyValue(this.crcData, 'implement', 'report', 'moveToIdentify')) {
              this.crcData.isTimestampAdded = true;
              this.crcData.switchToStep = 'identify';
              this.submitAction.emit(this.crcData);
            }
          }, err =>{
            this.toastService.show('Error', 'Error submitting review', 'danger');
            this.isUpdatingApproval = false
          })
        }else{
          this.isUpdatingApproval = false;
        }
      });
    }else{
      this.crcService.sendImplReport(obj)
      .pipe(takeUntil(this.destroy$))
      .subscribe( res=>{
        this.isUpdatingApproval = false;
        this.crcData = res.data;
        this.implementationStatus = getNestedKeyValue(this.crcData, 'implement', 'implementStatus');     
        let implimentReportObj = getNestedKeyValue(this.crcData,'implement', 'report');
        this.requirementsImplementedDetails = getNestedKeyValue(implimentReportObj, "requirementImplemented");
        this.defectsFixedDetails = getNestedKeyValue(implimentReportObj, "defectFixed");  
        this.poComments = getNestedKeyValue(implimentReportObj, "poComments");
        this.crcData.isTimestampAdded = true;
        this.submitAction.emit(this.crcData);
      }, err =>{
        this.toastService.show('Error', 'Error submitting review', 'danger');
        this.isUpdatingApproval = false
      })
    }
  
  }

  poApprovalChange(){
    if(this.poApprove === 'approved'){
      this.crcStatus.comment.status = `Provide comments (if any)`;
      this.crcStatus.action.status=`Choose an action`;
      this.isSubmitDisabled = false;
    }else{
      this.isSubmitDisabled = true;      
      this.crcStatus.comment.status = `<div>Provide comments <span class="text-danger">*</span><span class="text-danger text-size-14 text-weight-400 ml-1">NOTE: An explanation is required when selecting 'Reject'</span></div>`;      
      this.crcStatus.action.status = `<div>Choose an action <span class="text-danger">*</span><span class="text-danger text-size-14 text-weight-400 ml-1">NOTE: An action is required when selecting 'Reject'</span></div>`;
    }
  }

  getRejectInput(){
    if(this.poApprove === 'rejected'){
      if(this.poComment && this.poComment.length){
        this.crcStatus.comment.status = `<div>Provide comments <span class="text-danger text-size-14 text-weight-400 ml-1">NOTE: An explanation is required when selecting 'Reject'</span></div>`;
      }else{
        this.crcStatus.comment.status = `<div>Provide comments <span class="text-danger">*</span><span class="text-danger text-size-14 text-weight-400 ml-1">NOTE: An explanation is required when selecting 'Reject'</span></div>`;  
      }
      if(this.moveToIdentify != undefined){
        this.crcStatus.action.status = `<div>Choose an action <span class="text-danger text-size-14 text-weight-400 ml-1">NOTE: An action is required when selecting 'Reject'</span></div>`;  
      }
      this.isSubmitDisabled = (this.poComment && this.poComment.length && this.moveToIdentify) ? false : true ;
    }
  }

  /**
     * Downloads Smart Licensing template CSV file
     */
  async onDownloadTemplate(event: { selectedTemplate: string, selectedLanguage: string }) {
    try {
        this.utilsService.downloadFileFromNode(`generateCSV/${event.selectedTemplate.toLowerCase()}crc/${this.crcData._id}`, `${event.selectedTemplate}SLImportTemplate.csv`);
    } catch (error) {
        console.error(error);
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
