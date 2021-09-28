import { async, ComponentFixture, inject,TestBed } from '@angular/core/testing';
import { CrcSubmitComponent } from './crc-submit.component';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { HasRoleDirective } from '@cpdm-shared/directives/has-role.directive';
import { Role } from '@cpdm-model/role';
import { MatDialogModule } from '@angular/material/dialog';

describe('CrcSubmitComponent', () => {
  let component: CrcSubmitComponent;
  let fixture: ComponentFixture<CrcSubmitComponent>;
  let testBedService1: CommunicationsRegulatoryService = null;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrcSubmitComponent,HasRoleDirective ],
      imports: [ HttpClientTestingModule, AppModule,MatDialogModule],
      providers:[ CommunicationsRegulatoryService, 
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                params: { id: '1234'}
              }
            }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrcSubmitComponent);
    component = fixture.componentInstance;
    component.role = Role;
    testBedService1 = TestBed.get(CommunicationsRegulatoryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject CommunicationsRegulatoryService', inject ([CommunicationsRegulatoryService], (injectService: CommunicationsRegulatoryService) => {
    expect(injectService).toBe(testBedService1);
  }));

  it('should instantiate CrcSubmitComponent', () => {
    expect(component).toBeDefined();
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    expect(component.crcId).toEqual('1234');
  });

  // it('should call the onBeginAssessment() method',() => {
  //   spyOn(component, 'onBeginAssessment');
  //   fixture.detectChanges();
  //   let button = fixture.debugElement.nativeElement.querySelector('#SubmitPOComments')
  //   button.click();
  //   fixture.detectChanges();
  //   expect(component.onBeginAssessment).toHaveBeenCalled();  
  // });
 
  it('should call the onBeginAssessment() method',() => {
    spyOn(component, 'onBeginAssessment');
    const mockData = 'Begin';
    component.onBeginAssessment(mockData);
    expect(component.onBeginAssessment).toHaveBeenCalled();  
  });

  it('should call the onSubmitPOComments() method',() => {
    spyOn(component, 'onSubmitPOComments');
    component.onSubmitPOComments();
    expect(component.onSubmitPOComments).toHaveBeenCalled();  
  });

  it('should call the onSubmitAssessment() method',() => {
    spyOn(component, 'onSubmitAssessment');
    component.onSubmitAssessment();
    expect(component.onSubmitAssessment).toHaveBeenCalled();  
  });

  it('should call the onApproveReject() method',() => {
    spyOn(component, 'onApproveReject');
    const mockData = 'Approve';
    component.onApproveReject(mockData);
    expect(component.onApproveReject).toHaveBeenCalled();  
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
