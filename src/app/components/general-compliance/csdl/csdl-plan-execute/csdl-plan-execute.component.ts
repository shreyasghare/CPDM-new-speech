import { Component, OnInit } from '@angular/core';
import { CsdlService } from '@cpdm-service/general-compliance/csdl/csdl.service';
import { getNestedKeyValue } from '@cpdm-shared/utils/utils';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CsdlModel, CsdlPlanExecuteModel } from '@cpdm-model/general-compliances/csdl/csdl.model';
import { ToastService } from '@cpdm-service/shared/toast.service';

@Component({
  selector: 'app-csdl-plan-execute',
  templateUrl: './csdl-plan-execute.component.html',
  styleUrls: ['./csdl-plan-execute.component.scss']
})
export class CsdlPlanExecuteComponent implements OnInit {
  csdlID: string;
  csdlSiProjectId: string;
  unsubscribe$ = new Subject();
  csdlDataSubscription: Subscription;
  csdlSiInfoSubscription: Subscription;
  csdlPlanExecuteData: CsdlPlanExecuteModel;
  imgSrc: string;
  isStopShipNotApproved: boolean | undefined;
  csdlDataFromDb: CsdlModel;
  isSiError = false;
  planExecuteDetailsKeys = ['CSDL ID', 'SI Project Name', 'First Customer Ship Target Date',
                            'Current Security Readiness Plan (SRP) Status', 'Stop Ship', 
                            'Product Security Baseline (PSB) Compliance Score',
                            'Critical Product Security Baseline (PSB) Gap', 
                            'Accountable Executive'];

  constructor(private activatedRoute: ActivatedRoute,
              private csdlService: CsdlService,
              private toastService: ToastService) { }

  ngOnInit() {
    this.getCsdlInfo();
  }

  getCsdlInfo(): void { 
    this.csdlID = this.activatedRoute.snapshot.parent.params.id;
    this.csdlService.getCsdlData(this.csdlID).pipe(takeUntil(this.unsubscribe$)).subscribe((res) =>{
      let { success, data } = res;
      if (success) {
        this.csdlDataFromDb = data;
        this.csdlSiProjectId = getNestedKeyValue(data, 'csdlProjectId');
        if (getNestedKeyValue(this.csdlService.csdlPlanData, 'project_id') === this.csdlSiProjectId
            && getNestedKeyValue(this.csdlService.csdlPlanData, 'csdlWorkflowId') === this.csdlID
            && getNestedKeyValue(this.csdlService.csdlPlanData, 'isSetFromPlanStep')) {
              this.csdlPlanExecuteData = this.csdlService.csdlPlanData;
              this.manageStopShip(this.csdlPlanExecuteData);
        } else {
          this.csdlService.getCsdlPlanExecuteDataFromSi(this.csdlID, this.csdlSiProjectId, 'all')
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((res) => {
            const { success, data } = res;
            if (success) {
              this.csdlPlanExecuteData = data;
              this.csdlPlanExecuteData.csdlWorkflowId = this.csdlID;
              this.csdlPlanExecuteData.isSetFromPlanStep = true;
              this.csdlService.setCsdlPlanData(this.csdlPlanExecuteData);
              this.manageStopShip(data);
            }
          }, (err) => {
            if (getNestedKeyValue(err, 'status') >= 500) {
              this.isSiError = true;
            } else {
              this.toastService.show('Error in data fetching', 'Error fetching the Plan and Execute Data', 'danger');
            }
          });
        }
      }
    }, () => {
      this.toastService.show('Error in data fetching', 'Error fetching the CSDL Data', 'danger');
    });
  }

  private manageStopShip(csdlDataFromSi) {
    this.isStopShipNotApproved = getNestedKeyValue(csdlDataFromSi, 'src', 'src', 'stop_ship');
    if (typeof this.isStopShipNotApproved !== 'undefined') {
      this.isStopShipNotApproved  ? this.imgSrc = String.raw`assets\images\csdl\svg\waiting-status.svg`
                                  : this.imgSrc = String.raw`assets\images\csdl\svg\approved-status.svg`;
      if (!this.isStopShipNotApproved && getNestedKeyValue(csdlDataFromSi, 'workflow', 'next') ) { 
        if (this.csdlDataFromDb.workflow) {
          this.csdlDataFromDb.workflow.next = getNestedKeyValue(csdlDataFromSi, 'workflow', 'next');
          this.csdlService.updateCsdlData(this.csdlDataFromDb);
        }
      }
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
