import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RevenueRecognitionService } from '@cpdm-service/general-compliance/revenue-recognition/revenue-recognition.service';
import { AppModule } from 'src/app/app.module';
import { RevenueRecognitionModule } from '../revenue-recognition.module';

import { FmvAssessmentComponent } from './fmv-assessment.component';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { DocCentralService } from '@cpdm-service/shared/doc-central.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDetailService } from '@cpdm-service/project/project-details.service';
import { MatDialog } from '@angular/material';

describe('FmvAssessmentComponent', () => {
  let component: FmvAssessmentComponent;
  let fixture: ComponentFixture<FmvAssessmentComponent>;
  let testBedService1: RevenueRecognitionService = null;
  let testBedService2: ToastService = null;
  let testBedService3: ActivatedRoute = null;
  let testBedService4: ProjectsDetailService = null;
  let testBedService5: DocCentralService = null;
  let testBedService6: MatDialog = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule, RevenueRecognitionModule, HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmvAssessmentComponent);
    component = fixture.componentInstance;
    testBedService1 = TestBed.get(RevenueRecognitionService);
    testBedService2 = TestBed.get(ToastService);
    testBedService3 = TestBed.get(ActivatedRoute);
    testBedService4 = TestBed.get(ProjectsDetailService);
    testBedService5 = TestBed.get(DocCentralService);
    testBedService6 = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject RevenueRecognitionService', inject ([RevenueRecognitionService], (injectService: RevenueRecognitionService) => {
    expect(injectService).toBe(testBedService1);
  }));

  it('should inject ToastService', inject ([ToastService], (injectService: ToastService) => {
    expect(injectService).toBe(testBedService2);
  }));
   
  it('should inject ActivatedRoute', inject ([ActivatedRoute], (injectService: ActivatedRoute) => {
    expect(injectService).toBe(testBedService3);
  }));

  it('should inject ProjectsDetailService', inject ([ProjectsDetailService], (injectService: ProjectsDetailService) => {
    expect(injectService).toBe(testBedService4);
  }));

  it('should inject DocCentralService', inject ([DocCentralService], (injectService: DocCentralService) => {
    expect(injectService).toBe(testBedService5);
  }));

  it('should inject MatDialog', inject ([MatDialog], (injectService: MatDialog) => {
    expect(injectService).toBe(testBedService6);
  }));

  it('should have cui-spinner', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.flex-center')).not.toBeNull();
  });

  it('should call next of unsubscribe subject in ngOnDestroy once', () => {
    spyOn(component.unsubscribe$, 'next');
    component.ngOnDestroy();
    expect(component.unsubscribe$.next).toHaveBeenCalledTimes(1);
  });

  it('should call complete of unsubscribe subject in ngOnDestroy once', () => {
    spyOn(component.unsubscribe$, 'complete');
    component.ngOnDestroy();
    expect(component.unsubscribe$.complete).toHaveBeenCalledTimes(1);
  });
});
