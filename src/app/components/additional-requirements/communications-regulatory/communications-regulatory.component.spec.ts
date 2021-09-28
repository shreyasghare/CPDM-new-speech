import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationsRegulatoryService } from '@cpdm-service/additional-requirements/communications-regulatory/communications-regulatory.service';
import { ToastService } from '@cpdm-service/shared/toast.service';
import { AppModule } from 'src/app/app.module';

import { CommunicationsRegulatoryComponent } from './communications-regulatory.component';
import { CommunicationsRegulatoryModule } from './communications-regulatory.module';

describe('CommunicationsRegulatoryComponent', () => {
  let component: CommunicationsRegulatoryComponent;
  let fixture: ComponentFixture<CommunicationsRegulatoryComponent>;
  let testBedService1: CommunicationsRegulatoryService = null;
  let testBedService2: ToastService = null;
  let testBedService3: ActivatedRoute = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppModule,
        CommunicationsRegulatoryModule
      ],
      providers: [CommunicationsRegulatoryService, {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: { id: '223344' }
          }
        }
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationsRegulatoryComponent);
    component = fixture.componentInstance;
    testBedService1 = TestBed.get(CommunicationsRegulatoryService);
    testBedService2 = TestBed.get(ToastService);
    testBedService3 = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject RevenueRecognitionService', inject ([CommunicationsRegulatoryService], (injectService: CommunicationsRegulatoryService) => {
    expect(injectService).toBe(testBedService1);
  }));

  it('should inject ToastService', inject ([ToastService], (injectService: ToastService) => {
    expect(injectService).toBe(testBedService2);
  }));
   
  it('should inject ActivatedRoute', inject ([ActivatedRoute], (injectService: ActivatedRoute) => {
    expect(injectService).toBe(testBedService3);
  }));

  it('should instantiate CommunicationsRegulatoryComponent', () => {
    expect(component).toBeDefined();
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    expect(component.crcId).toEqual('223344');
  });

  it ('should call onUpdate() on "update" button click', () => {
    spyOn(component, 'onUpdate');
    expect(fixture.debugElement.nativeElement.querySelector('#updateBtn')).toBeFalsy;
  });

  it ('should call openHelpOverlayModal() on "Overview" button click', () => {
    spyOn(component, 'openHelpOverlayModal');
    const btn = fixture.debugElement.nativeElement.querySelector('#helpModal');
    btn.click();
    expect(component.openHelpOverlayModal).toHaveBeenCalledTimes(1);
  });

  it('should have process-sidebar', () => {
    const sidebar = fixture.debugElement.nativeElement.querySelector('#processSidebar');
    expect(sidebar).toBeTruthy();
    expect(sidebar.innerHTML).not.toBeNull();
    expect(sidebar.innerHTML.length).toBeGreaterThan(0);
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
