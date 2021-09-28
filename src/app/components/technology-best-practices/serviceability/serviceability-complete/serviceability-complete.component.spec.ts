import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceabilityCompleteComponent } from './serviceability-complete.component';

describe('ServiceabilityCompleteComponent', () => {
  let component: ServiceabilityCompleteComponent;
  let fixture: ComponentFixture<ServiceabilityCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceabilityCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceabilityCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*it('should create', () => {
    expect(component).toBeTruthy();
  });*/
});
