import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceabilityPlanComponent } from './serviceability-plan.component';

describe('ServiceabilityPlanComponent', () => {
  let component: ServiceabilityPlanComponent;
  let fixture: ComponentFixture<ServiceabilityPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceabilityPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceabilityPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  
});
