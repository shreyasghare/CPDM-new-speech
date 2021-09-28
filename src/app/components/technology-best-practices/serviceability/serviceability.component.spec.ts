import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceabilityComponent } from './serviceability.component';

describe('ServiceabilityComponent', () => {
  let component: ServiceabilityComponent;
  let fixture: ComponentFixture<ServiceabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
